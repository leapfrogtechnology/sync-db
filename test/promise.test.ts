import { expect } from 'chai';
import { it, describe } from 'mocha';

import { timeout, runSequentially } from '../src/util/promise';

describe('UTIL: promise', () => {
  describe('runSequentially', () => {
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

      const result = await runSequentially(promisers);

      expect(tracker).to.deep.equal(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(result).to.deep.equal(['A', 'B', 'C', 'D', 'E', 'F']);
    });

    it('should resolve a promise containing the results of the promises in the same order.', async () => {
      const source = [{ value: 'one' }, { value: 'two' }, { value: 'three' }, { value: 'four' }, { value: 'five' }];
      const promisers = source.map(({ value }) => () => Promise.resolve(value));

      const result = await runSequentially(promisers);

      expect(result).to.deep.equal(['one', 'two', 'three', 'four', 'five']);
    });

    it('should throw an error (reject) if any promise fails, when failCascade = true. (default)', async () => {
      const promisers = [
        () => Promise.resolve('one'),
        () => Promise.reject('An error occurred.'),
        () => Promise.resolve('three'),
        () => Promise.reject(new Error('A second error occurred.')),
        async () => {
          throw new Error('Another error occurred.');
        }
      ];

      expect(runSequentially(promisers, true)).to.be.eventually.rejectedWith('An error occurred.');
    });

    it('should run and resolve all the promises when failCascade = false.', async () => {
      const promisers = [
        () => Promise.resolve('one'),
        () => Promise.reject('An error occurred.'),
        () => Promise.resolve('three'),
        () => Promise.reject(new Error('A second error occurred.')),
        async () => {
          throw new Error('Another error occurred.');
        }
      ];

      const result = await runSequentially(promisers, false);

      expect(result).to.have.lengthOf(5);
      expect(result[0]).to.equal('one');
      expect(result[1]).to.instanceOf(Error);
      expect(result[1].toString()).to.equal('Error: An error occurred.');
      expect(result[2]).to.equal('three');
      expect(result[3]).to.instanceOf(Error);
      expect(result[3].toString()).to.equal('Error: A second error occurred.');
      expect(result[4]).to.instanceOf(Error);
      expect(result[4].toString()).to.equal('Error: Another error occurred.');
    });
  });
});
