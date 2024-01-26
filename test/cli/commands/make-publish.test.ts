import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as path from 'node:path';
import * as yaml from 'yamljs';

import Configuration from '../../../src/domain/Configuration';
import { exists, glob, mkdir, mkdtemp, read, write } from '../../../src/util/fs';
import { queryByPattern, runCli } from './util';

describe('CLI: make-publish', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['make-publish', '--help']);

      expect(stdout).contains('make-publish');
      expect(stdout).contains(`USAGE\n  $ sync-db make-publish`);
    });
  });

  it('should publish the template files when sourceType is sql.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
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
    expect(stdout).to.match(/src\/stub\/create_up\.stub/);
    expect(stdout).to.match(/src\/stub\/create_down\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const upFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_up\.stub/)));
    const downFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_down\.stub/)));

    expect(files.length).to.equal(2);
    expect(upFileExists).to.equal(true);
    expect(downFileExists).to.equal(true);
  });

  it('should publish the template files when sourceType is javascript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
    await mkdir(stubPath, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'javascript'
        }
      } as Configuration)
    );
    const { stdout } = await runCli(['make-publish'], { cwd });

    // Check the output.
    expect(stdout).to.match(/src\/stub\/create_js\.stub/);
    expect(stdout).to.match(/src\/stub\/update_js\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const createFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_js\.stub/)));
    const updateFileExists = await exists(path.join(stubPath, queryByPattern(files, /update_js\.stub/)));

    expect(files.length).to.equal(2);
    expect(createFileExists).to.equal(true);
    expect(updateFileExists).to.equal(true);
  });

  it('should publish the template files when sourceType is typescript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
    await mkdir(stubPath, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );
    const { stdout } = await runCli(['make-publish'], { cwd });

    // Check the output.
    expect(stdout).to.match(/src\/stub\/create_ts\.stub/);
    expect(stdout).to.match(/src\/stub\/update_ts\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const createFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_ts\.stub/)));
    const updateFileExists = await exists(path.join(stubPath, queryByPattern(files, /update_ts\.stub/)));

    expect(files.length).to.equal(2);
    expect(createFileExists).to.equal(true);
    expect(updateFileExists).to.equal(true);
  });

  it('should not publish the template files if the file already exists.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
    await mkdir(stubPath, { recursive: true });
    const createUpPath = path.join(stubPath, 'create_up.stub');
    const createDownPath = path.join(stubPath, 'create_down.stub');

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );
    await write(createUpPath, 'CREATE TABLE {{table}} (id INT PRIMARY KEY)');
    await write(createDownPath, 'DROP TABLE {{table}}');

    const { stdout } = await runCli(['make-publish'], { cwd });

    // Check the output.
    expect(stdout).to.match(/src\/stub\/create_up\.stub \(exists\)/);
    expect(stdout).to.match(/src\/stub\/create_down\.stub \(exists\)/);

    // Check files are created.
    const files = await glob(stubPath);
    const createUp = await read(path.join(stubPath, queryByPattern(files, /create_up\.stub/)));
    const createDown = await read(path.join(stubPath, queryByPattern(files, /create_down\.stub/)));

    expect(files.length).to.equal(2);
    expect(createUp).to.equal('CREATE TABLE {{table}} (id INT PRIMARY KEY)');
    expect(createDown).to.equal('DROP TABLE {{table}}');
  });

  it('should create respective stub files based on configuration from --config flag.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stub');
    await mkdir(stubPath, { recursive: true });

    const migrationPath1 = path.join(cwd, 'src/migration1');
    await mkdir(migrationPath1, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    await write(
      path.join(cwd, 'sync-db-test.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration1',
          sourceType: 'javascript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make-publish'], { cwd });

    // Check the output.
    expect(stdout).to.match(/src\/stub\/create_ts\.stub/);
    expect(stdout).to.match(/src\/stub\/update_ts\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const createFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_ts\.stub/)));
    const updateFileExists = await exists(path.join(stubPath, queryByPattern(files, /update_ts\.stub/)));

    expect(files.length).to.equal(2);
    expect(createFileExists).to.equal(true);
    expect(updateFileExists).to.equal(true);

    const { stdout: stdout1 } = await runCli(['make-publish', '--config=sync-db-test.yml'], { cwd });

    // Check the output.
    expect(stdout1).to.match(/src\/stub\/create_js\.stub/);
    expect(stdout1).to.match(/src\/stub\/update_js\.stub/);

    // Check files are created.
    const files1 = await glob(stubPath);
    const createFileExists1 = await exists(path.join(stubPath, queryByPattern(files1, /create_ts\.stub/)));
    const updateFileExists1 = await exists(path.join(stubPath, queryByPattern(files1, /update_ts\.stub/)));

    expect(createFileExists1).to.equal(true);
    expect(updateFileExists1).to.equal(true);
  });
});
