import { generateConnection } from '../util/generateConnection';
import { SyncDbOptions, Logger } from '../util/types';

/**
 * Services to run depending upon the flags provided.
 *
 * @param {SyncDbOptions} flags
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
export async function syncDbServices(flags: SyncDbOptions, logger: Logger): Promise<void> {

  if (flags['generate-connections']) {
    await generateConnection(logger);
    process.exit(0);
  }
}
