/**
 * Applies a filter and map functions into an array to return a new array.
 * Note: Saves an additional loop while doing filter & map separately.
 *
 * @param {any[]} list - The list to apply the filter and map functions.
 * @param {(((element: any, index: number) => boolean) | false)} filter - The filter function.
 * @param {(element: any, index: number) => T} [map] - The map function.
 * @returns {T[]} - The new array.
 */
export function fmap<T>(
  list: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  filter: ((element: any, index: number) => boolean) | false, // eslint-disable-line @typescript-eslint/no-explicit-any
  map?: (element: any, index: number) => T // eslint-disable-line @typescript-eslint/no-explicit-any
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
