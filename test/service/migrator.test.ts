import * as path from 'path';
import { describe, it } from 'mocha';
import { expect } from 'chai';

import { write, mkdtemp } from '../../src/util/fs';
import * as migratorService from '../../src/service/migrator';

describe('SERVICE: migrator', () => {
  describe('getSqlMigrationEntries', async () => {
    it('should return the list of migrations under the directory.', async () => {
      const migrationPath = await mkdtemp();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0001_mgr.down.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0002_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0002_mgr.down.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0003_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0004_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0004_mgr.down.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0005_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0005_mgr.down.sql'), 'SELECT 1')
      ]);

      const result = await migratorService.getSqlMigrationNames(migrationPath);

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal(['0001_mgr', '0002_mgr', '0003_mgr', '0004_mgr', '0005_mgr']);
    });
  });

  describe('resolveSqlMigrations', () => {
    it('should resolve all the information related to the available migration entries.', async () => {
      const migrationPath = await mkdtemp();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_mgr.up.sql'), 'CREATE TABLE test_mgr1'),
        write(path.join(migrationPath, '0002_mgr.down.sql'), 'DROP TABLE test_mgr2'),
        write(path.join(migrationPath, '0003_mgr.up.sql'), 'CREATE TABLE test_mgr3'),
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'DROP TABLE test_mgr3')
      ]);

      const result = await migratorService.resolveSqlMigrations(migrationPath);

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal([
        {
          name: '0001_mgr',
          queries: {
            up: { name: '0001_mgr.up.sql', sql: 'CREATE TABLE test_mgr1' },
            down: undefined
          }
        },
        {
          name: '0002_mgr',
          queries: {
            up: undefined,
            down: { name: '0002_mgr.down.sql', sql: 'DROP TABLE test_mgr2' }
          }
        },
        {
          name: '0003_mgr',
          queries: {
            up: { name: '0003_mgr.up.sql', sql: 'CREATE TABLE test_mgr3' },
            down: { name: '0003_mgr.down.sql', sql: 'DROP TABLE test_mgr3' }
          }
        }
      ]);
    });

    it('should return empty array if the migration directory is empty.', async () => {
      const migrationPath = await mkdtemp();
      const result = await migratorService.resolveSqlMigrations(migrationPath);

      expect(result).to.deep.equal([]);
    });
  });
});
