import { Command, Flags } from '@oclif/core';
import { bold, red, cyan, magenta } from 'chalk';

import { migrateLatest } from '../api';
import { dbLogger } from '../util/logger';
import { loadConfig, resolveConnections } from '..';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class MigrateLatest extends Command {
  static description = 'Run the migrations up to the latest changes.';

  static flags = {
    'dry-run': Flags.boolean({ description: 'Dry run migration.', default: false }),
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
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));

    await printInfo('   [✓] Migration - started');
  };

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    log('Up to date: ', alreadyUpToDate);

    await printInfo(`   [✓] Migration - completed (${result.timeElapsed}s)`);

    if (alreadyUpToDate) {
      await printInfo('   Already up to date.\n');

      return;
    }

    // Completed migrations.
    for (const item of list) {
      await printLine(cyan(`       - ${item}`));
    }

    await printInfo(`   Ran ${list.length} migrations.\n`);
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    await printLine(bold(red(`   [✓] Migration - Failed\n`)));
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

    if (isDryRun) await printLine(magenta('\n• DRY RUN STARTED\n'));

    const results = await migrateLatest(config, connections, {
      ...parsedFlags,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      if (isDryRun) await printLine(magenta('• DRY RUN ENDED\n'));

      return process.exit(0);
    }

    printError(`Error: Migration failed for ${failedCount} connection(s).`);

    if (isDryRun) await printLine(magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default MigrateLatest;
