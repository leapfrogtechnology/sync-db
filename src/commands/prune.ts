import { bold, magenta, red } from 'chalk';
import { Command, flags } from '@oclif/command';

import { prune } from '../api';
import { CONFIG_FILENAME } from '../constants';
import { loadConfig, resolveConnections } from '..';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class Prune extends Command {
  static description = 'Drop all the synchronized db objects except the ones created via migrations.';

  static flags = {
    'dry-run': flags.boolean({ description: 'Dry run prune.', default: false }),
    only: flags.string({
      helpValue: 'CONNECTION_ID',
      description: 'Filter only a single connection.'
    }),
    'connection-resolver': flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
    }),
    config: flags.string({
      char: 'c',
      default: CONFIG_FILENAME,
      description: 'Custom configuration file.'
    })
  };

  /**
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));
    await printInfo('   [✓] Pruning - started');
  };

  /**
   * Success handler.
   */
  onSuccess = (result: OperationResult) => printInfo(`   [✓] Pruning - completed (${result.timeElapsed}s)\n`);

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    await printLine(red(`   [✖] Pruning - failed (${result.timeElapsed}s)\n`));

    await printError(`   ${result.error}\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(Prune);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) await printLine(magenta('\n• DRY RUN STARTED\n'));

    const results = await prune(config, connections, {
      ...parsedFlags,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) await printLine(magenta('• DRY RUN ENDED\n'));

      return process.exit(0);
    }

    printError(`Error: Prune failed for ${failedCount} connection(s).`);

    if (isDryRun) await printLine(magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default Prune;
