import { Command, flags } from '@oclif/command';
import { bold, red, magenta, cyan } from 'chalk';

import { runScriptAPI } from '../api';
import { dbLogger } from '../util/logger';
import { loadConfig, resolveConnections } from '..';
import { validateScriptFileName } from '../util/fs';
import { printLine, printError, printInfo } from '../util/io';
import OperationResult from '../domain/operation/OperationResult';

class RunScript extends Command {
  static description = 'Run the provided manual scripts.';

  static flags = {
    'dry-run': flags.boolean({ description: 'Dry run script.', default: false }),
    only: flags.string({
      helpValue: 'CONNECTION_ID(s)',
      description: 'Filter provided connection(s). Comma separated ids eg: id1,id2'
    }),
    file: flags.string({
      required: true,
      helpValue: 'Script Name',
      parse: validateScriptFileName,
      description: 'Name of the manual SQL/JS/TS script'
    }),
    'connection-resolver': flags.string({
      helpValue: 'PATH',
      description: 'Path to the connection resolver.'
    }),
    config: flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    })
  };

  /**
   * Started event handler.
   */
  onStarted = async (result: OperationResult) => {
    await printLine(bold(` ▸ ${result.connectionId}`));

    await printInfo('   [✓] Manual script run - started');
  };

  /**
   * Success handler.
   */
  onSuccess = async (result: OperationResult) => {
    const log = dbLogger(result.connectionId);
    const [num, list] = result.data;
    const alreadyUpToDate = num && list.length === 0;

    log('Up to date: ', alreadyUpToDate);

    await printInfo(`   [✓] Manual script run - completed (${result.timeElapsed}s)`);

    if (alreadyUpToDate) {
      await printInfo('   Already up to date.\n');

      return;
    }

    // Completed migrations.
    for (const item of list) {
      await printLine(cyan(`       - ${item}`));
    }

    await printInfo(`   Ran ${list.length} scripts.\n`);
  };

  /**
   * Failure handler.
   */
  onFailed = async (result: OperationResult) => {
    await printLine(bold(red(`   [✓] Manual script run - Failed\n`)));
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(RunScript);
    const isDryRun = parsedFlags['dry-run'];
    const config = await loadConfig(parsedFlags.config);

    const connections = await resolveConnections(config, parsedFlags['connection-resolver']);

    if (isDryRun) await printLine(magenta('\n• DRY RUN STARTED\n'));

    const results = await runScriptAPI(config, connections, {
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

    printError(`Error: Script failed for ${failedCount} connection(s).`);

    if (isDryRun) await printLine(magenta('\n• DRY RUN ENDED\n'));

    process.exit(-1);
  }
}

export default RunScript;
