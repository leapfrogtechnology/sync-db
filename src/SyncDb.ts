import { Command, flags } from '@oclif/command';

import { log } from './logger';
import { handleFlags } from './services/syncDb';
import { loadConfig, resolveConnections } from './config';

/**
 * SyncDB CLI handler.
 */
class SyncDb extends Command {
  static description = 'Synchronize database';

  /**
   * Available CLI flags.
   */
  static flags = {
    version: flags.version({ char: 'v', description: 'Print version', name: 'sync-db' }),
    help: flags.help({ char: 'h', description: 'Print help information' }),
    force: flags.boolean({ char: 'f', description: 'Force synchronization' }),
    'generate-connections': flags.boolean({ char: 'c', description: 'Generate connections' })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(SyncDb);
    const params = {
      force: parsedFlags.force
    };

    try {
      await handleFlags(parsedFlags, {
        info: this.log,
        error: this.error
      });
      const config = await loadConfig();
      const connections = await resolveConnections();

      const { synchronize } = await import('./migrator');

      await synchronize(config, connections, params);
      process.exit(0);
    } catch (e) {
      log('Error caught: ', e, '\n');
      this.error('An error occurred: ' + e);
      process.exit(-1);
    }
  }
}

export default SyncDb;
