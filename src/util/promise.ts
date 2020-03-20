/**
 * Promiser - A function that returns a promise.
 */
export type Promiser<T> = () => PromiseLike<T>;

/**
 * Run each of the promise sequentially and return their results in the same order.
 *
 * @param {PromiseLike<T>[]} promises
 * @returns {Promise<T[]>}
 */
export async function runSequentially<T>(promisers: Promiser<T>[]): Promise<T[]> {
  const result: T[] = [];

  for (const promiser of promisers) {
    const value = await promiser();

    result.push(value);
  }

  return result;
}
