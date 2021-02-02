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
    throw new Error('The first argument must be an array.');
  }

  if (filter && typeof filter !== 'function') {
    throw new Error('Second argument must be a filter function.');
  }

  if (map && typeof map !== 'function') {
    throw new Error('Third argument must be a map function.');
  }

  const result = [];

  for (let index = 0; index < list.length; index++) {
    // If no filter function supplied - apply no filter.
    // If provided the condition must hold truthy to include it.
    if (filter && !filter(list[index], index)) {
      continue;
    }

    result.push(map ? map(list[index], index) : list[index]);
  }

  return result;
}
