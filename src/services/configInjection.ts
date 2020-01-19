import Mapping from '../domain/Mapping';
import { expandEnvVars } from '../util/env';

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
