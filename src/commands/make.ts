import { loadConfig } from '../config';
import { printLine } from '../util/io';
import { Command, flags } from '@oclif/command';
import MakeOptions from '../domain/MakeOptions';
import Configuration from '../domain/Configuration';
import * as fileMakerService from '../service/fileMaker';

class Make extends Command {
  static description = 'Make migration files from the template.';

  static args = [{ name: 'name', description: 'Object or filename to generate.', required: true }];
  static flags = {
    'object-name': flags.string({
      description: 'Name of table/view/routine to migrate.'
    }),
    create: flags.boolean({
      default: false,
      description: 'Generate create table stub.'
    }),
    config: flags.string({
      char: 'c',
      default: 'sync-db.yml',
      description: 'Custom configuration file.'
    }),
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
    const { args, flags: parsedFlags } = this.parse(Make);
    const config = await loadConfig(parsedFlags.config);
    const list = await this.makeFiles(config, args.name, parsedFlags.type, {
      create: parsedFlags.create,
      objectName: parsedFlags['object-name']
    });

    for (const filename of list) {
      await printLine(`Created ${filename}`);
    }
  }

  /**
   * Make files based on the given name and type.
   *
   * @param {Configuration} config
   * @param {string} filename
   * @param {string} type
   * @param {string} objectName
   * @returns {Promise<string[]>}
   */
  async makeFiles(
    config: Configuration,
    filename: string,
    type?: string,
    options?: Partial<MakeOptions>
  ): Promise<string[]> {
    switch (type) {
      case 'migration':
        return fileMakerService.makeMigration(config, filename, options);

      default:
        throw new Error(`Unsupported file type ${type}.`);
    }
  }
}

export default Make;
