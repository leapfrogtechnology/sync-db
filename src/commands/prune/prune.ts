import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig, resolveConnections } from '../..';
import { prune } from '../../api';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printInfo, printLine } from '../../util/io';

class Prune extends Command {
  static description = 'Drop all the synchronized db objects except the ones created via migrations.';

  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    'dry-run': Flags.boolean({ default: false, description: 'Dry run prune.' }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    })
  };

  /**
   * Failure handler.
   *
   * @param {OperationResult} result - The result object of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  onFailed = (result: OperationResult) => {
    printLine(chalk.red(`   [✖] Pruning - failed (${result.timeElapsed}s)\n`));

    printError(`   ${result.error}\n`);
  };

  /**
   * Started event handler.
   *
   * @param {OperationResult} result - The result object of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  onStarted = (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));

    printInfo('   [✓] Pruning - started');
  };

  /**
   * Success handler.
   *
   * @param {OperationResult} result - The result object of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  onSuccess = (result: OperationResult) => printInfo(`   [✓] Pruning - completed (${result.timeElapsed}s)\n`);

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(Prune);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN STARTED\n'));

    const results = await prune(config, connections, {
      ...parsedFlags,
      onFailed: this.onFailed,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) printLine(chalk.magenta('• DRY RUN ENDED\n'));

      return process.exit(0);
    }

    printError(`Error: Prune failed for ${failedCount} connection(s).`);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default Prune;
