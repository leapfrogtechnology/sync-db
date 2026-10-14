import * as os from 'os';
import * as path from 'path';
import * as fsNative from 'fs';
import 'mocha';
import { expect } from 'chai';

import * as sqlRunner from '../../../src/service/sqlRunner';

describe('SERVICE: sqlRunner (source cache)', () => {
  it('should read each file once and share the result.', async () => {
    const dir = fsNative.mkdtempSync(path.join(os.tmpdir(), 'sync-db-'));
    const file = path.join(dir, 'a.sql');

    fsNative.writeFileSync(file, 'SELECT 1');

    const read = sqlRunner.createSourceCache();
    const first = await sqlRunner.resolveFiles(dir, ['a.sql'], read);

    // Changing the file after the first read must not affect the cached result.
    fsNative.writeFileSync(file, 'SELECT 2');

    const second = await sqlRunner.resolveFiles(dir, ['a.sql'], read);

    expect(first[0].sql).to.equal('SELECT 1');
    expect(second[0]).to.equal(first[0]);

    fsNative.rmSync(dir, { recursive: true, force: true });
  });
});
