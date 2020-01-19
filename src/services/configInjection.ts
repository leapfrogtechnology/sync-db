import Mapping from '../domain/Mapping';

const REGEX_VAR_EXPANSION = /\$\{([a-zA-Z]\w+)\}/g;

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
    (acc, entry) => Object.assign({}, acc, { [entry[0]]: entry[1] }) as Mapping<string>,
    {} as Mapping<string>
  );

  return result;
}

/**
 * Expands the environment variables present in the string.
 * Returns the string as is, if no variables were present. And,
 * in case the variable used in the string isn't defined it is
 * substituted with an empty string ('').
 *
 *  Example:
 *    Input: 'Current user is ${USER} at ${HOST}.'
 *    Output: 'Current user is kabir at leapfrog.'
 *
 * @param {string} value
 * @returns {string}
 */
export function expandEnvVar(value: string): string {
  return value.replace(REGEX_VAR_EXPANSION, (_, key) => process.env[key] || '');
}
