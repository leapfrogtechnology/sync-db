import { promisify } from 'util';
import isNil from 'ramda/src/isNil';
import flatten from 'ramda/src/flatten';

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
 * @returns {Promise<T[]>}
 */
export async function runSequentially<T>(promisers: Promiser<T>[]): Promise<T[]> {
  const result: T[] = [];

  for (const promiser of promisers) {
    try {
      const value = await promiser();

      result.push(value);
    } catch (err) {
      const errors = err as any;

      if (errors.error) {
        result.push(errors.error);
      }

      if (errors.originalError) {
        result.push(errors.originalError);
      }

      result.push(errors);
      throw flatten(result.filter(r => !isNil(r)));
    }
  }

  return result;
}
