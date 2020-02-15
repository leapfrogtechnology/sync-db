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
        printLine(` [✓] ${context.connectionId} - Successful (${context.timeElapsed.toFixed(2)}s)`),

      // Individual error handler
      onFailed: (context: ExecutionContext) =>
        printLine(` [✖] ${context.connectionId} - Failed (${context.timeElapsed.toFixed(2)}s)`)
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

      printLine('Synchronizing...\n');

      const result = await synchronize(config, connections, params);

      this.displayResult(result);
    } catch (e) {
      log('Error caught: ', e, '\n');
      printError(e.toString());

      process.exit(-1);
    }
  }

  /**
   * Display the result.
   *
   * @param {SyncResult[]} result
   */
  displayResult(result: SyncResult[]) {
    const failed = result.filter(attempt => !attempt.success);

    const totalCount = result.length;
    const failedCount = failed.length;
    const successfulCount = totalCount - failedCount;

    printLine();

    if (successfulCount > 0) {
      // Display output.
      printLine(`Synchronization successful for ${successfulCount} / ${totalCount} connection(s).`);
    }

    if (failed.length === 0) {
      return process.exit(0);
    }

    // Display all errors.
    printLine(`Failed for following ${failedCount} connection(s):\n`);

    failed.forEach((attempt, index) => {
      printLine(`${index + 1}) ${attempt.connectionId}`);
      printError(attempt.error);
      printLine();
    });

    throw new Error(`Synchronization failed for ${failedCount} / ${totalCount} connections.`);
  }
}

export default SyncDb;
