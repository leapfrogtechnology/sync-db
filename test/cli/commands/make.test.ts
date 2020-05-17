import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdir, mkdtemp, write } from '../../../src/util/fs';
import Configuration from '../../../src/domain/Configuration';

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
    await mkdir(path.join(cwd, 'src/migration'), { recursive: true });
    await write(
      path.join(cwd, 'sync-db.yml'),
      yaml.stringify({
        migration: {
          directory: 'migration'
        }
      } as Configuration)
    );

    const { stdout } = await runCli(['make', 'create_test_table'], { cwd });

    // Files are created.
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.down\.sql/);
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

    const { stdout } = await runCli(['make', 'create_test_table'], { cwd });

    // Files are created.
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.up\.sql/);
    expect(stdout).to.match(/Created.+\d{13}_create_test_table\.down\.sql/);
  });
});
