import { bold, cyan, red, green } from 'chalk';
import { Command, flags } from '@oclif/command';

import { getElapsedTime } from '../util/ts';
import SyncResult from '../domain/SyncResult';
import { log, dbLogger } from '../util/logger';
import { MigrationResult } from '../service/knexMigrator';
import ExecutionContext from '../domain/ExecutionContext';
import { loadConfig, resolveConnections } from '../config';
import { printError, printLine, printInfo } from '../util/io';
import { synchronize } from '../api';

/**
 * Synchronize command handler.
 */
class Synchronize extends Command {
  static description = 'Synchronize database';

  /**
   * Available CLI flags.
   */
  static flags = {
    version: flags.version({ char: 'v', description: 'Print version', name: 'sync-db' }),
    help: flags.help({ char: 'h', description: 'Print help information' }),
    force: flags.boolean({ char: 'f', description: 'Force synchronization' }),
    'skip-migration': flags.boolean({ description: 'Skip running migrations' })
  };

  onStarted = async (context: ExecutionContext) => {
    await printLine(bold(` ▸ ${context.connectionId}`));
    await printInfo('   [✓] Synchronization - started');
  };

  onPruneSuccess = (context: ExecutionContext) =>
    printLine(green('   [✓] Synchronization - pruned') + ` (${context.timeElapsed}s)`);

  /**
   * Success handler for migration run during sync process.
   */
  onMigrationSuccess = async (result: MigrationResult) => {
    const logDb = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    logDb('Up to date: ', alreadyUpToDate);

    if (alreadyUpToDate) {
      await printLine(green('   [✓] Migrations - up to date') + ` (${result.timeElapsed}s)`);

      return;
    }

    await printLine(green(`   [✓] Migrations - ${list.length} run`) + ` (${result.timeElapsed}s)`);

    // Completed migrations.
    for (const item of list) {
      await printLine(cyan(`       - ${item}`));
    }
  };

  /**
   * Failure handler for migration during sync process.
   */
  onMigrationFailed = async (result: MigrationResult) => {
    await printLine(red(`   [✖] Migrations - failed (${result.timeElapsed}s)\n`));

    // await printError(`   ${result.error}\n`);
  };

  /**
   * Success handler for each connection.
   */
  onSuccess = (context: ExecutionContext) =>
    printLine(green('   [✓] Synchronization - completed') + ` (${context.timeElapsed}s)\n`);

  /**
   * Failure handler for each connection.
   */
  onFailed = async (result: ExecutionContext) => {
    await printLine(red(`   [✖] Synchronization - failed (${result.timeElapsed}s)\n`));
  };

  /**
   * Check the results for each connection and display them.
   * All the successful / failed attempts are displayed and errors are logged.
   *
   * @param {SyncResult[]} results
   * @returns {Promise<{ totalCount: number, failedCount: number, successfulCount: number }>}
   */
  async processResults(
    results: SyncResult[]
  ): Promise<{ totalCount: number; failedCount: number; successfulCount: number }> {
    const totalCount = results.length;
    const failedAttempts = results.filter(result => !result.success);
    const successfulCount = totalCount - failedAttempts.length;
    const failedCount = totalCount - successfulCount;
    const allComplete = failedCount === 0;

    // If there are errors, display all of them.
    if (!allComplete) {
      await printLine(`Synchronization failed for ${failedCount} connection(s):\n`);

      for (const attempt of failedAttempts) {
        await printLine(bold(` ▸ ${attempt.connectionId}\n`));
        await printError(attempt.error.toString());

        // Send verbose error with stack trace to debug logs.
        log(attempt.error);

        await printLine();
      }
    }

    return { totalCount, failedCount, successfulCount };
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(Synchronize);

    try {
      const config = await loadConfig();
      const connections = await resolveConnections();
      const timeStart = process.hrtime();

      await printLine('Synchronizing...\n');

      const results = await synchronize(config, connections, {
        ...parsedFlags,
        onStarted: this.onStarted,
        onTeardownSuccess: this.onPruneSuccess,
        onSuccess: this.onSuccess,
        onFailed: this.onFailed,
        onMigrationSuccess: this.onMigrationSuccess,
        onMigrationFailed: this.onMigrationFailed
      });

      const { totalCount, failedCount, successfulCount } = await this.processResults(results);

      if (successfulCount > 0) {
        // Display output.
        await printLine(
          `Synchronization complete for ${successfulCount} / ${totalCount} connection(s). ` +
            `(${getElapsedTime(timeStart)}s)`
        );
      }

      // If all completed successfully, exit gracefully.
      if (failedCount === 0) {
        return process.exit(0);
      }

      throw new Error(`Synchronization failed for ${failedCount} / ${totalCount} connections.`);
    } catch (e) {
      // Send verbose error with stack trace to debug logs.
      log(e);

      await printError(e.toString());

      process.exit(-1);
    }
  }
}

export default Synchronize;
