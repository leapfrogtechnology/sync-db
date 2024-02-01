/**
 * Check if the value is an object.
 * FIX: Add tests.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is an object.
 */
export function isObject(value: any): boolean {
  if (value === null) {
    return false;
  }

  return typeof value === 'function' || typeof value === 'object';
}
