import * as path from 'path';
import * as yaml from 'yamljs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli, queryByPattern } from './util';
import Configuration from '../../../src/domain/Configuration';
import { mkdir, mkdtemp, write, exists, glob } from '../../../src/util/fs';

describe('CLI: make-publish', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['make-publish', '--help']);

      expect(stdout).contains('make-publish');
      expect(stdout).contains(`USAGE\n  $ sync-db make-publish`);
    });
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

  it('should publish the template files and sourceType is javascript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stubs');
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
    expect(stdout).to.match(/create_js\.stub/);
    expect(stdout).to.match(/update_js\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const createFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_js\.stub/)));
    const updateFileExists = await exists(path.join(stubPath, queryByPattern(files, /update_js\.stub/)));

    expect(files.length).to.equal(2);
    expect(createFileExists).to.equal(true);
    expect(updateFileExists).to.equal(true);
  });

  it('should publish the template files and sourceType is typescript.', async () => {
    // Write sync-db.yml file.
    const cwd = await mkdtemp();
    const stubPath = path.join(cwd, 'src/stubs');
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
    expect(stdout).to.match(/create_ts\.stub/);
    expect(stdout).to.match(/update_ts\.stub/);

    // Check files are created.
    const files = await glob(stubPath);
    const createFileExists = await exists(path.join(stubPath, queryByPattern(files, /create_ts\.stub/)));
    const updateFileExists = await exists(path.join(stubPath, queryByPattern(files, /update_ts\.stub/)));

    expect(files.length).to.equal(2);
    expect(createFileExists).to.equal(true);
    expect(updateFileExists).to.equal(true);
  });
});
