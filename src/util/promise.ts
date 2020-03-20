/**
 * Run each of the promise sequentially and return their results in the same order.
 *
 * @param {PromiseLike<T>[]} promises
 * @returns {Promise<T[]>}
 */
export async function runSequentially<T>(promises: PromiseLike<T>[]): Promise<T[]> {
  const result: T[] = [];

  for (const promise of promises) {
    const value = await promise;

    result.push(value);
  }

  return result;
}
