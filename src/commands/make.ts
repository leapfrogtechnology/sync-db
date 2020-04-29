import { printLine } from '../util/io';
import { Command, flags } from '@oclif/command';

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

    printLine(JSON.stringify({ args, parsedFlags }));
  }
}

export default Prune;
