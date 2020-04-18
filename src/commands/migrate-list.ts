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
class MigrateList extends Command {
  static description = 'List migrations.';

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
    const { flags: parsedFlags } = this.parse(MigrateList);
    const params = this.getSyncParams({ ...parsedFlags });

    const config = await loadConfig();
    const connections = await resolveConnections();
    const { migrateList } = await import('../api');
    const timeStart = process.hrtime();

    const results = await migrateList(config, connections, params);

    log('Results:', results);
    console.log('Results', results); // tslint:disable-line

    const successfulCount = results.filter(item => item.success).length;

    if (successfulCount > 0) {
      // Display output.
      await printLine(
        `List complete for ${successfulCount} / ${results.length} connection(s). ` + `(${getElapsedTime(timeStart)}s)`
      );
    }

    // If all completed successfully, exit gracefully.
    if (results.length === successfulCount) {
      return process.exit(0);
    }

    throw new Error(`Failed to get the list for some connections.`);
  }
}

export default MigrateList;
