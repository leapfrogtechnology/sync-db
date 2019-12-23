import * as path from 'path';

import * as fs from '../util/fs';
import OclifLogger from '../domain/OclifLogger';
import SyncDbOptions from '../domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from '../constants';
import { resolveConnectionsFromEnv } from '../config';

/**
 * Generates connections.sync-db.json file.
 *
 * @param {OclifLogger} logger
 * @returns {Promise<void>}
 */
async function generateConnection(logger: OclifLogger): Promise<void> {
  try {
    const filePath = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

    const connections = resolveConnectionsFromEnv();
    const contents = JSON.stringify({ connections });
    await fs.write(filePath, contents);

    logger.info(`Generated file: ${CONNECTIONS_FILENAME}`);
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
export async function handleFlags(flags: SyncDbOptions, logger: OclifLogger): Promise<void> {
  if (flags['generate-connections']) {
    await generateConnection(logger);
    process.exit(0);
  }
}
