import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig, resolveConnections } from '../..';
import { migrateList } from '../../api';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printLine } from '../../util/io';

class MigrateList extends Command {
  static description = 'List all the migrations.';

  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    })
  };

  /**
   * Failure handler.
   *
   * @param {OperationResult} result - The result object of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  onFailed = async (result: OperationResult) => {
    printLine(chalk.bold(chalk.red(` ▸ ${result.connectionId} - Failed`)));

    printError(`   ${result.error}\n`);
  };

  /**
   * Success handler.
   *
   * @param {OperationResult} result - The result object of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  onSuccess = async (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));

    const [completedList, remainingList] = result.data;
    const ranCount = completedList.length;
    const remainingCount = remainingList.length;

    // Completed migrations.
    for (const item of completedList) {
      const completedMigrationName = typeof item === 'string' || item instanceof String ? item : item?.name;

      printLine(chalk.cyan(`   • ${completedMigrationName}`));
    }

    // Remaining Migrations
    for (const item of remainingList) {
      printLine(chalk.grey(`   - ${item}`));
    }

    if (ranCount === 0 && remainingCount === 0) {
      printLine(chalk.yellow('   No migrations.'));
    } else if (remainingCount > 0) {
      printLine(chalk.yellow(`\n   ${remainingList.length} migrations yet to be run.`));
    } else if (remainingCount === 0) {
      printLine('\n   All up to date.');
    }

    printLine();
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MigrateList);
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    const results = await migrateList(config, connections, {
      ...parsedFlags,
      onFailed: this.onFailed,
      onSuccess: this.onSuccess
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
