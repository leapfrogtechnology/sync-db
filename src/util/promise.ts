/**
 * Run each of the promise sequentially.
 *
 * @param {PromiseLike<T>[]} promises
 * @returns {Promise<void>}
 */
export async function runSequentially<T>(promises: PromiseLike<T>[]): Promise<void> {
  for (const promise of promises) {
    await promise;
  }
}
