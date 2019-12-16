import * as path from 'path';

import * as fs from './fs';
import { Logger } from './types';
import { CONNECTIONS_FILENAME } from '../constants';
import { resolveConnectionsFromEnv } from '../config';

/**
 * Generates connections.sync-db.json file.
 *
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
export async function generateConnection(logger: Logger): Promise<void> {
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
