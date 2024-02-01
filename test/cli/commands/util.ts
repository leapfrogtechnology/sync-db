import * as execa from 'execa';
import { getBinPathSync } from 'get-bin-path';

const binPath = getBinPathSync();

/**
 * Runs sync-db cli.
 *
 * @param {string[]} [args] - The cli arguments.
 * @param {execa.Options<string>} [options] - The execa options.
 * @returns {execa.ExecaChildProcess<any>} - The execa child process.
 */
export function runCli(args?: string[], options?: execa.Options<string>): execa.ExecaChildProcess<any> {
  return execa(binPath, args, options);
}

/**
 * Query a list by regex pattern and return the found value.
 *
 * @param {string[]} list - The list of values.
 * @param {RegExp} pattern - The regex pattern.
 * @returns {string} - The found value.
 */
export function queryByPattern(list: string[], pattern: RegExp): string {
  const found = list.find(item => pattern.test(item));

  if (!found) {
    throw new Error(`Pattern ${pattern} not found in the list ${list}.`);
  }

  return found;
}
