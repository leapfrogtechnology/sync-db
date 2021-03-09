import { bold, red, cyan, green } from 'chalk';
import { Command, flags } from '@oclif/command';

import { migrateRollback } from '../api';
import { dbLogger } from '../util/logger';
import { loadConfig, resolveConnections } from '..';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class MigrateRollback extends Command {
  static description = 'Rollback migrations up to the last run batch.';

  static flags = {
    'dry-run': flags.boolean({ char: 'f', description: 'Dry Run migration rollback.', default: false }),
    only: flags.string({
      helpValue: 'CONNECTION_ID',
      description: 'Filter only a single connection.'
    }),
    'connection-resolver': flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
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
    const config = await loadConfig();
    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    isDryRun && (await printLine('• DRY RUN STARTED\n'));
    const results = await migrateRollback(config, connections, {
      ...parsedFlags,
      onStarted: this.onStarted,
      onSuccess: this.onSuccess,
      onFailed: this.onFailed
    });

    const failedCount = results.filter(({ success }) => !success).length;

    if (failedCount === 0) {
      isDryRun && (await printLine(green('[✓] DRY RUN SUCCESS\n')));

      return process.exit(0);
    }

    isDryRun && (await printLine(red('[✖] DRY RUN FAILED\n')));

    printError(`Error: Rollback failed for ${failedCount} connection(s).`);
    process.exit(-1);
  }
}

export default MigrateRollback;
