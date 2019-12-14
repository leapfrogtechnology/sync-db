import * as fs from './fs';
import { Key, Logger, Mapping } from './types';

const CONNECTIONS_FILE_NAME = 'connections.sync-db.json';
const KEYS = ['DB_HOST', 'DB_PASSWORD', 'DB_NAME', 'DB_USERNAME', 'DB_PORT', 'DB_CLIENT', 'DB_ENCRYPTION'];
const mapping: Mapping<string> = {
  USERNAME: 'name',
  NAME: 'database'
};

/**
 * Reads values from ENV from provide keys.
 *
 * @param {string[]} keys
 * @returns {string[] | Key}
 */
function extractFromEnv(keys: string[]): string[] | Key {
  const errors: string[] = [];
  const connection: Key = {};

  keys.forEach((element: string) => {

    if (element === 'DB_ENCRYPTION') {
      connection['options'] = {
        encrypt: (process.env[element] === 'true') || false
      };
    } else if (!process.env[element]) {
      errors.push(element);
    } else {
      const [, b] = element.split('_');
      const key = mapping[b] ? mapping[b].toLowerCase() : b.toLowerCase();
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
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
export async function generateConnection(logger: Logger): Promise<void> {
  try {
    const filePath = `${process.cwd()}/${CONNECTIONS_FILE_NAME}`;
    const conn = extractFromEnv(KEYS);
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
