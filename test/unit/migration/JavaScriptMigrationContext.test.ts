import { expect } from 'chai';
import * as Knex from 'knex';
import { describe, it } from 'mocha';
import JavaScriptMigrationEntry from '../../../src/migration/domain/JavaScriptMigrationEntry';
import JavaScriptMigrationContext from '../../../src/migration/source-types/JavaScriptMigrationSourceContext';

describe('MIGRATION: SqlMigrationSourceContext', () => {
  const getInstance = (list: JavaScriptMigrationEntry[]) => new JavaScriptMigrationContext(list);

  describe('keys', () => {
    it('should return an empty list if migrations are empty.', () => {
      const instance = getInstance([]);

      expect(instance.keys()).to.deep.equal([]);
    });

    const up = (db: Knex): Promise<any> => new Promise(resolve => null);
    const down = (db: Knex): Promise<any> => new Promise(resolve => null);

    it('should return the migration names.', () => {
      const instance = getInstance([
        {
          name: '0001_mgr',
          queries: {
            up,
            down
          }
        },
        {
          name: '0002_mgr',
          queries: {
            up,
            down
          }
        }
      ]);
      expect(instance.keys()).to.deep.equal(['0001_mgr', '0002_mgr']);
    });
  });

  describe('get', () => {
    const up = (db: Knex | Knex.Transaction) => new Promise<any>(resolve => resolve('up is called.'));
    const down = (db: Knex | Knex.Transaction) => new Promise<any>(resolve => resolve('down is called.'));

    const instance = getInstance([
      {
        name: '0001_mgr',
        queries: {
          up,
          down
        }
      }
    ]);
    it('should return the migration runner.', async () => {
      const db: any = null;
      const runner = instance.get('0001_mgr');
      const upResult = await runner.up(db);
      const downResult = await runner.down(db);

      expect(upResult).to.equal('up is called.');
      expect(downResult).to.equal('down is called.');
    });
  });
});
