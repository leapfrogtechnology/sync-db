import * as path from 'path';

import * as fs from '../util/fs';
import OcliffLogger from '../domain/OcliffLogger';
import SyncDbOptions from '../domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from '../constants';
import { resolveConnectionsFromEnv } from '../config';

/**
 * Generates connections.sync-db.json file.
 *
 * @param {OcliffLogger} logger
 * @returns {Promise<void>}
 */
async function generateConnection(logger: OcliffLogger): Promise<void> {
  try {
    const filePath = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

    const connections = resolveConnectionsFromEnv();
    await fs.write(filePath, JSON.stringify({ connections })).then(() => {
      logger.info(`Generated file: ${CONNECTIONS_FILENAME}`);
    });

    return Promise.resolve();
  } catch (error) {
    logger.error(error, { exit: false });
    process.exit(-1);
  }
}

/**
 * Services to run depending upon the flags provided.
 *
 * @param {SyncDbOptions} flags
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
export async function flagConfigs(flags: SyncDbOptions, logger: OcliffLogger): Promise<void> {
  if (flags['generate-connections']) {
    await generateConnection(logger);
    process.exit(0);
  }
}
