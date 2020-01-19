import 'mocha';
import { expect } from 'chai';

import {
  prepareInjectionConfigVars,
  convertToKeyValuePairs,
  getPackageMetadata
} from '../src/services/configInjection';

describe('Services: configInjection', () => {
  const { version } = getPackageMetadata();

  describe('prepareInjectionConfigVars', () => {
    it('should return the default vars for injection even if empty object is given', async () => {
      const result = prepareInjectionConfigVars({});

      expect(result).to.deep.equal({
        sync_db_version: version
      });
    });

    it('should return both the added vars and the default vars for injection', async () => {
      process.env.TEST_ENV_VALUE1 = 'Bar';

      const result = prepareInjectionConfigVars({
        var1: 'Foo',
        var2: '${TEST_ENV_VALUE1}'
      });

      expect(result).to.deep.equal({
        var1: 'Foo',
        var2: 'Bar',
        sync_db_version: version
      });

      // Cleanup
      process.env.TEST_ENV_VALUE1 = undefined;
    });
  });

  describe('convertToKeyValuePairs', () => {
    it('should convert an empty object into an empty array', () => {
      expect(convertToKeyValuePairs({})).to.deep.equal([]);
    });

    it('should convert an object into an array of key / value pairs', () => {
      const input = {
        flag1: 'true',
        flag2: 'false'
      };
      const expected = [
        { key: 'flag1', value: 'true' },
        { key: 'flag2', value: 'false' }
      ];

      expect(convertToKeyValuePairs(input)).to.deep.equal(expected);
    });
  });
});
