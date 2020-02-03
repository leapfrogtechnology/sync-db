/**
 * Check if the value is an object.
 * TODO: Add tests.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isObject(value: any): boolean {
  if (value === null) {
    return false;
  }

  return typeof value === 'function' || typeof value === 'object';
}
