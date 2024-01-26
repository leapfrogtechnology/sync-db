import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig, resolveConnections } from '../..';
import { migrateRollback } from '../../api';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printInfo, printLine } from '../../util/io';
import { dbLogger } from '../../util/logger';

class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    'dry-run': Flags.boolean({ default: false, description: 'Dry run rollback.' }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    })
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    printLine(chalk.red(`   [✖] Rollback - failed (${result.timeElapsed}s)\n`));
  };

  /**
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));
    await printInfo('   [✓] Rollback - started');
  };

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const allRolledBack = num === 0;

    log('Already on the top of migrations: ', allRolledBack);

    await printInfo(`   [✓] Rollback - completed (${result.timeElapsed}s)`);

    if (allRolledBack) {
      printLine('   No more migrations to rollback.\n');

      return;
    }

    // List of migrations rolled back.
    for (const item of list) {
      printLine(chalk.cyan(`       - ${item}`));
    }

    await printInfo(`   Rolled back ${list.length} migrations.\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MigrateRollback);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN STARTED\n'));

    const results = await migrateRollback(config, connections, {
      ...parsedFlags,
      onFailed: this.onFailed,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) printLine(chalk.magenta('• DRY RUN ENDED\n'));

      return process.exit(0);
    }

    printError(`Error: Rollback failed for ${failedCount} connection(s).`);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default MigrateRollback;
