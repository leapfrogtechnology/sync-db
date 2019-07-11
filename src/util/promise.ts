/**
 * Run each of the promise sequentially.
 *
 * @param {Awaitable<T>[]} promises
 * @returns {Promise<void>}
 */
export async function runSequentially<T>(promises: Promise<T>[]): Promise<void> {
  for (const promise of promises) {
    await promise;
  }
}
