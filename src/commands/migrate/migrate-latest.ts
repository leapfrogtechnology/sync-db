import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig, resolveConnections } from '../..';
import { migrateLatest } from '../../api';
import OperationResult from '../../domain/operation/OperationResult';
import { printError, printInfo, printLine } from '../../util/io';
import { dbLogger } from '../../util/logger';

class MigrateLatest extends Command {
  static description = 'Run the migrations up to the latest changes.';

  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    'connection-resolver': Flags.string({
      description: 'Path to the connection resolver.',
      helpValue: 'PATH'
    }),
    'dry-run': Flags.boolean({ default: false, description: 'Dry run migration.' }),
    only: Flags.string({
      description: 'Filter only a single connection.',
      helpValue: 'CONNECTION_ID'
    })
  };

  /**
   * Failure handler.
   */
  onFailed = () => {
    printLine(chalk.bold(chalk.red(`   [✓] Migration - Failed\n`)));
  };

  /**
   * Started event handler.
   */
  onStarted = (result: OperationResult) => {
    printLine(chalk.bold(` ▸ ${result.connectionId}`));

    printInfo('   [✓] Migration - started');
  };

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    log('Up to date: ', alreadyUpToDate);

    printInfo(`   [✓] Migration - completed (${result.timeElapsed}s)`);

    if (alreadyUpToDate) {
      printInfo('   Already up to date.\n');

      return;
    }

    // Completed migrations.
    for (const item of list) {
      printLine(chalk.cyan(`       - ${item}`));
    }

    printInfo(`   Ran ${list.length} migrations.\n`);
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MigrateLatest);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);

    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN STARTED\n'));

    const results = await migrateLatest(config, connections, {
      ...parsedFlags,
      onFailed: this.onFailed,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) printLine(chalk.magenta('• DRY RUN ENDED\n'));

      // eslint-disable-next-line unicorn/no-process-exit
      return process.exit(0);
    }

    printError(`Error: Migration failed for ${failedCount} connection(s).`);

    if (isDryRun) printLine(chalk.magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default MigrateLatest;
