import * as path from 'path';
import { cyan } from 'chalk';
import * as yaml from 'yamljs';
import { Command } from '@oclif/command';

import { printLine } from '../util/io';
import { copy, exists, appendFile } from '../util/fs';
import { DEFAULT_CONFIG_FILENAME, CONFIG_CACHE_FILENAME } from '../constants';

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../../assets');

class ConfigSource extends Command {
  static description = 'Change the configuration source';

  static args = [
    { name: 'filename', description: 'Object or filename to containing configurations.', required: false }
  ];

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { args } = this.parse(ConfigSource);
    const cacheDestination = path.join(DEFAULT_CONFIG_PATH, CONFIG_CACHE_FILENAME);

    if (!args.filename) {
      const fileExists = await exists(cacheDestination);

      if (!fileExists) {
        printLine(cyan(`Configuration source is currently switched to - ${DEFAULT_CONFIG_FILENAME}`));

        return;
      }
      const { actualSource } = await yaml.load(cacheDestination);

      printLine(cyan(`Configuration source is currently switched to - ${actualSource}`));

      return;
    }

    await createCacheConfigurationSource(args.filename, cacheDestination);
  }
}

/**
 * Cache configuration from given config file.
 *
 * @param {string} name
 * @param {string} cacheDestination
 */
async function createCacheConfigurationSource(name: string, cacheDestination: string): Promise<void> {
  const filename = `${name}.yml`;

  const meta = await yaml.stringify({ actualSource: filename });

  await copy(path.join(process.cwd(), filename), cacheDestination);

  await appendFile(cacheDestination, meta);

  printLine(cyan(`Configuration source switched to - ${filename}`));
}

export default ConfigSource;
