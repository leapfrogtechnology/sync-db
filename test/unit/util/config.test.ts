import * as path from 'path';
import { expect } from 'chai';
import * as yaml from 'yamljs';
import { it, describe } from 'mocha';

import { mkdtemp, write } from '../../../src/util/fs';
import Configuration from '../../../src/domain/Configuration';
import ConnectionConfig from '../../../src/domain/ConnectionConfig';
import { validate, getConnectionId, resolveConnectionsFromEnv, isCLI, loadConfig } from '../../../src/config';

describe('CONFIG:', () => {
  describe('isCLI', () => {
    afterEach(() => {
      process.env.SYNC_DB_CLI = '';
    });

    it('should return true if it is run in the CLI environment.', () => {
      process.env.SYNC_DB_CLI = 'true';

      expect(isCLI()).to.equal(true);
    });

    it('should return false if it is not run in the CLI environment.', () => {
      expect(isCLI()).to.equal(false);
    });
  });

  describe('resolveConnectionsFromEnv', () => {
    it('should return the connection using the env vars.', () => {
      process.env.DB_CLIENT = 'mssql';
      process.env.DB_ID = 'mydb';
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '1234';
      process.env.DB_USERNAME = 'user';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'database';
      process.env.DB_SERVER = 'localhost';

      const connections = resolveConnectionsFromEnv();

      expect(connections[0]).to.deep.equal({
        id: 'mydb',
        client: 'mssql',
        connection: {
          host: 'localhost',
          port: 1234,
          user: 'user',
          password: 'password',
          database: 'database',
          server: 'localhost',
          userName: 'user',
          options: {
            encrypt: false
          }
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
      process.env.DB_SERVER = '';
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
          connection: {
            host: 'localhost',
            database: 'test'
          }
        } as ConnectionConfig)
      ).to.equal('localhost/test');
    });

    it('should return empty string when id is not provided and connection string is passed.', () => {
      expect(getConnectionId({ connection: 'someconnectionstring' } as ConnectionConfig)).to.equal('');
    });
  });

  describe('loadConfig', () => {
    it('should load the config file that is provided.', async () => {
      const cwd = await mkdtemp();
      await write(
        path.join(cwd, 'sync-db.yml'),
        yaml.stringify({
          migration: {
            directory: 'migration',
            sourceType: 'javascript'
          }
        } as Configuration)
      );

      await write(
        path.join(cwd, 'sync-db-test.yml'),
        yaml.stringify({
          migration: {
            directory: 'migration',
            sourceType: 'typescript'
          }
        } as Configuration)
      );
      process.chdir(cwd);
      const config = await loadConfig();
      expect(config.migration.sourceType).to.equal('javascript');

      process.chdir(cwd);
      const config1 = await loadConfig('sync-db-test.yml');
      expect(config1.migration.sourceType).to.equal('typescript');
    });

    it('should load the config file only if it matches the naming convention.', async () => {
      const cwd = await mkdtemp();

      await write(
        path.join(cwd, 'sync-db-test.yml'),
        yaml.stringify({
          migration: {
            directory: 'migration',
            sourceType: 'typescript'
          }
        } as Configuration)
      );

      process.chdir(cwd);

      await expect(loadConfig('sync-db-test.yml')).not.to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );

      const config = await loadConfig('sync-db-test.yml');
      expect(config).to.have.property('migration');
    });

    it(`should throw an error if the config file doesn't match the naming convention.`, async () => {
      await expect(loadConfig('sync-db.txt')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
      await expect(loadConfig('sync-db-test.js')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
      await expect(loadConfig('sync.yml')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
      await expect(loadConfig('sync-db.yml.txt')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
      await expect(loadConfig('sync-db-.yml')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
      await expect(loadConfig('sync-dbasdfghjkl.yml')).to.be.rejectedWith(
        Error,
        `The config filename doesn't match the pattern sync-db.yml or sync-db-*.yml`
      );
    });

    it(`should load config file with given absolute path.`, async () => {
      const cwd = await mkdtemp();

      await write(
        path.join(cwd, 'sync-db-test.yml'),
        yaml.stringify({
          migration: {
            directory: 'migration',
            sourceType: 'typescript'
          }
        } as Configuration)
      );

      process.chdir(cwd);
      const config = await loadConfig(path.join(cwd, 'sync-db-test.yml'));
      expect(config).to.have.property('migration');
    });
  });
});
