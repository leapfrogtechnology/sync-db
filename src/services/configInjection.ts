import * as fs from 'fs';
import * as path from 'path';

import { dbLogger } from '../logger';
import Mapping from '../domain/Mapping';
import { expandEnvVarsInMap } from '../util/env';

import Connection from '../Connection';
import SyncConfig from '../domain/SyncConfig';
import KeyValuePair from '../domain/KeyValuePair';

/**
 * Reads and returns the package.json contents.
 *
 * @returns {*}
 */
export function getPackageMetadata(): any {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString());
}

/**
 * Gets all the default config / environment variables
 * that are always available in the injected config table.
 *
 * @returns {Mapping<string>}
 */
function getDefaultSystemVars(): Mapping<string> {
  const { version } = getPackageMetadata();

  return {
    sync_db_version: version
  };
}

/**
 * Prepares config vars for injecting into the target database.
 *
 * @param {Mapping<string>} vars
 * @returns {Mapping<string>}
 */
export function prepareInjectionConfigVars(vars: Mapping<string>): Mapping<string> {
  return expandEnvVarsInMap({ ...vars, ...getDefaultSystemVars() });
}

/**
 * Convert an object (map of key => value) into an array of key / value pairs.
 *
 * @param {Mapping<string>} vars
 * @returns {KeyValuePair[]}
 */
export function convertToKeyValuePairs(vars: Mapping<string>): KeyValuePair[] {
  return Object.entries(vars).map(([key, value]) => ({ key, value }));
}

/**
 * Setup the table in the database with the injected config.
 *
 * @param {Connection} connection
 * @param {SyncConfig} config
 */
export async function setup(connection: Connection, config: SyncConfig) {
  const logDb = dbLogger(connection);
  const { injectedConfig } = config;

  logDb(`Making sure table ${injectedConfig.table} doesn't already exists.`);

  const exists = await connection.schema().hasTable(injectedConfig.table);

  if (exists) {
    throw new Error(`Table "${injectedConfig.table}" already exists.`);
  }

  const values = convertToKeyValuePairs(injectedConfig.vars);

  // Create table
  logDb(`Creating table ${injectedConfig.table}.`);
  await connection.schema().createTable(injectedConfig.table, table => {
    table.string('key').primary();
    table.string('value');
  });

  // Inject the configurations into the created table.
  logDb(`Injecting config into ${injectedConfig.table}.`);
  await connection
    .getInstance()
    .insert(values)
    .into(injectedConfig.table);

  logDb(`Inserted configurations: ${values.length}.`);
}

/**
 * Drop the injected config table.
 *
 * @param {Connection} connection
 * @param {SyncConfig} config
 */
export async function cleanup(connection: Connection, config: SyncConfig) {
  const logDb = dbLogger(connection);

  await connection.schema().dropTableIfExists(config.injectedConfig.table);

  logDb(`Cleaned up table ${config.injectedConfig.table}.`);
}
