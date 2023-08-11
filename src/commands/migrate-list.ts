import { Command, Flags } from '@oclif/core';
import { bold, grey, red, cyan, yellow } from 'chalk';

import { migrateList } from '../api';
import { printLine, printError } from '../util/io';
import { loadConfig, resolveConnections } from '..';
import OperationResult from '../domain/operation/OperationResult';

class MigrateList extends Command {
  static description = 'List all the migrations.';

  static flags = {
    only: Flags.string({
      helpValue: 'CONNECTION_ID',
      description: 'Filter only a single connection.'
    }),
    'connection-resolver': Flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
    }),
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    })
  };

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));

    const [completedList, remainingList] = result.data;
    const ranCount = completedList.length;
    const remainingCount = remainingList.length;

    // Completed migrations.
    for (const item of completedList) {
      const completedMigrationName = typeof item === 'string' || item instanceof String ? item : item?.name;

      await printLine(cyan(`   • ${completedMigrationName}`));
    }

    // Remaining Migrations
    for (const item of remainingList) {
      await printLine(grey(`   - ${item}`));
    }

    if (ranCount === 0 && remainingCount === 0) {
      await printLine(yellow('   No migrations.'));
    } else if (remainingCount > 0) {
      await printLine(yellow(`\n   ${remainingList.length} migrations yet to be run.`));
    } else if (remainingCount === 0) {
      await printLine('\n   All up to date.');
    }

    await printLine();
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    printLine(bold(red(` ▸ ${result.connectionId} - Failed`)));

    await printError(`   ${result.error}\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MigrateList);
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    const results = await migrateList(config, connections, {
      ...parsedFlags,
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
