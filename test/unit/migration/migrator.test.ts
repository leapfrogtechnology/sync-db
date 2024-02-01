import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as path from 'node:path';

import * as migratorService from '../../../src/migration/service/migrator';
import { mkdtemp, write } from '../../../src/util/fs';

describe('MIGRATION: migrator', () => {
  describe('getSqlMigrationNames', async () => {
    it('should return the list of valid migrations under the directory.', async () => {
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

    it('should not return other files under the directory that are not migrations.', async () => {
      const migrationPath = await mkdtemp();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_mgr.up.sql'), 'SELECT 1'),
        write(path.join(migrationPath, '0002_mgr.down.sql'), 'SELECT 1'),
        write(path.join(migrationPath, 'test.sql'), 'SELECT 2'),
        write(path.join(migrationPath, 'migrate.sql'), 'SELECT 3'),
        write(path.join(migrationPath, '.gitignore'), ''),
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'SELECT 1')
      ]);

      const result = await migratorService.getSqlMigrationNames(migrationPath);

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal(['0001_mgr', '0002_mgr', '0003_mgr']);
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
        write(path.join(migrationPath, '0003_mgr.down.sql'), 'DROP TABLE test_mgr3'),
        write(path.join(migrationPath, '.gitignore'), '')
      ]);

      const result = await migratorService.resolveSqlMigrations(migrationPath);

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal([
        {
          name: '0001_mgr',
          queries: {
            down: undefined,
            up: { dropOnly: false, name: '0001_mgr.up.sql', sql: 'CREATE TABLE test_mgr1' }
          }
        },
        {
          name: '0002_mgr',
          queries: {
            down: { dropOnly: false, name: '0002_mgr.down.sql', sql: 'DROP TABLE test_mgr2' },
            up: undefined
          }
        },
        {
          name: '0003_mgr',
          queries: {
            down: { dropOnly: false, name: '0003_mgr.down.sql', sql: 'DROP TABLE test_mgr3' },
            up: { dropOnly: false, name: '0003_mgr.up.sql', sql: 'CREATE TABLE test_mgr3' }
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

  describe('getJavaScriptMigrationNames', async () => {
    it('should return the list of valid migrations under the directory.', async () => {
      const migrationPath = await mkdtemp();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_create_table_users.js'), ''),
        write(path.join(migrationPath, '0002_alter_table_users_add_gender.ts'), ''),
        write(path.join(migrationPath, '0003_create_phone_table.js'), ''),
        write(path.join(migrationPath, '0004_create_address_table.ts'), ''),
        write(path.join(migrationPath, '0005_alter_table_address_remove_id.js'), '')
      ]);

      const result = await migratorService.getJavaScriptMigrationNames(migrationPath, 'js');

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal([
        '0001_create_table_users',
        '0003_create_phone_table',
        '0005_alter_table_address_remove_id'
      ]);
    });

    it('should not return other files under the directory that are not migrations.', async () => {
      const migrationPath = await mkdtemp();

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_create_table_users.ts'), ''),
        write(path.join(migrationPath, '0002_alter_table_users_add_gender.ts'), ''),
        write(path.join(migrationPath, 'test.sql'), 'SELECT 2'),
        write(path.join(migrationPath, 'migrate.sql'), 'SELECT 3'),
        write(path.join(migrationPath, '.gitignore'), ''),
        write(path.join(migrationPath, '0005_alter_table_address_remove_id.js'), '')
      ]);

      const result = await migratorService.getJavaScriptMigrationNames(migrationPath, 'ts');

      // Test the migrations entries retrieved from the directory.
      expect(result).to.deep.equal(['0001_create_table_users', '0002_alter_table_users_add_gender']);
    });
  });

  describe('resolveJavaScriptMigrations', () => {
    it('should resolve all the information related to the available migration entries.', async () => {
      const migrationPath = await mkdtemp();

      const exampleJs = `
      function up(db) {
        return db.schema.createTable('demo_table', table => {
          table
            .increments('id')
            .primary()
            .unsigned();
          table
            .integer('phone')
            .notNullable();
        });
      }

      function down(db) {
        return db.schema.dropTable('demo_table');
      }

      module.exports = {
        up: up,
        down: down
      }
      `;

      const exampleTs = `
      /**
       * Create test_demo table.
       *
       * @param {Knex} db
       * @returns {Promise}
       */
      export function up(db: any) {
        return db.schema.createTable('test_demo', (table: any) => {
          table
            .increments('id')
            .primary()
            .unsigned();
          table
            .integer('number')
            .notNullable();
        });
      }

      /**
       * Drop test_demo table.
       *
       * @param {Knex} db
       * @returns {Promise}
       */
      export function down(db: any) {
        return db.schema.dropTable('test_demo');
      }
      `;

      // Populate migration files to a directory.
      await Promise.all([
        write(path.join(migrationPath, '0001_create_table_users.js'), exampleJs),
        write(path.join(migrationPath, '0002_alter_table_users_add_gender.ts'), exampleTs),
        write(path.join(migrationPath, '.gitignore'), '')
      ]);

      const result = await migratorService.resolveJavaScriptMigrations(migrationPath);
      const result1 = await migratorService.resolveJavaScriptMigrations(migrationPath, 'ts');

      // Test the migrations entries retrieved from the directory.
      expect(result.length).to.equal(1);
      expect(result[0].name).to.deep.equal('0001_create_table_users.js');
      expect(result[0].methods.up.name).to.deep.equal('up');
      expect(result[0].methods.down.name).to.deep.equal('down');

      expect(result1.length).to.equal(1);
      expect(result1[0].name).to.deep.equal('0002_alter_table_users_add_gender.ts');
      expect(result1[0].methods.up.name).to.deep.equal('up');
      expect(result1[0].methods.down.name).to.deep.equal('down');
    });

    it('should return empty array if the migration directory is empty.', async () => {
      const migrationPath = await mkdtemp();
      const result = await migratorService.resolveJavaScriptMigrations(migrationPath);

      expect(result).to.deep.equal([]);
    });
  });
});
