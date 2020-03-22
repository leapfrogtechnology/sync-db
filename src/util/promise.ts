import { promisify } from 'util';

/**
 * Promiser - A function that returns a promise.
 */
export type Promiser<T> = () => PromiseLike<T>;

/**
 * Resolve a promise after a timeout.
 */
export const timeout = promisify(setTimeout);

/**
 * Run each of the promise sequentially and return their results in the same order.
 *
 * @param {Promiser<T>[]} promisers
 * @param {boolean} [failCascade=true]
 * @returns {(Promise<(T | Error)[]>)}
 */
export async function runSequentially<T>(
  promisers: Promiser<T>[],
  failCascade: boolean = true
): Promise<(T | Error)[]> {
  const result: (T | Error)[] = [];

  for (const promiser of promisers) {
    try {
      const value = await promiser();

      result.push(value);
    } catch (err) {
      // If failCascade = true,
      // any error (promise rejection) will be cascaded thus halting the process.
      if (failCascade) {
        throw err;
      }

      // If failCascade = false,
      // the failed promise will be resolved with the rejected error as a value.
      result.push(err instanceof Error ? err : new Error(err));
    }
  }

  return result;
}
