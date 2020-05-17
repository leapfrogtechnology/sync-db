import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtempSync } from '../../../src/util/fs';

const cwd = mkdtempSync();

describe('CLI: make', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const { stdout } = await runCli(['make', '--help'], { cwd });

      expect(stdout).contains('make');
      expect(stdout).contains(`USAGE\n  $ sync-db make`);
    });
  });
});
