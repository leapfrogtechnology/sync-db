import * as path from 'path';
import { cyan } from 'chalk';
import * as yaml from 'yamljs';
import { Command, flags } from '@oclif/command';

import { printLine } from '../util/io';
import { copy, exists, appendFile, remove } from '../util/fs';
import { DEFAULT_CONFIG_FILENAME, CONFIG_CACHE_FILENAME } from '../constants';

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../../assets');

class ConfigSource extends Command {
  static description = 'Change the configuration source';

  static args = [
    { name: 'filename', description: 'Object or filename to containing configurations.', required: false }
  ];
  static flags = {
    reset: flags.boolean({
      default: false,
      description: 'Remove the cached configuration.'
    })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { args, flags: parsedFlags } = this.parse(ConfigSource);
    const cacheDestination = path.join(DEFAULT_CONFIG_PATH, CONFIG_CACHE_FILENAME);

    const cacheExists = await exists(cacheDestination);

    if (parsedFlags.reset) {
      if (cacheExists) {
        await remove(path.join(DEFAULT_CONFIG_PATH, CONFIG_CACHE_FILENAME));
        await printLine(cyan(`\nConfiguration source is reset to - ${DEFAULT_CONFIG_FILENAME}\n`));

        return;
      }
      await printLine(cyan(`\nNo cached configuration found. Current source - ${DEFAULT_CONFIG_FILENAME}\n`));

      return;
    }

    if (args.filename) {
      await createCacheConfigurationSource(args.filename, cacheDestination);
    } else {
      await showCacheConfigurationSource(cacheExists, cacheDestination);
    }
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

  printLine(cyan(`\nConfiguration source switched to - ${filename}\n`));
}

/**
 * Show cached configuration source.
 *
 * @param {boolean} cacheExists
 * @param {string} cacheDestination
 */
async function showCacheConfigurationSource(cacheExists: boolean, cacheDestination: string): Promise<void> {
  if (!cacheExists) {
    await printLine(cyan(`\nConfiguration source is currently switched to - ${DEFAULT_CONFIG_FILENAME}\n`));

    return;
  }
  const { actualSource } = await yaml.load(cacheDestination);

  await printLine(cyan(`\nConfiguration source is currently switched to - ${actualSource}\n`));
}

export default ConfigSource;
