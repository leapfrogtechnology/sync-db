import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import Configuration from '../../../src/domain/Configuration';
import { mkdtemp, write, mkdir, glob } from '../../../src/util/fs';

describe('CLI: config-source', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['config-source', '--help']);

      expect(stdout).contains('config-source');
      expect(stdout).contains(`USAGE\n  $ sync-db config-source`);
    });
  });

  it('should display the configuration source when used without args.', async () => {
    const cwd = await mkdtemp();

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'javascript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['config-source'], { cwd });

    // Check the output.
    expect(stdout).to.contains('Configuration source is currently switched to - sync-db.yml');
  });

  it('should change the configuration source when provided with args.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'javascript'
        }
      } as Configuration)
    );

    await write(
      path.join(cwd, 'sync-db-test.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'typescript'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['config-source'], { cwd });

    expect(stdout).to.contains('Configuration source is currently switched to - sync-db.yml');

    const { stdout: stdout1 } = await runCli(['config-source', 'sync-db-test'], { cwd });

    expect(stdout1).to.contains('Configuration source switched to - sync-db-test.yml');

    const { stdout: stdout2 } = await runCli(['config-source'], { cwd });

    expect(stdout2).to.contains('Configuration source is currently switched to - sync-db-test.yml');
  });

  it('should make migrations based on different configurations.', async () => {
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
          directory: 'migration',
          sourceType: 'javascript'
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

    await write(
      path.join(cwd, 'sync-db-demo.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    await runCli(['config-source', 'sync-db'], { cwd });
    const { stdout } = await runCli(['make', 'create_table_demo_users'], { cwd });

    expect(stdout).to.match(/Created.+\d{13}_create_table_demo_users\.js/);

    await runCli(['config-source', 'sync-db-test'], { cwd });
    const { stdout: stdout1 } = await runCli(['make', 'create_table_demo_users'], { cwd });

    expect(stdout1).to.match(/Created.+\d{13}_create_table_demo_users\.ts/);

    await runCli(['config-source', 'sync-db-demo'], { cwd });
    const { stdout: stdout2 } = await runCli(['make', 'create_table_demo_users'], { cwd });

    expect(stdout2).to.match(/Created.+\d{13}_create_table_demo_users\.up\.sql/);
    expect(stdout2).to.match(/Created.+\d{13}_create_table_demo_users\.down\.sql/);
  });

  it('should count migrations from respective location as in configurations.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();

    const migrationPath = path.join(cwd, 'src/migration');
    await mkdir(migrationPath, { recursive: true });

    const migrationPath1 = path.join(cwd, 'src/migration1');
    await mkdir(migrationPath1, { recursive: true });

    const migrationPath2 = path.join(cwd, 'src/migration2');
    await mkdir(migrationPath2, { recursive: true });

    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration',
          sourceType: 'javascript'
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

    await write(
      path.join(cwd, 'sync-db-demo.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration2'
        }
      } as Configuration)
    );

    await runCli(['config-source', 'sync-db'], { cwd });
    await runCli(['make', 'create_table_demo_users'], { cwd });
    await runCli(['make', 'create_table_test_users'], { cwd });

    const files = await glob(migrationPath);

    // Two javascript migration are created in src/migration as per config in sync-db.yml
    expect(files.length).to.equal(2);

    await runCli(['config-source', 'sync-db-test'], { cwd });
    await runCli(['make', 'create_table_demo_users'], { cwd });

    const files1 = await glob(migrationPath1);

    // Two typescript migration are created in src/migration1 as per config in sync-db.yml
    expect(files1.length).to.equal(1);

    await runCli(['config-source', 'sync-db-demo'], { cwd });
    await runCli(['make', 'create_table_test_users'], { cwd });

    const files2 = await glob(migrationPath2);

    // Two sql (up/down for each) migration are created in src/migration as per config in sync-db.yml
    expect(files2.length).to.equal(2);

    // Remove the cached config as other successive tests would try to fetch config from it.
    await runCli(['config-source', '--reset'], { cwd });
  });
});
