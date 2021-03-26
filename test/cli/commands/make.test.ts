import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli, queryByPattern } from './util';
import { interpolate } from '../../../src/util/string';
import Configuration from '../../../src/domain/Configuration';
import { mkdir, mkdtemp, write, exists, glob, read } from '../../../src/util/fs';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../../assets/templates/migration');
const CUSTOM_CREATE_TEMPLATE = `
import * as Knex from "knex";

export function up(db: Knex) {
  return db.schema.createTable("{{table}}", table => {})
}

export function down(db: Knex) {
   return db.schema.dropTable("{{table}}")
}
`;

describe('CLI: make', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['make', '--help']);

      expect(stdout).contains('make');
      expect(stdout).contains(`USAGE\n  $ sync-db make`);
    });
  });

  it('should create migration directory automatically if it does not exist.', async () => {
    const cwd = await mkdtemp();
    await write(path.join(cwd, 'sync-db.yml'), yaml.stringify({}));

    await runCli(['make', 'something'], { cwd });

    // Directory is created.
    const pathExists = await exists(path.join(cwd, 'src/migration'));

    expect(pathExists).to.equal(true);
  });

  it('should create a migration file when name is supplied.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'alter_users_table_drop_column'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_alter_users_table_drop_column\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_alter_users_table_drop_column\.down\.sql/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(2);

    const upFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_alter_users_table_drop_column\.up\.sql/))
    );
    const downFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_alter_users_table_drop_column\.down\.sql/))
    );

    expect(upFile).to.equal('');
    expect(downFile).to.equal('');
  });

  it('should create a migration file with create table template when filename convention is followed.', async () => {
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await write(path.join(cwd, 'sync-db.yml'), yaml.stringify({}));

    await runCli(['make', 'create_users_table'], { cwd });

    const files = await glob(migrationPath);

    expect(files.length).to.equal(2);

    const upFile = await read(path.join(migrationPath, queryByPattern(files, /\d{13}_create_users_table\.up\.sql/)));
    const downFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_create_users_table\.down\.sql/))
    );

    expect(upFile).contains('CREATE TABLE users');
    expect(downFile).contains('DROP TABLE users');
  });

  it('should create a migration file when name is supplied and sourceType is javascript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'javascript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'alter_users_table_drop_column'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_alter_users_table_drop_column\.js/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(1);

    const migrationFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_alter_users_table_drop_column\.js/))
    );
    const fileOutput = await read(path.join(MIGRATION_TEMPLATE_PATH, 'update_js.stub'));

    expect(migrationFile).to.equal(fileOutput);
  });

  it('should create a migration file when name is supplied and sourceType is typescript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'create_table_demo_users'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_create_table_demo_users\.ts/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(1);

    const migrationFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_create_table_demo_users\.ts/))
    );
    const fileOutput = await read(path.join(MIGRATION_TEMPLATE_PATH, 'update_ts.stub'));

    expect(migrationFile).to.equal(fileOutput);
  });

  it('should create a migration file with template when name matches filename convention for typescript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'create_demo_users_table'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_create_demo_users_table\.ts/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(1);

    const migrationFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_create_demo_users_table\.ts/))
    );
    const fileOutput = await read(path.join(MIGRATION_TEMPLATE_PATH, 'create_ts.stub'));

    expect(migrationFile).to.equal(interpolate(fileOutput, { table: 'demo_users' }));
  });

  it('should create a migration file with custom template for typescript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
    const migrationPath = path.join(cwd, 'src/migration');
    const createPath = path.join(stubPath, 'create_ts.stub');

    await mkdir(stubPath, { recursive: true });
    await mkdir(migrationPath, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    await write(createPath, CUSTOM_CREATE_TEMPLATE);

    const { stdout } = await runCli(['make', 'create_demo_users_table'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_create_demo_users_table\.ts/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(1);

    const migrationFile = await read(
      path.join(migrationPath, queryByPattern(files, /\d{13}_create_demo_users_table\.ts/))
    );

    expect(migrationFile).to.equal(interpolate(CUSTOM_CREATE_TEMPLATE, { table: 'demo_users' }));
  });

  it('should create TS migration template with --create and --object-name flag.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'settings', '--create', '--object-name=settings'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_settings\.ts/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(1);

    const migrationFile = await read(path.join(migrationPath, queryByPattern(files, /\d{13}_settings\.ts/)));
    const fileOutput = await read(path.join(MIGRATION_TEMPLATE_PATH, 'create_ts.stub'));

    expect(migrationFile).to.equal(interpolate(fileOutput, { table: 'settings' }));
  });

  it('should create SQL migration file with template with --create and --object-name flag.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'settings', '--create', '--object-name=settings'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_settings\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_settings\.down\.sql/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(2);

    const upFile = await read(path.join(migrationPath, queryByPattern(files, /\d{13}_settings\.up\.sql/)));
    const downFile = await read(path.join(migrationPath, queryByPattern(files, /\d{13}_settings\.down\.sql/)));
    const upSQL = await read(path.join(MIGRATION_TEMPLATE_PATH, 'create_up.stub'));
    const downSQL = await read(path.join(MIGRATION_TEMPLATE_PATH, 'create_down.stub'));

    expect(upFile).to.equal(interpolate(upSQL, { table: 'settings' }));
    expect(downFile).to.equal(interpolate(downSQL, { table: 'settings' }));
  });

  it('should make migration based on custom configurations with --config flag.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();

    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });

    const migrationPath1 = path.join(cwd, 'src/migration1');
    await mkdir(migrationPath1, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    await write(
      path.join(cwd, 'sync-db-test.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration1',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'settings'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_settings\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_settings\.down\.sql/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(2);

    const { stdout: stdout1 } = await runCli(['make', 'settings', '--config=sync-db-test.yml'], { cwd });

    // Check the output.
    expect(stdout1).to.match(/Created.+\d{13}_settings\.ts/);

    // Check files are created.
    const files1 = await glob(migrationPath1);

    expect(files1.length).to.equal(1);
  });
});
