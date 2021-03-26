import { Command, flags } from '@oclif/command';
import { bold, red, cyan, magenta } from 'chalk';

import { migrateRollback } from '../api';
import { dbLogger } from '../util/logger';
import { loadConfig, resolveConnections } from '..';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  static flags = {
    'dry-run': flags.boolean({ description: 'Dry run rollback.', default: false }),
    only: flags.string({
      helpValue: 'CONNECTION_ID',
      description: 'Filter only a single connection.'
    }),
    'connection-resolver': flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
    }),
    config: flags.string({
      char: 'c',
      default: 'sync-db.yml',
      description: 'Custom configuration file.'
    })
  };

  /**
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));
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
      await printLine('   No more migrations to rollback.\n');

      return;
    }

    // List of migrations rolled back.
    for (const item of list) {
      await printLine(cyan(`       - ${item}`));
    }

    await printInfo(`   Rolled back ${list.length} migrations.\n`);
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    await printLine(red(`   [✖] Rollback - failed (${result.timeElapsed}s)\n`));
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(MigrateRollback);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) await printLine(magenta('\n• DRY RUN STARTED\n'));

    const results = await migrateRollback(config, connections, {
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

    printError(`Error: Rollback failed for ${failedCount} connection(s).`);

    if (isDryRun) await printLine(magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default MigrateRollback;
