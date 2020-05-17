import { expect } from 'chai';
import { it, describe } from 'mocha';

import * as ts from '../../../src/util/ts';

describe('UTIL: ts', () => {
  describe('getTimestampString', () => {
    it('should return a timestamp string for the given date instance.', () => {
      const result1 = ts.getTimestampString(new Date('December 17, 1995 03:24:00'));
      const result2 = ts.getTimestampString(new Date('December 17, 1995 15:24:00'));

      expect(result1).to.equal('1995121732400');
      expect(result2).to.equal('1995121732400');
    });

    it('should return a timestamp string with the current date if date is not provided.', () => {
      const result = ts.getTimestampString();

      expect(result.startsWith(new Date().getFullYear().toString()));
      expect(result.length).to.equal(13);
    });

    it('should return a value fully numeric.', () => {
      expect(ts.getTimestampString()).to.match(/^\d+$/);
    });
  });
});
