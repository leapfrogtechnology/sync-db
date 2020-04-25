import { Command } from '@oclif/command';
import { bold, red, cyan } from 'chalk';

import { migrateRollback } from '../api';
import { dbLogger } from '../util/logger';
import { loadConfig, resolveConnections } from '..';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const allRolledBack = num === 0;

    log('Already on the top of migrations: ', allRolledBack);

    await printLine(bold(` ▸ ${result.connectionId} - Successful`) + ` (${result.timeElapsed}s)`);

    if (allRolledBack) {
      await printLine('   No more migrations to rollback.\n');

      return;
    }

    // List of migrations rolled back.
    for (const item of list) {
      await printLine(cyan(`   - ${item}`));
    }

    await printInfo(`\n   Rolled back ${list.length} migrations.\n`);
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
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
