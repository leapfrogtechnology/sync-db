import { Args, Command, Flags } from '@oclif/core';

import { loadConfig } from '../../config';
import Configuration from '../../domain/Configuration';
import MakeOptions from '../../domain/MakeOptions';
import * as fileMakerService from '../../service/fileMaker';
import { printLine } from '../../util/io';

class Make extends Command {
  static args = { name: Args.string({ description: 'Object or filename to generate.', required: true }) };

  static description = 'Create migration files using a template.';
  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    }),
    create: Flags.boolean({
      default: false,
      description: 'Generate create table stub.'
    }),
    'object-name': Flags.string({
      description: 'Name of table/view/routine to migrate.'
    }),
    type: Flags.string({
      char: 't',
      default: 'migration',
      description: 'Type of file to generate.',
      helpValue: 'TYPE',
      options: ['migration', 'view', 'procedure', 'function']
    })
  };

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
      case 'migration': {
        return fileMakerService.makeMigration(config, filename, options);
      }

      default: {
        throw new Error(`Unsupported file type ${type}.`);
      }
    }
  }

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { args, flags: parsedFlags } = await this.parse(Make);
    const config = await loadConfig(parsedFlags.config);
    const list = await this.makeFiles(config, args.name, parsedFlags.type, {
      create: parsedFlags.create,
      objectName: parsedFlags['object-name']
    });

    for (const filename of list) {
      printLine(`Created ${filename}`);
    }
  }
}

export default Make;
