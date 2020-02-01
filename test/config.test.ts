import 'mocha';
import { expect } from 'chai';

import { validate } from '../src/config';

describe('config:', () => {
  describe('validate', () => {
    it('throws error if injectedConfig.table is not found in the config.', () => {
      expect(() =>
        validate({
          injectedConfig: {
            table: ''
          }
        } as any)
      ).to.throw('Invalid configuration value for `injectedConfig.table`.');

      expect(() =>
        validate({
          injectedConfig: {
            table: '      '
          }
        } as any)
      ).to.throw('Invalid configuration value for `injectedConfig.table`.');
    });

    it('throws error if injectedConfig.vars is not found or is invalid in the config.', () => {
      expect(() =>
        validate({
          injectedConfig: {
            table: 'test',
            vars: 'foobar'
          }
        } as any)
      ).to.throw('Invalid configuration value for `injectedConfig.vars`.');

      expect(() =>
        validate({
          injectedConfig: {
            table: 'test'
          }
        } as any)
      ).to.throw('Invalid configuration value for `injectedConfig.vars`.');
    });

    it('should return without error if the configuration is valid.', () => {
      validate({
        injectedConfig: {
          table: '__injected_config',
          vars: {}
        }
      } as any);
    });
  });
});
