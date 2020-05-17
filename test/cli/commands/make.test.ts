import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli, listContainsPattern } from './util';
import Configuration from '../../../src/domain/Configuration';
import { mkdir, mkdtemp, write, exists, glob } from '../../../src/util/fs';

describe('CLI: make', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['make', '--help']);

      expect(stdout).contains('make');
      expect(stdout).contains(`USAGE\n  $ sync-db make`);
    });
  });

  it('should create a migration file when only name is supplied.', async () => {
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

    const { stdout } = await runCli(['make', 'create_test_table'], { cwd });

    // Check the output.
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.down\.sql/);

    // Check files are created.
    const files = await glob(migrationPath);

    expect(files.length).to.equal(2);
    expect(listContainsPattern(files, /\d{13}_create_test_table\.up\.sql/)).to.equal(true);
    expect(listContainsPattern(files, /\d{13}_create_test_table\.down\.sql/)).to.equal(true);
  });

  it('should create migration directory automatically if it does not exist.', async () => {
    const cwd = await mkdtemp();
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    await runCli(['make', 'create_test_table'], { cwd });

    // Directory is created.
    const pathExists = await exists(path.join(cwd, 'src/migration'));

    expect(pathExists).to.equal(true);
  });
});
