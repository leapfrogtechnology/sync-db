import * as path from 'path';
import { expect } from 'chai';
import * as execa from 'execa';
import { it, describe } from 'mocha';
import { getBinPath } from 'get-bin-path';

import { mkdtemp, read } from '../../src/util/fs';

describe('CLI: synchronize', async () => {
  const cwd = await mkdtemp();
  const binPath = await getBinPath();

  describe('--version', () => {
    it('should return the CLI version.', async () => {
      const packageJson = await read(path.join(__dirname, '../../package.json'));
      const { version } = JSON.parse(packageJson);

      const { stdout } = await execa(binPath, ['--version'], { cwd });

      expect(stdout).contains('@leapfrogtechnology/sync-db');
      expect(stdout).contains(version);
    });
  });
});
