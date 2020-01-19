import 'mocha';
import { expect } from 'chai';

import { updateInjectedConfigVars } from '../src/services/configInjection';

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
});
