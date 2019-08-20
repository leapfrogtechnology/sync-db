/**
 * Returns true if all the elements in the array evaluate to true.
 *
 * @param {T[]} arr
 * @returns {boolean}
 */
export function all<T>(arr: T[]): boolean {
  for (const element of arr) {
    if (!element) { return false; }
  }

  return true;
}
