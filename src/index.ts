import { Command, flags } from '@oclif/command';

class SyncDb extends Command {
  static description = 'Synchronize database';

  static flags = {
    version: flags.version({ char: 'v', description: 'Print version', name: 'sync-db' }),
    help: flags.help({ char: 'h', description: 'Print help information' }),
    force: flags.boolean({ char: 'f', description: 'Force synchronization' })
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags: parsedFlags } = this.parse(SyncDb);

    // Do something here
    this.log(`Hello World!`);

    if (args.file && parsedFlags.force) {
      // Force execution.
    }
  }
}

export = SyncDb;
