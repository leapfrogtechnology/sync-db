import { Command } from '@oclif/command';
import { bold, red, cyan } from 'chalk';

import { migrateRollback } from '../api';
import { printLine, printError, printInfo } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import { dbLogger } from '../util/logger';
import CommandResult from '../domain/CommandResult';

/**
 * Migration command handler.
 */
class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  /**
   * Success handler for each connection.
   */
  onSuccess = async (result: CommandResult) => {
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
  };

  /**
   * Failure handler for each connection.
   */
  onFailed = async (result: CommandResult) => {
    await printLine(bold(red(` ▸ ${result.connectionId} - Failed`)));

    await printError(`   ${result.error}\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const config = await loadConfig();
    const connections = await resolveConnections();

    const results = await migrateRollback(config, connections, {
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      return process.exit(0);
    }

    printError(`Error: Rollback failed for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default MigrateRollback;
