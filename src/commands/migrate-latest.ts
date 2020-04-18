import { Command } from '@oclif/command';

import { printLine } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import { log } from '../util/logger';
import { getElapsedTime } from '../util/ts';
import SyncParams from '../domain/SyncParams';
import ExecutionContext from '../domain/ExecutionContext';

/**
 * Migration command handler.
 */
class MigrateLatest extends Command {
  static description = 'Run the migrations up to the latest changes.';

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
        printLine(`  [✓] ${context.connectionId} - Successful (${context.timeElapsed}s)`),

      // Individual error handler
      onFailed: (context: ExecutionContext) =>
        printLine(`  [✖] ${context.connectionId} - Failed (${context.timeElapsed}s)`)
    };
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(MigrateLatest);
    const params = this.getSyncParams({ ...parsedFlags });

    const config = await loadConfig();
    const connections = await resolveConnections();
    const { migrateLatest } = await import('../api');
    const timeStart = process.hrtime();

    await printLine('Running Migrations\n');

    const results = await migrateLatest(config, connections, params);

    log('Results:', results);
    console.log('Results', results); // tslint:disable-line

    const successfulCount = results.filter(item => item.success).length;

    if (successfulCount > 0) {
      // Display output.
      await printLine(
        `Migration complete for ${successfulCount} / ${results.length} connection(s). ` +
          `(${getElapsedTime(timeStart)}s)`
      );
    }

    // If all completed successfully, exit gracefully.
    if (results.length === successfulCount) {
      return process.exit(0);
    }

    throw new Error(`Migration failed for some connections.`);
  }
}

export default MigrateLatest;
