import 'mocha';
import { expect } from 'chai';

import { version as syncDbVersion } from '../package.json';
import {
  updateInjectedConfigVars,
  prepareInjectionConfigVars,
  convertToKeyValuePairs
} from '../src/services/configInjection';

describe('Services: configInjection', () => {
  describe('updateInjectedConfigVars', () => {
    it('should return an empty object just-as-is', () => {
      const vars = {};
      const result = updateInjectedConfigVars(vars);

      expect(result).to.deep.equal(vars);
    });

    it('should return a normal map of object just-as-is', () => {
      const vars = {
        var1: 'Foo',
        var2: 'Bar',
        var3: 'Baz'
      };
      const result = updateInjectedConfigVars(vars);

      expect(result).to.deep.equal(vars);
    });

    it('should expand all the environment variables found in the values', () => {
      process.env.TEST_ENV_VALUE1 = 'Test value 1';
      process.env.TEST_ENV_VALUE2 = 'Test value 2';
      process.env.TEST_FIRST_NAME = 'Kabir';
      process.env.TEST_LAST_NAME = 'Baidhya';

      const vars = {
        var1: 'Foo',
        var2: 'Bar',
        var3: '${TEST_ENV_VALUE1}',
        var4: '${TEST_ENV_VALUE2}',
        var5: '${TEST_FIRST_NAME} ${TEST_LAST_NAME}',
        var6: '${TEST_UNDEFINED_VALUE}'
      };
      const result = updateInjectedConfigVars(vars);

      expect(result).to.deep.equal({
        var1: 'Foo',
        var2: 'Bar',
        var3: 'Test value 1',
        var4: 'Test value 2',
        var5: 'Kabir Baidhya',
        var6: ''
      });

      // Cleanup
      process.env.TEST_ENV_VALUE1 = undefined;
      process.env.TEST_ENV_VALUE2 = undefined;
      process.env.TEST_FIRST_NAME = undefined;
      process.env.TEST_LAST_NAME = undefined;
    });
  });

  describe('prepareInjectionConfigVars', () => {
    it('should return the default vars for injection even if empty object is given', async () => {
      const result = prepareInjectionConfigVars({});

      expect(result).to.deep.equal({
        sync_db_version: syncDbVersion
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
        sync_db_version: syncDbVersion
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
