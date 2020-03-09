import * as path from 'path';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { write, mkdtemp } from '../src/util/fs';
import KnexMigrationSource from '../src/KnexMigrationSource';

describe('UTIL: KnexMigrationSource', () => {
  const getInstance = async () => {
    const migrationPath = await mkdtemp();
    const instance = new KnexMigrationSource(migrationPath);

    return { migrationPath, instance };
  };

  describe('getMigrations', () => {
    it('should return empty array if the migration directory is empty.', async () => {
      const { instance } = await getInstance();
      const result = await instance.getMigrations();

      expect(result).to.deep.equal([]);
    });

    it('should resolve all the information related to the migration entries.', async () => {
      const { migrationPath, instance } = await getInstance();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_mgr.up.sql'), 'CREATE TABLE test_mgr1'),
        write(path.join(migrationPath, '0001_mgr.down.sql'), 'DROP TABLE test_mgr1'),
        write(path.join(migrationPath, '0002_mgr.up.sql'), 'CREATE TABLE test_mgr2'),
        write(path.join(migrationPath, '0002_mgr.down.sql'), 'DROP TABLE test_mgr2'),
        write(path.join(migrationPath, '0003_mgr.up.sql'), 'CREATE TABLE test_mgr3'),
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'DROP TABLE test_mgr3'),
        write(path.join(migrationPath, '0004_mgr.up.sql'), 'CREATE TABLE test_mgr4'),
        write(path.join(migrationPath, '0004_mgr.down.sql'), 'DROP TABLE test_mgr4'),
        write(path.join(migrationPath, '0005_mgr.up.sql'), 'CREATE TABLE test_mgr5'),
        write(path.join(migrationPath, '0005_mgr.down.sql'), 'DROP TABLE test_mgr5')
      ]);

      const result = await instance.getMigrations();

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal([
        {
          name: '0001_mgr',
          queries: {
            up: { name: '0001_mgr.up.sql', sql: 'CREATE TABLE test_mgr1' },
            down: { name: '0001_mgr.down.sql', sql: 'DROP TABLE test_mgr1' }
          }
        },
        {
          name: '0002_mgr',
          queries: {
            up: { name: '0002_mgr.up.sql', sql: 'CREATE TABLE test_mgr2' },
            down: { name: '0002_mgr.down.sql', sql: 'DROP TABLE test_mgr2' }
          }
        },
        {
          name: '0003_mgr',
          queries: {
            up: { name: '0003_mgr.up.sql', sql: 'CREATE TABLE test_mgr3' },
            down: { name: '0003_mgr.down.sql', sql: 'DROP TABLE test_mgr3' }
          }
        },
        {
          name: '0004_mgr',
          queries: {
            up: { name: '0004_mgr.up.sql', sql: 'CREATE TABLE test_mgr4' },
            down: { name: '0004_mgr.down.sql', sql: 'DROP TABLE test_mgr4' }
          }
        },
        {
          name: '0005_mgr',
          queries: {
            up: { name: '0005_mgr.up.sql', sql: 'CREATE TABLE test_mgr5' },
            down: { name: '0005_mgr.down.sql', sql: 'DROP TABLE test_mgr5' }
          }
        }
      ]);
    });
  });

  describe('getMigrationName', async () => {
    it('should return the name of the migration.', async () => {
      const { instance } = await getInstance();
      const entry = {
        name: '0005_mgr',
        queries: {
          up: { name: '0005_mgr.up.sql', sql: 'CREATE TABLE test_mgr5' },
          down: { name: '0005_mgr.down.sql', sql: 'DROP TABLE test_mgr5' }
        }
      };

      expect(instance.getMigrationName(entry)).to.equal('0005_mgr');
    });
  });

  describe('getMigration', async () => {
    const dbStub = {
      raw: (sql: string) => Promise.resolve(`Result of "${sql}"`)
    };

    it('should return the migration functions.', async () => {
      const { instance } = await getInstance();
      const entry = {
        name: '0005_mgr',
        queries: {
          up: { name: '0005_mgr.up.sql', sql: 'CREATE TABLE test_mgr5' },
          down: { name: '0005_mgr.down.sql', sql: 'DROP TABLE test_mgr5' }
        }
      };

      const migration = instance.getMigration(entry);

      const upResult = await migration.up(dbStub as any);
      const downResult = await migration.down(dbStub as any);

      expect(upResult).to.equal('Result of "CREATE TABLE test_mgr5"');
      expect(downResult).to.equal('Result of "DROP TABLE test_mgr5"');
    });

    it('could return empty promises for the migration functions if the files have been unresolved.', async () => {
      const { instance } = await getInstance();
      const entry1 = {
        name: '0004_mgr',
        queries: {
          up: { name: '0004_mgr.up.sql', sql: 'UPDATE test_mgr4 SET is_active = 0' }
        }
      };
      const migration1 = instance.getMigration(entry1);
      const upResult1 = await migration1.up(dbStub as any);
      const downResult1 = await migration1.down(dbStub as any);

      expect(upResult1).to.equal('Result of "UPDATE test_mgr4 SET is_active = 0"');
      expect(downResult1).to.equal(undefined);

      const entry2 = {
        name: '0005_mgr',
        queries: {
          down: { name: '0005_mgr.down.sql', sql: 'UPDATE test_mgr5 SET is_disabled = 1' }
        }
      };

      const migration2 = instance.getMigration(entry2);
      const upResult2 = await migration2.up(dbStub as any);
      const downResult2 = await migration2.down(dbStub as any);

      expect(upResult2).to.equal(undefined);
      expect(downResult2).to.equal('Result of "UPDATE test_mgr5 SET is_disabled = 1"');
    });
  });
});
