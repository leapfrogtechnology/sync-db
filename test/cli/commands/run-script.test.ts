import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtempSync } from '../../../src/util/fs';

const cwd = mkdtempSync();

describe('CLI: Run script', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['run-script', '--help'], { cwd });

      expect(stdout).contains('manual scripts');
      expect(stdout).contains(`USAGE\n  $ sync-db run-script`);
    });
  });
});
