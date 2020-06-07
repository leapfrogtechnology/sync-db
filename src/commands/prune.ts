import { bold, red } from 'chalk';
import { Command, flags } from '@oclif/command';

import { prune } from '../api';
import { printLine, printError } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import OperationResult from '../domain/operation/OperationResult';

class Prune extends Command {
  static description = 'Drop all the synchronized db objects except the ones created via migrations.';

  static flags = {
    only: flags.string({
      helpValue: 'CONNECTION_ID',
      description: 'Filter only a single connection.'
    }),
    'connection-resolver': flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
    })
  };

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
    const { flags: parsedFlags } = this.parse(Prune);
    const config = await loadConfig();
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    const results = await prune(config, connections, {
      ...parsedFlags,
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
