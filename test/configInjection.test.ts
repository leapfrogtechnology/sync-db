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
  });
});
