import { expect } from 'chai';
import { describe, it } from 'mocha';

import MigrationContext from '../../src/domain/MigrationContext';
import KnexMigrationSource from '../../src/migration/KnexMigrationSource';

describe('UTIL: KnexMigrationSource', () => {
  const getInstance = () => {
    const migrationContext: MigrationContext = new (class {
      connectionId = 'testdb1';

      bind(connectionId: string) {
        this.connectionId = connectionId;

        return this;
      }

      keys(): string[] {
        return ['mgr_001', 'mgr_002', 'mgr_003', 'mgr_004'];
      }

      get(key: string) {
        return {
          up: async () => `UP: ${key}`,
          down: async () => `DOWN: ${key}`
        };
      }
    })();

    const instance = new KnexMigrationSource(migrationContext);

    return instance;
  };

  describe('getMigrations', () => {
    it('should return the migration names provided by the MigrationContext.', async () => {
      const instance = getInstance();
      const result = await instance.getMigrations();

      expect(result).to.deep.equal(['mgr_001', 'mgr_002', 'mgr_003', 'mgr_004']);
    });
  });

  describe('getMigrationName', async () => {
    it('should return the name as-is.', async () => {
      const instance = await getInstance();

      expect(instance.getMigrationName('mgr_001')).to.equal('mgr_001');
    });
  });

  describe('getMigration', async () => {
    it('should return the migration runner.', async () => {
      const instance = await getInstance();
      const dbStub = {} as any;

      const migration = instance.getMigration('mgr_002');

      const upResult = await migration.up(dbStub);
      const downResult = await migration.down(dbStub);

      expect(upResult).to.equal('UP: mgr_002');
      expect(downResult).to.equal('DOWN: mgr_002');
    });
  });
});
