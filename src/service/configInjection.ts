import * as fs from 'fs';
import * as path from 'path';
import { Knex } from 'knex';

import Mapping from '../domain/Mapping';
import { dbLogger } from '../util/logger';
import SynchronizeContext from '../domain/SynchronizeContext';
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
 * @param {Knex.Transaction} trx
 * @param {SynchronizeContext} context
 * @returns {Promise<void>}
 */
export async function setup(trx: Knex.Transaction, context: SynchronizeContext): Promise<void> {
  const log = dbLogger(context.connectionId);
  const { injectedConfig } = context.config;

  log(`Making sure table ${INJECTED_CONFIG_TABLE} doesn't already exists.`);

  const exists = await trx.schema.hasTable(INJECTED_CONFIG_TABLE);

  // TODO: Think about a better solution; it shouldn't have existed in the first place.
  if (exists) {
    log('Warning: Table "${INJECTED_CONFIG_TABLE}" already exists. It will be dropped.');

    await cleanup(trx, context);
  }

  const values = convertToKeyValuePairs(injectedConfig.vars);

  if (!values.length) {
    log(`Config not available. Skipping insertion on ${INJECTED_CONFIG_TABLE} table.`);

    return;
  }

  // Create table
  log(`Creating table ${INJECTED_CONFIG_TABLE}.`);
  await trx.schema.createTable(INJECTED_CONFIG_TABLE, table => {
    table.string('key').primary();
    table.string('value');
  });

  // Inject the configurations into the created table.
  log(`Injecting config into ${INJECTED_CONFIG_TABLE}.`);
  await trx.insert(values).into(INJECTED_CONFIG_TABLE);

  log(`Injected ${values.length} configurations.`);
}

/**
 * Drop the injected config table.
 *
 * @param {Knex.Transaction} trx
 * @param {SynchronizeContext} context
 * @returns {Promise<void>}
 */
export async function cleanup(trx: Knex.Transaction, context: SynchronizeContext): Promise<void> {
  const log = dbLogger(context.connectionId);

  await trx.schema.dropTableIfExists(INJECTED_CONFIG_TABLE);

  log(`Cleaned up table ${INJECTED_CONFIG_TABLE}.`);
}
