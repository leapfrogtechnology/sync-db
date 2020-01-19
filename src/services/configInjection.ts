import Mapping from '../domain/Mapping';
import { expandEnvVars } from '../util/env';

import Connection from '../Connection';
import SyncConfig from '../domain/SyncConfig';
import KeyValuePair from '../domain/KeyValuePair';

import { version as syncDbVersion } from '../../package.json';

/**
 * Gets all the default config / environment variables
 * that are always available in the injected config table.
 *
 * @returns {Mapping<string>}
 */
function getDefaultSystemVars(): Mapping<string> {
  return {
    sync_db_version: syncDbVersion
  };
}

/**
 * Prepares config vars for injecting into the target database.
 *
 * @param {Mapping<string>} vars
 * @returns {Mapping<string>}
 */
export function prepareInjectionConfigVars(vars: Mapping<string>): Mapping<string> {
  return updateInjectedConfigVars({ ...vars, ...getDefaultSystemVars() });
}

/**
 * Update variables to be injected and expand
 * environment variables to be expanded.
 *
 * @param {Mapping<string>} vars
 * @returns {Mapping<string>}
 */
export function updateInjectedConfigVars(vars: Mapping<string>): Mapping<string> {
  const entries = Object.entries(vars);
  const result = entries.reduce(
    (acc, entry) => Object.assign({}, acc, { [entry[0]]: expandEnvVars(entry[1]) }) as Mapping<string>,
    {} as Mapping<string>
  );

  return result;
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
