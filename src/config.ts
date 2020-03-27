import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import { isObject } from './util/types';
import DbConfig from './domain/DbConfig';
import SyncConfig from './domain/SyncConfig';
import ConnectionConfig from './domain/ConnectionConfig';
import { prepareInjectionConfigVars } from './service/configInjection';
import { DEFAULT_CONFIG, CONFIG_FILENAME, CONNECTIONS_FILENAME, REQUIRED_ENV_KEYS } from './constants';

/**
 * Check if this is being run via the sync-db cli or not.
 *
 * @returns {boolean}
 */
export function isCLI(): boolean {
  return process.env.SYNC_DB_CLI === 'true';
}

/**
 * Load config yaml file.
 *
 * @returns {Promise<SyncConfig>}
 */
export async function loadConfig(): Promise<SyncConfig> {
  log('Resolving config file.');

  const filename = path.resolve(process.cwd(), CONFIG_FILENAME);
  const loadedConfig = (await yaml.load(filename)) as SyncConfig;

  log('Resolved config file.');

  const loaded = mergeDeepRight(DEFAULT_CONFIG, loadedConfig) as SyncConfig;

  validate(loaded);

  const result = {
    ...loaded,
    injectedConfig: {
      ...loaded.injectedConfig,
      vars: prepareInjectionConfigVars(loaded.injectedConfig.vars)
    }
  };

  log('Resolved configuration:\n%O', result);

  return result;
}

/**
 * Validate the loaded configuration.
 *
 * @param {SyncConfig} config
 */
export function validate(config: SyncConfig) {
  const { injectedConfig } = config;

  log('Validating config.');

  // Shouldn't reach under here unless the user has mismatched the value.
  if (!injectedConfig.vars || !isObject(injectedConfig.vars)) {
    throw new Error('Invalid configuration value for `injectedConfig.vars`.');
  }

  // TODO: Validate the remaining loaded config.
  // Throw error if validation fails.

  log('Validation passed.');
}

/**
 * Resolve database connections.
 *
 * @returns {Promise<ConnectionConfig[]>}
 */
export async function resolveConnections(): Promise<ConnectionConfig[]> {
  log('Resolving database connections.');

  const filename = path.resolve(process.cwd(), CONNECTIONS_FILENAME);
  const connectionsFileExists = await fs.exists(filename);

  let connections;

  // If connections file exists, resolve connections from that.
  // otherwise fallback to getting the connection from the env vars.
  if (connectionsFileExists) {
    connections = await resolveConnectionsFromFile(filename);
  } else {
    log('Connections file not provided.');

    connections = resolveConnectionsFromEnv();
  }

  log(
    'Resolved connections: %O',
    connections.map(({ id, host, database }) => ({ id, host, database }))
  );

  return connections;
}

/**
 * Get the connection id from the config.
 *
 * @param {ConnectionConfig} connectionConfig
 * @returns {string}
 */
export function getConnectionId(connectionConfig: ConnectionConfig): string {
  return connectionConfig.id || `${connectionConfig.host}/${connectionConfig.database}`;
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
  log('Resolving connections from the environment variables.');

  validateConnections(REQUIRED_ENV_KEYS);

  const connection = {
    client: process.env.DB_CLIENT,
    id: process.env.DB_ID,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? +process.env.DB_PORT : null,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: process.env.DB_ENCRYPTION === 'true'
    }
  } as ConnectionConfig;

  return [connection];
}

/**
 * Resolve connections from the file.
 *
 * @param {string} filename
 * @returns {Promise<ConnectionConfig[]>}
 */
async function resolveConnectionsFromFile(filename: string): Promise<ConnectionConfig[]> {
  log('Resolving file: %s', filename);

  const loaded = await fs.read(filename);
  const { connections } = JSON.parse(loaded) as DbConfig;

  // TODO: Validate the connections received from file.

  return connections;
}
