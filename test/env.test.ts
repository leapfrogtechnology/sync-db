import 'mocha';
import { expect } from 'chai';

import { expandEnvVars, expandEnvVarsInMap } from '../src/util/env';

describe('UTIL: env', () => {
  describe('expandEnvVars', () => {
    afterEach(() => {
      process.env.TEST1 = undefined;
      process.env.TEST2 = undefined;
    });

    it('should return a regular string (w/o env variable) as-is.', () => {
      expect(expandEnvVars('')).to.equal('');
      expect(expandEnvVars('Hello World')).to.equal('Hello World');
    });

    it('should expand an environment variable value.', () => {
      process.env.TEST1 = 'Foo bar';

      const result = expandEnvVars('${TEST1}');

      expect(result).to.equal('Foo bar');
    });

    it("should substitute an empty string in-place of the variable if the variable isn't defined.", () => {
      expect(expandEnvVars('${TEST_UNDEFINED_VARIABLE}')).to.equal('');
      expect(expandEnvVars('Substituted value = "${TEST_UNDEFINED_VARIABLE}"')).to.equal('Substituted value = ""');
    });

    it('should expand a string containing an environment variable.', () => {
      process.env.TEST1 = 'Foo bar';

      const result = expandEnvVars('Substituted value = "${TEST1}"');

      expect(result).to.equal('Substituted value = "Foo bar"');
    });

    it('should expand a multiple environment variables.', () => {
      process.env.TEST1 = 'Foo bar';
      process.env.TEST2 = 'Bar foo';

      const result = expandEnvVars('Substituted values are: "${TEST1}" and "${TEST2}"');

      expect(result).to.equal('Substituted values are: "Foo bar" and "Bar foo"');
    });
  });

  describe('updateInjectedConfigVars', () => {
    it('should return an empty object just-as-is', () => {
      const vars = {};
      const result = expandEnvVarsInMap(vars);

      expect(result).to.deep.equal(vars);
    });

    it('should return a normal map of object just-as-is', () => {
      const vars = {
        var1: 'Foo',
        var2: 'Bar',
        var3: 'Baz'
      };
      const result = expandEnvVarsInMap(vars);

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
      const result = expandEnvVarsInMap(vars);

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
