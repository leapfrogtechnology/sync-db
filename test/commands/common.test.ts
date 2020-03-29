import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtemp } from '../../src/util/fs';

const packageJson = fs.readFileSync(path.join(__dirname, '../../package.json'));
const { version } = JSON.parse(packageJson.toString());

describe('CLI:', () => {
  describe('default run', () => {
    it('should display the usage information.', async () => {
      const cwd = await mkdtemp();
      const { stdout } = await runCli([], { cwd });

      expect(stdout).contains('USAGE\n  $ sync-db [COMMAND]');
    });
  });

  describe('--version', () => {
    it('should return the CLI version.', async () => {
      const cwd = await mkdtemp();
      const { stdout } = await runCli(['--version'], { cwd });

      expect(stdout).contains('@leapfrogtechnology/sync-db');
      expect(stdout).contains(version);
    });
  });
});
