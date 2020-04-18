import { Command } from '@oclif/command';
import { bold, red, cyan } from 'chalk';

import { printLine, printError, printInfo } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import { MigrationCommandParams, MigrationLatestResult } from '../service/migrator';
import { dbLogger } from '../util/logger';

/**
 * Migration command handler.
 */
class MigrateLatest extends Command {
  static description = 'Run the migrations up to the latest changes.';

  getParams(): MigrationCommandParams<MigrationLatestResult> {
    return {
      onSuccess: async (result: MigrationLatestResult) => {
        const log = dbLogger(result.connectionId);
        const [num, list] = result.data;
        const alreadyUpToDate = num && list.length === 0;

        log('Up to date: ', alreadyUpToDate);

        await printLine(bold(` ▸ ${result.connectionId} - Successful`) + ` (${result.timeElapsed}s)`);

        if (alreadyUpToDate) {
          await printInfo('   Already up to date.\n');

          return;
        }

        // Completed migrations.
        for (const item of list) {
          await printLine(cyan(`   - ${item}`));
        }

        await printInfo(`\n   Ran ${list.length} migrations.\n`);
      },
      onFailed: async (result: MigrationLatestResult) => {
        printLine(bold(red(` ▸ ${result.connectionId} - Failed`)));

        await printError(`   ${result.error}\n`);
      }
    };
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const params = this.getParams();

    const config = await loadConfig();
    const connections = await resolveConnections();
    const { migrateLatest } = await import('../api');

    const results = await migrateLatest(config, connections, params);

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      return process.exit(0);
    }

    printError(`Error: Migration failed for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default MigrateLatest;
