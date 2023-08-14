import { getBinPathSync } from 'get-bin-path';
import { execa, Options, ExecaChildProcess } from 'execa';

/**
 * Runs sync-db cli.
 *
 * @param {string[]} [args]
 * @param {Options} [options]
 * @returns {ExecaChildProcess}
 */
export function runCli(args?: string[], options?: Options<string>): ExecaChildProcess<any> {
  const binPath = getBinPathSync() || '';

  return execa(binPath, args, options);
}

/**
 * Query a list by regex pattern and return the found value.
 *
 * @param {string[]} list
 * @param {RegExp} pattern
 * @returns {string}
 */
export function queryByPattern(list: string[], pattern: RegExp): string {
  const found = list.find(item => pattern.test(item));

  if (!found) {
    throw new Error(`Pattern ${pattern} not found in the list ${list}.`);
  }

  return found;
}
