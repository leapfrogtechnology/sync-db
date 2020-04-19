import { Command } from '@oclif/command';
import { bold, red, cyan } from 'chalk';

import { printLine, printError, printInfo } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import { MigrationCommandParams, MigrationResult } from '../service/knexMigrator';
import { dbLogger } from '../util/logger';

/**
 * Migration command handler.
 */
class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  getParams(): MigrationCommandParams {
    return {
      onSuccess: async (result: MigrationResult) => {
        const log = dbLogger(result.connectionId);
        const [num, list] = result.data;
        const allRolledBack = num === 0;

        log('Already on the top of migrations: ', allRolledBack);

        await printLine(bold(` ▸ ${result.connectionId} - Successful`) + ` (${result.timeElapsed}s)`);

        if (allRolledBack) {
          await printLine('   No more migrations to rollback.\n');

          return;
        }

        // Completed migrations.
        for (const item of list) {
          await printLine(cyan(`   - ${item}`));
        }

        await printInfo(`\n   Rolled back ${list.length} migrations.\n`);
      },
      onFailed: async (result: MigrationResult) => {
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
    const { migrateRollback } = await import('../api');

    const results = await migrateRollback(config, connections, params);

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      return process.exit(0);
    }

    printError(`Error: Rollback failed for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default MigrateRollback;
