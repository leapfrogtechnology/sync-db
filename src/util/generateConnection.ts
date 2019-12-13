import * as fs from './fs';
import { Ikeys, Ilogger, Imappings } from './types';

const CONNECTIONS_FILE_NAME = 'connections.sync-db.json';
const KEYS = ['DB_HOST', 'DB_PASSWORD', 'DB_NAME', 'DB_USERNAME', 'DB_PORT', 'DB_CLIENT', 'DB_ENCRYPTION'];
const mappings: Imappings = {
  USERNAME: 'name',
  NAME: 'database'
};

/**
 * Reads values from ENV from provide keys.
 *
 * @param {string[]} keys
 * @returns {string[] | Ikeys}
 */
function extractValuesFromENV(keys: string[]): string[] | Ikeys {
  const errors: string[] = [];
  const connection: Ikeys = {};

  keys.forEach((element: string) => {

    if (element === 'DB_ENCRYPTION') {
      connection['options'] = {
        encrypt: (process.env[element] === 'true') || false
      };
    } else if (!process.env[element]) {
      errors.push(element);
    } else {
      const [, b] = element.split('_');
      const key = mappings[b] ? mappings[b].toLowerCase() : b.toLowerCase();
      connection[key] = String(process.env[element]);
    }

  });

  if (errors.length) {
    throw new Error(JSON.stringify({ 'keys not found': errors }));
  }

  return connection;
}

/**
 * Generates connections.sync-db.json file.
 *
 * @param {Ilogger} logger
 * @returns {Promise<void>}
 */
export async function generateConnection(logger: Ilogger): Promise<void> {
  try {
    const filePath = `${process.cwd()}/${CONNECTIONS_FILE_NAME}`;
    const conn = extractValuesFromENV(KEYS);
    const data = JSON.stringify({
      connections: [conn]
    });

    await fs.write(filePath, data).then(() => {
      logger.info(`Generated file: ${CONNECTIONS_FILE_NAME}`);
    });

    return Promise.resolve();
  } catch (error) {
    logger.error(error, { exit: false });
    process.exit(-1);
  }
}
