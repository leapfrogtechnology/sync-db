import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtempSync } from '../../src/util/fs';

const cwd = mkdtempSync();

describe('CLI: synchronize', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['synchronize', '--help'], { cwd });

      expect(stdout).contains('Synchronize database');
      expect(stdout).contains(`USAGE\n  $ sync-db synchronize`);
    });
  });
});
