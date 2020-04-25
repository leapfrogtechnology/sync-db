import { bold, red } from 'chalk';
import { Command } from '@oclif/command';

import { prune } from '../api';
import { printLine, printError } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import OperationResult from '../domain/operation/OperationResult';

class Prune extends Command {
  static description = 'Drop all the synchronized db objects except the ones created via migrations.';

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId} - Successful`) + ` (${result.timeElapsed}s)`);
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    await printLine(bold(red(` ▸ ${result.connectionId} - Failed`)));

    await printError(`   ${result.error}\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const config = await loadConfig();
    const connections = await resolveConnections();

    const results = await prune(config, connections, {
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      return process.exit(0);
    }

    printError(`Error: Prune failed for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default Prune;
