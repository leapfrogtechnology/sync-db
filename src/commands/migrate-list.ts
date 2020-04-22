import { Command } from '@oclif/command';
import { bold, grey, red, cyan, yellow } from 'chalk';

import { migrateList } from '../api';
import { printLine, printError } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import { MigrationResult } from '../service/knexMigrator';

/**
 * Migration command handler.
 */
class MigrateList extends Command {
  static description = 'List migrations.';

  /**
   * Success handler for a connection.
   */
  onSuccess = async (result: MigrationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));

    const [list1, list2] = result.data;
    const ranCount = list1.length;
    const remainingCount = list2.length;

    // Completed migrations.
    for (const item of list1) {
      await printLine(cyan(`   • ${item}`));
    }

    // Remaining Migrations
    for (const item of list2) {
      await printLine(grey(`   - ${item}`));
    }

    if (ranCount === 0 && remainingCount === 0) {
      await printLine(yellow('   No migrations.'));
    } else if (remainingCount > 0) {
      await printLine(yellow(`\n   ${list2.length} migrations yet to be run.`));
    } else if (remainingCount === 0) {
      await printLine('\n   All up to date.');
    }

    await printLine();
  };

  /**
   * Failure handler for a connection.
   */
  onFailed = async (result: MigrationResult) => {
    printLine(bold(red(` ▸ ${result.connectionId} - Failed`)));

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

    const results = await migrateList(config, connections, {
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      return process.exit(0);
    }

    printError(`Error: Failed retrieving list for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default MigrateList;
