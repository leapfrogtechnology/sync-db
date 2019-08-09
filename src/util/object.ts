/**
 * Get the copy of object without attributes.
 *
 * @param {any} obj
 * @param {any[]} attrsToExclude
 * @returns {T}
 */
export function withoutAttrs<T>(obj: any, attrsToExclude: any[]): T {
  if (Array.isArray(obj)) {
    // It is recommended to use listWithoutAttrs() function instead for arrays.
    throw new TypeError('withoutAttrs() expects first argument to be a plain object, array given.');
  }

  const result: any = {};

  Object.keys(obj).forEach((key: string) => {
    if (!attrsToExclude.includes(key)) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Get the copy of list of objects without attributes.
 *
 * @param {object[]} obj
 * @param {any[]} attrsToExclude
 * @returns {T[]}
 */
export function listWithoutAttrs<T>(obj: object[], attrsToExclude: any[]): T[] {
  return obj.map(item => withoutAttrs<T>(item, attrsToExclude));
}
