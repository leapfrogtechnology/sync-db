import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import { isObject } from './util/types';
import DbConfig from './domain/DbConfig';
import SyncConfig from './domain/SyncConfig';
import ConnectionConfig from './domain/ConnectionConfig';
import { prepareInjectionConfigVars } from './services/configInjection';
import { DEFAULT_CONFIG, CONFIG_FILENAME, CONNECTIONS_FILENAME, ENV_KEYS } from './constants';

/**
 * Load config yaml file.
 *
 * @returns {Promise<SyncConfig>}
 */
export async function loadConfig(): Promise<SyncConfig> {
  log('Resolving sync config file.');

  const filename = path.resolve(process.cwd(), CONFIG_FILENAME);
  const loadedConfig = (await yaml.load(filename)) as SyncConfig;

  log('Resolved sync config file.');

  const loaded = mergeDeepRight(DEFAULT_CONFIG, loadedConfig) as SyncConfig;

  validate(loaded);

  return {
    ...loaded,
    injectedConfig: {
      ...loaded.injectedConfig,
      vars: prepareInjectionConfigVars(loaded.injectedConfig.vars)
    }
  };
}

/**
 * Validate the loaded configuration.
 *
 * @param {SyncConfig} config
 */
function validate(config: SyncConfig) {
  const { injectedConfig } = config;

  // Shouldn't reach under here unless the user has mismatched the value.
  if (!injectedConfig.table || !injectedConfig.table.trim()) {
    throw new Error('Invalid configuration value for `injectedConfig.table`.');
  }

  // Shouldn't reach under here unless the user has mismatched the value.
  if (!injectedConfig.vars || isObject(injectedConfig.vars)) {
    throw new Error('Invalid configuration value for `injectedConfig.vars`.');
  }

  // TODO: Validate the remaining loaded config.
  // Throw error if validation fails.
}

/**
 * Resolve database connections.
 *
 * @returns {Promise<ConnectionConfig[]>}
 */
export async function resolveConnections(): Promise<ConnectionConfig[]> {
  log('Resolving database connections.');

  const filename = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

  log('Resolving file: %s', filename);

  const loaded = await fs.read(filename);
  const { connections } = JSON.parse(loaded) as DbConfig;

  // TODO: Validate the connections received from file.
  const result = connections.map(connection => ({
    ...connection,
    id: connection.id || `${connection.host}/${connection.database}`
  }));

  log(
    'Resolved connections: %O',
    result.map(({ id, host, database }) => ({ id, host, database }))
  );

  return result;
}

/**
 * Validate connection keys.
 *
 * @param {string[]} keys
 * @returns {void}
 */
function validateConnections(keys: string[]): void {
  const missingVars: string[] = keys.filter(key => !process.env[key]);

  if (missingVars.length) {
    throw new Error('Following environment variables were not set: ' + missingVars.join(', '));
  }
}

/**
 * Resolve database connections from Env.
 *
 * @returns {ConnectionConfig[]}
 */
export function resolveConnectionsFromEnv(): ConnectionConfig[] {
  validateConnections(ENV_KEYS);

  const connection = {
    client: process.env.DB_CLIENT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: process.env.DB_ENCRYPTION === 'true'
    }
  } as ConnectionConfig;

  return [connection];
}
