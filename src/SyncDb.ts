import { Command, flags } from '@oclif/command';

import { log } from './logger';
import { handleFlags } from './cli';
import SyncResult from './domain/SyncResult';
import SyncParams from './domain/SyncParams';
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
      onSuccess: (connectionId: string) => this.log(` [✓] ${connectionId} - Successful`),

      // Individual error handler
      onFailed: (connectionId: string) => this.warn(` [✖] ${connectionId} - Failed`)
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

      const result = await synchronize(config, connections, params);

      this.displayResult(result);
    } catch (e) {
      log('Error caught: ', e, '\n');
      this.error('An error occurred: ' + e);
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

    // Display output.
    this.log(`${successfulCount} / ${totalCount} completed successfully.`);

    if (failed.length === 0) {
      return process.exit(0);
    }

    // Display all errors.
    this.warn(`${failedCount} error(s) found.`);

    failed.forEach(attempt => {
      this.warn(`Synchronize failed for ${attempt.connectionId}`);
      this.warn(attempt.error);
      this.log('\n');
    });
    process.exit(-1);
  }
}

export default SyncDb;
