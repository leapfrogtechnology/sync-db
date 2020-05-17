import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtempSync } from '../../../src/util/fs';

const cwd = mkdtempSync();
const packageJson = fs.readFileSync(path.join(__dirname, '../../../package.json'));
const { version } = JSON.parse(packageJson.toString());

describe('CLI:', () => {
  describe('with no args', () => {
    it('should display the usage information.', async () => {
      const { stdout } = await runCli([], { cwd });

      expect(stdout).contains('USAGE\n  $ sync-db [COMMAND]');
    });
  });

  describe('--version', () => {
    it('should return the CLI version.', async () => {
      const { stdout } = await runCli(['--version'], { cwd });

      expect(stdout).contains('@leapfrogtechnology/sync-db');
      expect(stdout).contains(version);
    });
  });
});
