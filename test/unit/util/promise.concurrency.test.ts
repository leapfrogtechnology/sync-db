import { expect } from 'chai';
import { it, describe } from 'mocha';

import { timeout, runWithConcurrency } from '../../../src/util/promise';

describe('UTIL: promise', () => {
  describe('runWithConcurrency', () => {
    it('should never exceed the limit and keep the result order.', async () => {
      let active = 0;
      let peak = 0;

      const promisers = [30, 10, 20, 5, 15, 1].map((ms, i) => async () => {
        active++;
        peak = Math.max(peak, active);
        await timeout(ms);
        active--;

        return i;
      });

      const result = await runWithConcurrency(promisers, 2);

      expect(result).to.deep.equal([0, 1, 2, 3, 4, 5]);
      expect(peak).to.equal(2);
    });

    it('should reject if any of the promisers fail.', async () => {
      const promisers = [() => Promise.resolve(1), () => Promise.reject(new Error('boom')), () => Promise.resolve(3)];

      let error: Error | undefined;

      try {
        await runWithConcurrency(promisers, 2);
      } catch (e) {
        error = e as Error;
      }

      expect(error?.message).to.equal('boom');
    });
  });
});
