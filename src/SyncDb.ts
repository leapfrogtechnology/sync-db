import { Command, flags } from '@oclif/command';

import { log } from './logger';
import { handleFlags } from './cli';
import SyncResult from './domain/SyncResult';
import SyncParams from './domain/SyncParams';
import { printError, printLine } from './util/io';
import ExecutionContext from './domain/ExecutionContext';
import { loadConfig, resolveConnections } from './config';

/**
 * SyncDB CLI handler.
 */
class SyncDb extends Command {
  static description = 'Synchronize database';

  /**
   * Available CLI flags.
   */
  static flags = {
    version: flags.version({ char: 'v', description: 'Print version', name: 'sync-db' }),
    help: flags.help({ char: 'h', description: 'Print help information' }),
    force: flags.boolean({ char: 'f', description: 'Force synchronization' }),
    'generate-connections': flags.boolean({ char: 'c', description: 'Generate connections' })
  };

  /**
   * Default CLI options for running synchronize.
   *
   * @param {*} userParams
   * @returns {SyncParams}
   */
  getSyncParams(userParams: any): SyncParams {
    return {
      ...userParams,
      // Individual success handler
      onSuccess: (context: ExecutionContext) =>
        printLine(`  [✓] ${context.connectionId} - Successful (${context.timeElapsed.toFixed(2)}s)`),

      // Individual error handler
      onFailed: (context: ExecutionContext) =>
        printLine(`  [✖] ${context.connectionId} - Failed (${context.timeElapsed.toFixed(2)}s)`)
    };
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    // Set CLI environment as true.
    process.env.SYNC_DB_CLI = 'true';

    const { flags: parsedFlags } = this.parse(SyncDb);
    const params = this.getSyncParams({ ...parsedFlags });

    try {
      await handleFlags(parsedFlags);

      const config = await loadConfig();
      const connections = await resolveConnections();
      const { synchronize } = await import('./api');

      await printLine('Synchronizing...\n');

      const results = await synchronize(config, connections, params);
      const { totalCount, failedCount } = await this.processResults(results);

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

    if (successfulCount > 0) {
      // Display output.
      await printLine(`Synchronization successful for ${successfulCount} / ${totalCount} connection(s).`);
    }

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
}

export default SyncDb;
