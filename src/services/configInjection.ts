import * as fs from 'fs';
import * as path from 'path';

import { dbLogger } from '../logger';
import Connection from '../Connection';
import Mapping from '../domain/Mapping';
import SyncConfig from '../domain/SyncConfig';
import { expandEnvVarsInMap } from '../util/env';
import KeyValuePair from '../domain/KeyValuePair';
import { INJECTED_CONFIG_TABLE } from '../constants';

/**
 * Reads and returns the package.json contents.
 *
 * @returns {*}
 */
export function getPackageMetadata(): any {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString());
}

/**
 * Gets all the default injected config vars that needs to be
 * always available in the injected config table.
 *
 * @returns {Mapping<string>}
 */
function getDefaultSystemVars(): Mapping<string> {
  // TODO: Add any default config vars here that should always
  // be available in the __injected_config table.
  return {};
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
 * @returns {Promise<void>}
 */
export async function setup(connection: Connection, config: SyncConfig): Promise<void> {
  const logDb = dbLogger(connection);
  const { injectedConfig } = config;

  logDb(`Making sure table ${INJECTED_CONFIG_TABLE} doesn't already exists.`);

  const exists = await connection.schema().hasTable(INJECTED_CONFIG_TABLE);

  // TODO: Think about a better solution; it shouldn't have existed in the first place.
  if (exists) {
    logDb('Warning: Table "${INJECTED_CONFIG_TABLE}" already exists. It will be dropped.');

    await cleanup(connection, config);
  }

  const values = convertToKeyValuePairs(injectedConfig.vars);

  // Create table
  logDb(`Creating table ${INJECTED_CONFIG_TABLE}.`);
  await connection.schema().createTable(INJECTED_CONFIG_TABLE, table => {
    table.string('key').primary();
    table.string('value');
  });

  // Inject the configurations into the created table.
  logDb(`Injecting config into ${INJECTED_CONFIG_TABLE}.`);
  await connection
    .getInstance()
    .insert(values)
    .into(INJECTED_CONFIG_TABLE);

  logDb(`Inserted configurations: ${values.length}.`);
}

/**
 * Drop the injected config table.
 *
 * @param {Connection} connection
 * @param {SyncConfig} config
 * @returns {Promise<void>}
 */
export async function cleanup(connection: Connection, config: SyncConfig): Promise<void> {
  const logDb = dbLogger(connection);

  await connection.schema().dropTableIfExists(INJECTED_CONFIG_TABLE);

  logDb(`Cleaned up table ${INJECTED_CONFIG_TABLE}.`);
}
