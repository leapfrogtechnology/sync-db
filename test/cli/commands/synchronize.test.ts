import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mkdtempSync } from '../../../src/util/fs';
import { runCli } from './util';

const cwd = mkdtempSync();

describe('CLI: synchronize', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['synchronize', '--help'], { cwd });

      expect(stdout).contains('Synchronize');
      expect(stdout).contains(`USAGE\n  $ sync-db synchronize`);
    });
  });
});
