const REGEX_VAR_EXPANSION = /\$\{([a-zA-Z]\w+)\}/g;

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
export function expandEnvVars(value: string): string {
  return value.replace(REGEX_VAR_EXPANSION, (_, key) => process.env[key] || '');
}
