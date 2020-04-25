/**
 * Applies a filter and map functions into an array to return a new array.
 *
 * Note: Saves an additional loop while doing filter & map separately.
 *
 * @param {any[]} list
 * @param {(element: any, index: number) => boolean} filter
 * @param {(element: any, index: number) => T} [map]
 */
export function fmap<T>(
  list: any[],
  filter: (element: any, index: number) => boolean,
  map?: (element: any, index: number) => T
) {
  if (!Array.isArray(list)) {
    throw new Error('The first argument must be an array.');
  }

  if (typeof filter !== 'function') {
    throw new Error('Second argument must be a filter function.');
  }

  if (map && typeof map !== 'function') {
    throw new Error('Third argument must be a map function.');
  }

  const result = [];

  for (const [index, value] of list.entries()) {
    if (!filter(value, index)) {
      continue;
    }

    result.push(map ? map(value, index) : value);
  }

  return result;
}
