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
