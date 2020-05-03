import { loadConfig } from '../config';
import { Command, flags } from '@oclif/command';
import * as fileMakerService from '../service/fileMaker';

class Prune extends Command {
  static description = 'Make migration files from the template.';

  static args = [{ name: 'name', description: 'Object or filename to generate.', required: true }];
  static flags = {
    type: flags.string({
      char: 't',
      helpValue: 'TYPE',
      description: 'Type of file to generate.',
      default: 'migration',
      options: ['migration', 'view', 'procedure', 'function']
    })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { args, flags: parsedFlags } = this.parse(Prune);
    const config = await loadConfig();

    switch (parsedFlags.type) {
      case 'migration':
        await fileMakerService.makeMigration(config, args.name);
        break;

      default:
        throw new Error(`Unsupported file type ${parsedFlags.type}.`);
    }
  }
}

export default Prune;
