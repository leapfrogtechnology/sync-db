/**
 * Applies a filter and map functions into an array to return a new array.
 *
 * Note: Saves an additional loop while doing filter & map separately.
 *
 * @param {any[]} list
 * @param {(((element: any, index: number) => boolean) | false)} filter
 * @param {(element: any, index: number) => T} [map]
 * @returns {T[]}
 */
export function fmap<T>(
  list: any[],
  filter: ((element: any, index: number) => boolean) | false,
  map?: (element: any, index: number) => T
): T[] {
  if (!Array.isArray(list)) {
    throw new TypeError('The first argument must be an array.');
  }

  if (filter && typeof filter !== 'function') {
    throw new Error('Second argument must be a filter function.');
  }

  if (map && typeof map !== 'function') {
    throw new Error('Third argument must be a map function.');
  }

  const result = [];

  for (const [index, element] of list.entries()) {
    // If no filter function supplied - apply no filter.
    // If provided the condition must hold truthy to include it.
    if (filter && !filter(element, index)) {
      continue;
    }

    result.push(map ? map(element, index) : element);
  }

  return result;
}
