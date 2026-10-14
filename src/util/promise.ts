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
 * @returns {Promise<T[]>}
 */
export async function runSequentially<T>(promisers: Promiser<T>[]): Promise<T[]> {
  const result: T[] = [];

  for (const promiser of promisers) {
    try {
      const value = await promiser();

      result.push(value);
    } catch (err) {
      const error = err as any;

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

/**
 * Run the promisers with at most `limit` of them in flight at a time.
 * Results are returned in the same order as the promisers. Like `Promise.all`, rejects on the first failure
 * while the already queued promisers keep running.
 *
 * @param {Promiser<T>[]} promisers
 * @param {number} limit
 * @returns {Promise<T[]>}
 */
export function runWithConcurrency<T>(promisers: Promiser<T>[], limit: number): Promise<T[]> {
  const max = Math.max(1, Math.floor(limit) || 1);
  const queue: (() => void)[] = [];
  let active = 0;

  const next = () => {
    active--;
    queue.shift()?.();
  };

  const run = (promiser: Promiser<T>) =>
    new Promise<T>((resolve, reject) => {
      const start = () => {
        active++;
        Promise.resolve().then(promiser).then(resolve, reject).finally(next);
      };

      if (active < max) {
        start();
      } else {
        queue.push(start);
      }
    });

  return Promise.all(promisers.map(run));
}
