import { expect } from 'chai';
import { it, describe } from 'mocha';

import { runCli } from './util';
import { mkdtemp } from '../../src/util/fs';

describe('CLI: synchronize', () => {
  describe('--help', () => {
    it('should print help message.', async () => {
      const cwd = await mkdtemp();
      const { stdout } = await runCli(['synchronize', '--help'], { cwd });

      expect(stdout).contains('Synchronize database');
      expect(stdout).contains(`USAGE\n  $ sync-db synchronize`);
    });
  });
});
