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
   * @param {Configuration} config `sync-db` configuration object.
   * @param {string} filename The name of the file to generate.
   * @param {string} type The type of file to generate.
   * @param {Partial<MakeOptions>} options The options for the file generation.
   * @returns {Promise<string[]>} The list of generated files.
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
   * @returns {Promise<void>} The promise that resolves when the command is done.
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
