import { expect } from 'chai';
import { it, describe } from 'mocha';

import ConnectionConfig from '../../src/domain/ConnectionConfig';
import { validate, getConnectionId, resolveConnectionsFromEnv } from '../../src/config';

describe('CONFIG:', () => {
  describe('resolveConnectionsFromEnv', () => {
    it('should return the connection using the env vars.', () => {
      process.env.DB_CLIENT = 'mssql';
      process.env.DB_ID = 'mydb';
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '1234';
      process.env.DB_USERNAME = 'user';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'database';

      const connections = resolveConnectionsFromEnv();

      expect(connections[0]).to.deep.equal({
        client: 'mssql',
        id: 'mydb',
        host: 'localhost',
        port: 1234,
        user: 'user',
        password: 'password',
        database: 'database',
        options: {
          encrypt: false
        }
      });

      // Cleanup
      process.env.DB_CLIENT = '';
      process.env.DB_ID = '';
      process.env.DB_HOST = '';
      process.env.DB_PORT = '';
      process.env.DB_USERNAME = '';
      process.env.DB_PASSWORD = '';
      process.env.DB_NAME = '';
    });

    it('should throw an error if the required env vars are not provided.', () => {
      expect(() => resolveConnectionsFromEnv()).to.throw(
        'Following environment variables were not set: DB_HOST, DB_PASSWORD, DB_NAME, DB_USERNAME, DB_PORT, DB_CLIENT'
      );
    });
  });

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
