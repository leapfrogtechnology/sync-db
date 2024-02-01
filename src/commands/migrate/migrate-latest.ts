import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig, resolveConnections } from '../..';
import { migrateLatest } from '../../api';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printInfo, printLine } from '../../util/io';
import { dbLogger } from '../../util/logger';

/**
 * Represents a command to run the migrations up to the latest changes.
 */
/**
 * Represents a command to run the migrations up to the latest changes.
 */
class MigrateLatest extends Command {
  static description = 'Run the migrations up to the latest changes.';

  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    'dry-run': Flags.boolean({ default: false, description: 'Dry run migration.' }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    })
  };

  /**
   * Failure handler.
   *
   * @returns {void}
   */
  onFailed = () => {
    printLine(chalk.bold(chalk.red(`   [✓] Migration - Failed\n`)));
  };

  /**
   * Event handler for the start of the operation.
   *
   * @param {OperationResult} result - The result object of the operation, which includes the connectionId.
   * @returns {void}
   */
  onStarted = (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));

    printInfo('   [✓] Migration - started');
  };

  /**
   * Event handler for the successful completion of the operation.
   *
   * @param {OperationResult} result - The result object of the operation, which includes the connectionId, data, and timeElapsed.
   * @returns {Promise<void>} - A Promise that resolves when the operation is successfully completed.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    log('Up to date: ', alreadyUpToDate);

    printInfo(`   [✓] Migration - completed (${result.timeElapsed}s)`);

    if (alreadyUpToDate) {
      printInfo('   Already up to date.\n');

      return;
    }

    // Completed migrations.
    for (const item of list) {
      printLine(chalk.cyan(`       - ${item}`));
    }

    printInfo(`   Ran ${list.length} migrations.\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>} - A Promise that resolves when the operation is successfully completed.
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MigrateLatest);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);

    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN STARTED\n'));

    const results = await migrateLatest(config, connections, {
      ...parsedFlags,
      onFailed: this.onFailed,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) printLine(chalk.magenta('• DRY RUN ENDED\n'));

      // eslint-disable-next-line unicorn/no-process-exit
      return process.exit(0);
    }

    printError(`Error: Migration failed for ${failedCount} connection(s).`);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default MigrateLatest;
