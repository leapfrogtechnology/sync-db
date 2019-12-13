import { generateConnection } from './generateConnection';
import { Iflags, Ilogger } from './types';

/**
 * Services to run depending upon the flags provided.
 *
 * @param {Iflags} flags
 * @param {Ilogger} logger
 * @returns {Promise<void>}
 */
export async function syncDbServices(flags: Iflags, logger: Ilogger): Promise<void> {

  if (flags['generate-connections']) {
    await generateConnection(logger);
    process.exit(0);
  }
}
