import 'mocha';
import { expect } from 'chai';

import { expandEnvVars } from '../src/util/env';

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
});
