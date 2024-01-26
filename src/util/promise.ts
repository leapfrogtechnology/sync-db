import { promisify } from 'node:util';

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
    } catch (error_) {
      const error = error_ as any;

      if (error.error) {
        throw error.error;
      }

      if (error.originalError) {
        throw error.originalError;
      }

      throw error;
    }
  }

  return result;
}
