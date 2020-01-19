import 'mocha';
import { expect } from 'chai';

import { updateInjectedConfigVars, expandEnvVar } from '../src/services/configInjection';

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

  describe('expandEnvVar', () => {
    afterEach(() => {
      process.env.TEST1 = undefined;
      process.env.TEST2 = undefined;
    });

    it('should return a regular string (w/o env variable) as-is.', () => {
      expect(expandEnvVar('')).to.equal('');
      expect(expandEnvVar('Hello World')).to.equal('Hello World');
    });

    it('should expand an environment variable value.', () => {
      process.env.TEST1 = 'Foo bar';

      const result = expandEnvVar('${TEST1}');

      expect(result).to.equal('Foo bar');
    });

    it("should substitute an empty string in-place of the variable if the variable isn't defined.", () => {
      expect(expandEnvVar('${TEST_UNDEFINED_VARIABLE}')).to.equal('');
      expect(expandEnvVar('Substituted value = "${TEST_UNDEFINED_VARIABLE}"')).to.equal('Substituted value = ""');
    });

    it('should expand a string containing an environment variable.', () => {
      process.env.TEST1 = 'Foo bar';

      const result = expandEnvVar('Substituted value = "${TEST1}"');

      expect(result).to.equal('Substituted value = "Foo bar"');
    });

    it('should expand a multiple environment variables.', () => {
      process.env.TEST1 = 'Foo bar';
      process.env.TEST2 = 'Bar foo';

      const result = expandEnvVar('Substituted values are: "${TEST1}" and "${TEST2}"');

      expect(result).to.equal('Substituted values are: "Foo bar" and "Bar foo"');
    });
  });
});
