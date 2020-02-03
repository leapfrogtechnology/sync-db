import 'mocha';
import { expect } from 'chai';

import { validate } from '../src/config';

describe('config:', () => {
  describe('validate', () => {
    it('throws error if injectedConfig.vars is not found or is invalid in the config.', () => {
      expect(() => validate({ injectedConfig: { vars: 'foobar' } } as any)).to.throw(
        'Invalid configuration value for `injectedConfig.vars`.'
      );

      expect(() => validate({ injectedConfig: {} } as any)).to.throw(
        'Invalid configuration value for `injectedConfig.vars`.'
      );
    });

    it('should return without error if the configuration is valid.', () => {
      validate({
        injectedConfig: {
          vars: {}
        }
      } as any);
    });
  });
});
