import * as execa from 'execa';
import { getBinPathSync } from 'get-bin-path';

const binPath = getBinPathSync();

/**
 * Runs sync-db cli.
 *
 * @param {string[]} [args]
 * @param {execa.Options<string>} [options]
 * @returns {execa.ExecaChildProcess<any>}
 */
export function runCli(args?: string[], options?: execa.Options<string>): execa.ExecaChildProcess<any> {
  return execa(binPath, args, options);
}

/**
 * Check if the list contains at least one value that matches the pattern.
 */
export function listContainsPattern(list: string[], pattern: RegExp): boolean {
  const matches = list.filter(item => pattern.test(item));

  return matches.length > 0;
}
