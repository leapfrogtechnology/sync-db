import { it, describe } from 'mocha';
import { expect } from 'chai';
import { promisify } from 'util';

import * as promise from '../src/util/promise';

const timeout = promisify(setTimeout);

describe('UTIL: promise', () => {
  describe('runSequentially', () => {
    it('should resolve a promise containing the results of the promises in the same order.', async () => {
      const promises = [
        timeout(100).then(() => 1),
        timeout(80).then(() => 2),
        timeout(60).then(() => 3),
        timeout(40).then(() => 4),
        timeout(20).then(() => 5),
        timeout(0).then(() => 6)
      ];

      const result = await promise.runSequentially(promises);

      expect(result).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });
});
