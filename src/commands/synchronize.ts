import { Command, flags } from '@oclif/command';

import { log } from '../util/logger';
import { handleFlags } from '../cli';
import { getElapsedTime } from '../util/ts';
import SyncResult from '../domain/SyncResult';
import { printError, printLine } from '../util/io';
import ExecutionContext from '../domain/ExecutionContext';
import { loadConfig, resolveConnections } from '../config';

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
    'skip-migration': flags.boolean({ description: 'Skip running migrations.' }),
    'generate-connections': flags.boolean({ char: 'c', description: 'Generate connections' })
  };

  /**
   * Success handler for each connection.
   */
  onSuccess = (context: ExecutionContext) =>
    printLine(`  [✓] ${context.connectionId} - Successful (${context.timeElapsed}s)`);

  /**
   * Failure handler for each connection.
   */
  onFailed = (context: ExecutionContext) =>
    printLine(`  [✖] ${context.connectionId} - Failed (${context.timeElapsed}s)`);

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

    await printLine();

    // If there are errors, display all of them.
    if (!allComplete) {
      await printLine(`Synchronization failed for ${failedCount} connection(s):\n`);

      failedAttempts.forEach(async (attempt, index) => {
        await printLine(`${index + 1}) ${attempt.connectionId}`);
        await printError(attempt.error.toString());

        // Send verbose error with stack trace to debug logs.
        log(attempt.error);

        await printLine();
      });
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
    const params = {
      ...parsedFlags,
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    };

    try {
      await handleFlags(parsedFlags, params);

      const config = await loadConfig();
      const connections = await resolveConnections();
      const { synchronize } = await import('../api');
      const timeStart = process.hrtime();

      await printLine('Synchronizing...\n');

      const results = await synchronize(config, connections, params);

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
