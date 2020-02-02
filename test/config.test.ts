import { expect } from 'chai';
import { it, describe } from 'mocha';

import { validate, getConnectionId } from '../src/config';
import ConnectionConfig from '../src/domain/ConnectionConfig';

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

  describe('getConnectionId', () => {
    it('should return the config id from the given connection config.', () => {
      expect(
        getConnectionId({
          id: 'test'
        } as ConnectionConfig)
      ).to.equal('test');
    });

    it('should generate a config id using the host and database name if id does not exist.', () => {
      expect(
        getConnectionId({
          host: 'localhost',
          database: 'test'
        } as ConnectionConfig)
      ).to.equal('localhost/test');
    });
  });
});
