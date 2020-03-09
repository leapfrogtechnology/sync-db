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
        write(path.join(migrationPath, '0001_mgr.up.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0001_mgr.down.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0002_mgr.up.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0002_mgr.down.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0003_mgr.up.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0004_mgr.up.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0004_mgr.down.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0005_mgr.up.sql'), 'SELECT 1;'),
        write(path.join(migrationPath, '0005_mgr.down.sql'), 'SELECT 1;')
      ]);

      const result = await migratorService.getSqlMigrationNames(migrationPath);

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal(['0001_mgr', '0002_mgr', '0003_mgr', '0004_mgr', '0005_mgr']);
    });

    it('should return empty array if the migration directory is empty.', async () => {
      const migrationPath = await mkdtemp();
      const result = await migratorService.getSqlMigrationNames(migrationPath);

      expect(result).to.deep.equal([]);
    });
  });
});
