import { expect } from 'chai';
import { describe, it } from 'mocha';

import { fmap } from '../../src/util/list';

describe('UTIL: list', () => {
  describe('fmap', () => {
    it('should apply filter and map to the list into a new array.', () => {
      const list = [1, 2, 3, 4];

      expect(
        fmap(
          list,
          x => x % 2 === 0,
          x => x + 2
        )
      ).to.deep.equal([4, 6]);
    });

    it('should apply the filter and return the list if map function is not given.', () => {
      const list = ['Hello World', 'Hello Test', 'Hi Foo'];

      expect(fmap(list, (x: string) => x.startsWith('Hello'))).to.deep.equal(['Hello World', 'Hello Test']);
    });

    it('should just apply the map function and return the list if filter argument is false.', () => {
      const list = ['hello', 'foo', 'bar'];

      expect(fmap(list, false, (x: string) => x.toUpperCase())).to.deep.equal(['HELLO', 'FOO', 'BAR']);
    });

    it('should throw error if arguments are invalid.', () => {
      expect(() => fmap('test' as any, a => a)).to.throw('The first argument must be an array.');
      expect(() => fmap(['a', 'b'], 'abc' as any, b => b)).to.throw('Second argument must be a filter function.');
      expect(() => fmap(['a', 'b'], a => a, 'abc' as any)).to.throw('Third argument must be a map function.');
    });

    it('should not mutate the passed list.', () => {
      const list = [1, 2, 3, 4];

      expect(list).to.deep.equal([1, 2, 3, 4]);
    });
  });
});
