import { expect } from 'chai';
import 'mocha';

import { isObject } from '../../../src/util/types';

describe('UTIL: types', () => {
  describe('isObject', () => {
    it('should return true if it is an object.', () => {
      expect(isObject({ foo: 'bar' })).to.equal(true);
      expect(isObject({})).to.equal(true);
      expect(isObject(new Object())).to.equal(true);
      expect(isObject(() => 'test')).to.equal(true);
      expect(isObject(['foo', 'bar'])).to.equal(true);
    });

    it('should return false for a scalar value.', () => {
      expect(isObject(5)).to.equal(false);
      expect(isObject(-5)).to.equal(false);
      expect(isObject(1.098)).to.equal(false);
      expect(isObject('foo')).to.equal(false);
      expect(isObject(true)).to.equal(false);
      expect(isObject(false)).to.equal(false);
      expect(isObject(null)).to.equal(false);
      expect(isObject()).to.equal(false);
    });
  });
});
