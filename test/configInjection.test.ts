import 'mocha';
import { expect } from 'chai';

import { updateInjectedConfigVars } from '../src/services/configInjection';

describe('Services: configInjection', () => {
  describe('updateInjectedConfigVars', () => {
    it('should return a normal map of object just-as-is', () => {
      const vars = {
        var1: 'Foo',
        var2: 'Bar',
        var3: 'Baz'
      };
      expect(updateInjectedConfigVars(vars)).to.deep.equal(vars);
    });

    it('should expand all the environment variables found in the values', () => {
      const vars = {
        var1: 'Foo',
        var2: 'Bar',
        var3: '${TEST_ENV_VALUE1}',
        var4: '${TEST_ENV_VALUE2}'
      };

      expect(updateInjectedConfigVars(vars)).to.deep.equal({
        var1: 'Foo',
        var2: 'Bar',
        var3: 'Test value 1',
        var4: 'Test value 2'
      });
    });
  });
});
