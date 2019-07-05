import { Command, flags } from '@oclif/command';

import { loadConfig, resolveConnections } from './config';
import { log } from './logger';

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
    force: flags.boolean({ char: 'f', description: 'Force synchronization' })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(SyncDb);

    try {
      const params = {
        force: parsedFlags.force
      };
      const config = await loadConfig();
      const connections = await resolveConnections();
      const { synchronize } = await import('./migrator');
      await synchronize(config, connections, params);
    } catch (e) {
      log('Error caught: ', e, '\n');
      this.error('An error occurred: ' + e);
    }
  }
}

export default SyncDb;
