import { Knex } from 'knex';
import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import * as fs from './util/fs';
import { log } from './util/logger';
import { isObject } from './util/types';
import Configuration from './domain/Configuration';
import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionsFileSchema from './domain/ConnectionsFileSchema';
import { prepareInjectionConfigVars } from './service/configInjection';
import { DEFAULT_CONFIG, CONFIG_FILENAME, CONNECTIONS_FILENAME, REQUIRED_ENV_KEYS } from './constants';

const CONFIG_FILE_CONVENTION = /^sync-db-\w+\.yml$/;

interface ConnectionResolver {
  resolve: (config: Configuration) => Promise<ConnectionConfig[]>;
}

/**
 * Check if this is being run via the sync-db cli or not.
 *
 * @returns {boolean}
 */
export function isCLI(): boolean {
  return process.env.SYNC_DB_CLI === 'true';
}

/**
 * Get the SQL base path - the 'sql' directory under the `basePath`.
 *
 * TODO: Think of a better way later.
 *
 * @param {Configuration} config
 * @returns {string}
 */
export function getSqlBasePath(config: Configuration): string {
  return path.join(config.basePath, 'sql');
}

/**
 * Get manual scripts path from config.
 *
 * @param {Configuration} config
 * @returns {string}
 */
export function getManualScriptBasePath(config: Configuration): string {
  return path.join(config.basePath, config.manual.directory);
}

/**
 * Load config yaml file.
 *
 * @returns {Promise<Configuration>}
 */
export async function loadConfig(configFilename: string = CONFIG_FILENAME): Promise<Configuration> {
  log('Resolving config file.');
  const isAbsolutePath = path.isAbsolute(configFilename);
  const filename = path.parse(configFilename).base;
  const match = filename.match(CONFIG_FILE_CONVENTION) || filename === CONFIG_FILENAME;

  if (!match) {
    throw new Error(`The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`);
  }

  const filepath = isAbsolutePath ? configFilename : path.join(process.cwd(), configFilename);
  const loadedConfig = (await yaml.load(filepath)) as Configuration;

  log('Resolved config file.');

  const loaded = mergeDeepRight<Configuration, Configuration>(DEFAULT_CONFIG, loadedConfig);

  validate(loaded);

  // Resolve the base path relative to the config file location.
  const configFileLocation = path.dirname(filepath);
  const relativeBasePath = path.join(configFileLocation, loaded.basePath);

  const result = {
    ...loaded,
    basePath: relativeBasePath,
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
 * @param {Configuration} config
 */
export function validate(config: Configuration) {
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

export async function resolveConnections(config: Configuration, resolver?: string): Promise<ConnectionConfig[]> {
  log('Resolving database connections.');

  const filename = path.resolve(process.cwd(), CONNECTIONS_FILENAME);
  const connectionsFileExists = await fs.exists(filename);

  let connections: ConnectionConfig[];

  // Connection resolution process:
  //  1. If connections file exists, use that to resolve connections.
  //  2. If connection resolver is set via flag or configuration, use it.
  //  3. If 1 & 2 are false, try resolving the connections from the environment. If not found fail with error.
  if (connectionsFileExists) {
    connections = await resolveConnectionsFromFile(filename);
  } else if (resolver || config.connectionResolver) {
    connections = await resolveConnectionsUsingResolver(resolver || config.connectionResolver, config);
  } else {
    log('Connections file not provided. Loading connection details from env.');

    connections = resolveConnectionsFromEnv();
  }

  log(
    'Resolved connections: %O',
    connections.map(({ id, client, connection }) => ({
      id,
      client,
      connection: {
        host: (connection as Knex.ConnectionConfig).host,
        database: (connection as Knex.ConnectionConfig).database
      }
    }))
  );

  return connections;
}

/**
 * Resolve connections using the provided connection resolver.
 *
 * @param {string} resolver
 * @param {Configuration} config
 * @returns {Promise<ConnectionConfig[]>}
 */
export async function resolveConnectionsUsingResolver(
  resolver: string,
  config: Configuration
): Promise<ConnectionConfig[]> {
  log('Resolving connection resolver: %s', resolver);

  const resolverPath = resolver ? path.resolve(process.cwd(), resolver) : '';

  const { resolve } = (await import(resolverPath)) as ConnectionResolver;

  if (!resolve) {
    throw new Error(`Resolver '${resolver}' does not expose a 'resolve' function.`);
  }

  return resolve(config);
}

/**
 * Get the connection id from the config.
 *
 * @param {ConnectionConfig} connectionConfig
 * @returns {string}
 */
export function getConnectionId(connectionConfig: ConnectionConfig): string {
  if (connectionConfig.id) {
    return connectionConfig.id;
  }

  const { host, database } = connectionConfig.connection as any;

  return host && database ? `${host}/${database}` : '';
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

  const connectionConfig = {
    id: process.env.DB_ID,
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : null,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      options: {
        encrypt: process.env.DB_ENCRYPTION === 'true'
      }
    }
  } as ConnectionConfig;

  return [connectionConfig];
}

/**
 * Resolve connections from the file.
 *
 * @param {string} filename
 * @returns {Promise<ConnectionConfig[]>}
 */
async function resolveConnectionsFromFile(filename: string): Promise<ConnectionConfig[]> {
  log('Resolving connections file: %s', filename);

  const loaded = await fs.read(filename);
  const { connections } = JSON.parse(loaded) as ConnectionsFileSchema;

  // TODO: Validate the connections received from file.

  return connections;
}
