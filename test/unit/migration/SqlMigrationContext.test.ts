import { expect } from 'chai';
import { describe, it } from 'mocha';

import SqlMigrationEntry from '../../../src/migration/domain/SqlMigrationEntry';
import SqlMigrationSourceContext from '../../../src/migration/source-types/SqlMigrationSourceContext';

describe('MIGRATION: SqlMigrationSourceContext', () => {
  const getInstance = (list: SqlMigrationEntry[]) => new SqlMigrationSourceContext(list);

  describe('keys', () => {
    it('should return an empty list if migrations are empty.', () => {
      const instance = getInstance([]);

      expect(instance.keys()).to.deep.equal([]);
    });

    it('should return the migration names.', () => {
      const instance = getInstance([
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
        }
      ]);

      expect(instance.keys()).to.deep.equal(['0001_mgr', '0002_mgr', '0003_mgr']);
    });
  });

  describe('get', () => {
    const dbStub = {
      raw: (sql: string) => Promise.resolve(`Result of "${sql}"`)
    } as any;
    const instance = getInstance([
      {
        name: '0001_mgr',
        queries: {
          up: { name: '0001_mgr.up.sql', sql: 'CREATE TABLE test_mgr' },
          down: { name: '0001_mgr.down.sql', sql: 'DROP TABLE test_mgr' }
        }
      },
      {
        name: '0002_mgr',
        queries: {
          up: { name: '0002_mgr.up.sql', sql: 'UPDATE test_mgr SET is_active = 0' }
        }
      },
      {
        name: '0003_mgr',
        queries: {
          down: { name: '0003_mgr.down.sql', sql: 'UPDATE test_mgr SET is_disabled = 1' }
        }
      }
    ]);

    it('should return the migration runner.', async () => {
      const runner = instance.get('0001_mgr');

      const upResult = await runner.up(dbStub);
      const downResult = await runner.down(dbStub);

      expect(upResult).to.equal('Result of "CREATE TABLE test_mgr"');
      expect(downResult).to.equal('Result of "DROP TABLE test_mgr"');
    });

    it('returned migration functions should resolve to false the corresponding source are unresolved.', async () => {
      const migration1 = instance.get('0002_mgr');
      const upResult1 = await migration1.up(dbStub);
      const downResult1 = await migration1.down(dbStub);

      expect(upResult1).to.equal('Result of "UPDATE test_mgr SET is_active = 0"');
      expect(downResult1).to.equal(false);

      const migration2 = instance.get('0003_mgr');
      const upResult2 = await migration2.up(dbStub);
      const downResult2 = await migration2.down(dbStub);

      expect(upResult2).to.equal(false);
      expect(downResult2).to.equal('Result of "UPDATE test_mgr SET is_disabled = 1"');
    });

    it('should throw an error if the migration entry was not found.', () => {
      expect(() => instance.get('0010_mgr_something_else')).to.throw(
        'Cannot find the migration entry 0010_mgr_something_else'
      );
    });
  });
});
