import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli, queryByPattern } from './util';
import Configuration from '../../../src/domain/Configuration';
import { mkdir, mkdtemp, write, exists, glob, read } from '../../../src/util/fs';
import { interpolate } from '../../../src/util/string';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../../assets/templates/migration');

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

  it('should publish the template files and sourceType is sql.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stubs');
    await mkdir(stubPath, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );
    const { stdout } = await runCli(['make-publish'], { cwd });

    // Check the output.
    expect(stdout).to.match(/create_up\.stub/);
    expect(stdout).to.match(/create_down\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const upFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_up\.stub/)));
    const downFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_down\.stub/)));

    expect(files.length).to.equal(2);
    expect(upFileExists).to.equal(true);
    expect(downFileExists).to.equal(true);
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
});
