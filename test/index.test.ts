import { expect, test } from '@oclif/test';

import cmd = require('../src');

describe('CLI: sync-db', () => {
  test
    .stdout()
    .do(() => cmd.run([]))
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('Hello World');
    });
});
