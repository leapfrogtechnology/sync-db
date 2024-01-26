import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { synchronize } from '../../api';
import { loadConfig, resolveConnections } from '../../config';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printInfo, printLine } from '../../util/io';
import { dbLogger, log } from '../../util/logger';
import { getElapsedTime } from '../../util/ts';

class Synchronize extends Command {
  static description = 'Synchronize all the configured database connections.';

  /**
   * Available CLI flags.
   */
  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    'dry-run': Flags.boolean({ default: false, description: 'Dry run synchronization.' }),
    force: Flags.boolean({ char: 'f', description: 'Force synchronization.' }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    }),
    'skip-migration': Flags.boolean({ description: 'Skip running migrations.' })
  };

  /**
   * Failure handler for the whole process - if the process failed.
   */
  onFailed = async (result: OperationResult) => {
    printLine(chalk.red(`   [✖] Synchronization - failed (${result.timeElapsed}s)\n`));
  };

  /**
   * Migration failure handler.
   */
  onMigrationFailed = async (result: OperationResult) => {
    printLine(chalk.red(`   [✖] Migrations - failed (${result.timeElapsed}s)`));
  };

  /**
   * Migration success handler.
   */
  onMigrationSuccess = async (result: OperationResult) => {
    const logDb = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    logDb('Up to date: ', alreadyUpToDate);

    if (alreadyUpToDate) {
      printLine(chalk.green('   [✓] Migrations - up to date') + ` (${result.timeElapsed}s)`);

      return;
    }

    printLine(chalk.green(`   [✓] Migrations - ${list.length} run`) + ` (${result.timeElapsed}s)`);

    // Completed migrations.
    for (const item of list) {
      printLine(chalk.cyan(`       - ${item}`));
    }
  };

  /**
   * Prune success handler.
   */
  onPruneSuccess = (result: OperationResult) =>
    printLine(chalk.green('   [✓] Synchronization - pruned') + ` (${result.timeElapsed}s)`);

  /**
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));
    await printInfo('   [✓] Synchronization - started');
  };

  /**
   * Success handler for the whole process - after all completed.
   */
  onSuccess = async (result: OperationResult) => {
    printLine(chalk.green('   [✓] Synchronization - completed') + ` (${result.timeElapsed}s)\n`);
  };

  /**
   * Check the results for each connection and display them.
   * All the successful / failed attempts are displayed and errors are logged.
   *
   * @param {SyncResult[]} results
   * @returns {Promise<{ totalCount: number, failedCount: number, successfulCount: number }>}
   */
  async processResults(
    results: OperationResult[]
  ): Promise<{ failedCount: number; successfulCount: number; totalCount: number }> {
    const totalCount = results.length;
    const failedAttempts = results.filter(result => !result.success);
    const successfulCount = totalCount - failedAttempts.length;
    const failedCount = totalCount - successfulCount;
    const allComplete = failedCount === 0;

    // If there are errors, display all of them.
    if (!allComplete) {
      printLine(`Synchronization failed for ${failedCount} connection(s):\n`);

      for (const attempt of failedAttempts) {
        printLine(chalk.bold(` ▸ ${attempt.connectionId}\n`));
        printError(attempt.error);

        // Send verbose error with stack trace to debug logs.
        log(attempt.error);

        printLine();
      }
    }

    return { failedCount, successfulCount, totalCount };
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(Synchronize);
    const isDryRun = parsedFlags['dry-run'];

    try {
      const config = await loadConfig(parsedFlags.config);
      const connections = await resolveConnections(config, parsedFlags['connection-resolver']);
      const timeStart = process.hrtime();

      if (isDryRun) printLine(chalk.magenta('\n• DRY RUN STARTED\n'));

      printLine('Synchronizing...\n');

      const results = await synchronize(config, connections, {
        ...parsedFlags,
        onFailed: this.onFailed,
        onMigrationFailed: this.onMigrationFailed,
        onMigrationSuccess: this.onMigrationSuccess,
        onStarted: this.onStarted,
        onSuccess: this.onSuccess,
        onTeardownSuccess: this.onPruneSuccess
      });

      const { failedCount, successfulCount, totalCount } = await this.processResults(results);

      if (successfulCount > 0) {
        // Display output.
        printLine(
          `Synchronization complete for ${successfulCount} / ${totalCount} connection(s). ` +
            `(${getElapsedTime(timeStart)}s)\n`
        );
      }

      // If all completed successfully, exit gracefully.
      if (failedCount === 0) {
        if (isDryRun) printLine(chalk.magenta('• DRY RUN ENDED\n'));

        // eslint-disable-next-line unicorn/no-process-exit
        return process.exit(0);
      }

      throw new Error(`Synchronization failed for ${failedCount} / ${totalCount} connections.`);
    } catch (error) {
      // Send verbose error with stack trace to debug logs.
      log(error);

      printError(error.toString());

      if (isDryRun) printLine(chalk.magenta('\n• DRY RUN ENDED\n'));

      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(-1);
    }
  }
}

export default Synchronize;
