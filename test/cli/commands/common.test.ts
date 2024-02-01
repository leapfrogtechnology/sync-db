import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { mkdtempSync } from '../../../src/util/fs';
import { runCli } from './util';

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
