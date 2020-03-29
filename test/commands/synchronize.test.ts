import * as path from 'path';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtemp, read } from '../../src/util/fs';

describe('CLI: synchronize', () => {
  describe('--version', () => {
    it('should return the CLI version.', async () => {
      const cwd = await mkdtemp();
      const packageJson = await read(path.join(__dirname, '../../package.json'));
      const { version } = JSON.parse(packageJson);

      const { stdout } = await runCli(['--version'], { cwd });

      expect(stdout).contains('@leapfrogtechnology/sync-db');
      expect(stdout).contains(version);
    });
  });
});
