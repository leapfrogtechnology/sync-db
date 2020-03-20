import { it, describe } from 'mocha';
import { expect } from 'chai';
import { promisify } from 'util';

import * as promise from '../src/util/promise';

const timeout = promisify(setTimeout);

describe('UTIL: promise', () => {
  it('should run promises sequentially returning their corresponding results.', async () => {
    const tracker: string[] = [];

    const promisers = [
      () =>
        timeout(100)
          .then(() => tracker.push('A'))
          .then(() => 'A'),
      () =>
        timeout(80)
          .then(() => tracker.push('B'))
          .then(() => 'B'),
      () =>
        timeout(60)
          .then(() => tracker.push('C'))
          .then(() => 'C'),
      () =>
        timeout(40)
          .then(() => tracker.push('D'))
          .then(() => 'D'),
      () =>
        timeout(20)
          .then(() => tracker.push('E'))
          .then(() => 'E'),
      () =>
        timeout(0)
          .then(() => tracker.push('F'))
          .then(() => 'F')
    ];

    const result = await promise.runSequentially(promisers);

    expect(tracker).to.deep.equal(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(result).to.deep.equal(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  describe('runSequentially', () => {
    it('should resolve a promise containing the results of the promises in the same order.', async () => {
      const promises = [
        () => timeout(100).then(() => 1),
        () => timeout(80).then(() => 2),
        () => timeout(60).then(() => 3),
        () => timeout(40).then(() => 4),
        () => timeout(20).then(() => 5),
        () => timeout(0).then(() => 6)
      ];

      const result = await promise.runSequentially(promises);

      expect(result).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });
});
