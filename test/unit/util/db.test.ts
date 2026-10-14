import 'mocha';
import { expect } from 'chai';
import { Client, knex, Knex } from 'knex';

import { isKnexInstance, withTransaction } from '../../../src/util/db';
import { timeout } from '../../../src/util/promise';
import ConnectionReference from '../../../src/domain/ConnectionReference';

/**
 * A knex client that needs no database driver, so a real knex instance
 * can be constructed (without connecting) in tests.
 */
class FakeClient extends Client {
  _driver() {
    return {};
  }
}

/**
 * Creates a fake connection whose `transaction()` yields a fake transaction
 * object tracking the order in which `rollback` / `commit` are invoked and
 * resolved, so tests can assert on awaiting behavior.
 */
function createFakeConnection(calls: string[], rollbackDelay: number = 20) {
  const trx: any = {
    rollback: () => {
      calls.push('rollback:start');

      return timeout(rollbackDelay).then(() => {
        calls.push('rollback:end');
      });
    },
    commit: () => {
      calls.push('commit');

      return Promise.resolve();
    }
  };

  const connection: any = {
    transaction: () => Promise.resolve(trx)
  };

  return { connection, trx };
}

describe('UTIL: db', () => {
  describe('isKnexInstance', () => {
    it('should return true for a knex instance.', async () => {
      const db = knex({ client: FakeClient, connection: { host: 'localhost', database: 'test' } } as Knex.Config);

      expect(isKnexInstance(db)).to.equal(true);

      await db.destroy();
    });

    it('should return false for a plain connection config object.', () => {
      expect(isKnexInstance({ host: 'localhost', database: 'test' })).to.equal(false);
    });
  });

  describe('withTransaction', () => {
    it('should await the rollback to complete before resolving in dry-run mode', async () => {
      const calls: string[] = [];
      const { connection } = createFakeConnection(calls);

      const result = await withTransaction(
        { connection, id: 'test' } as ConnectionReference,
        async () => {
          calls.push('callback');

          return 'result';
        },
        true
      );

      expect(result).to.equal('result');

      // If `rollback()` were not awaited, `withTransaction` would resolve
      // right after 'rollback:start' and before 'rollback:end' is pushed.
      expect(calls).to.deep.equal(['callback', 'rollback:start', 'rollback:end']);
    });

    it('should never commit the transaction in dry-run mode', async () => {
      const calls: string[] = [];
      const { connection } = createFakeConnection(calls);

      await withTransaction({ connection, id: 'test' } as ConnectionReference, async () => 'result', true);

      expect(calls).to.not.include('commit');
    });

    it('should propagate the error if the callback rejects in dry-run mode', async () => {
      const calls: string[] = [];
      const { connection } = createFakeConnection(calls);

      await expect(
        withTransaction(
          { connection, id: 'test' } as ConnectionReference,
          async () => {
            throw new Error('Callback failed.');
          },
          true
        )
      ).to.be.rejectedWith('Callback failed.');
    });

    it('should roll back the transaction if the callback rejects in dry-run mode', async () => {
      const calls: string[] = [];
      const { connection } = createFakeConnection(calls);

      await withTransaction(
        { connection, id: 'test' } as ConnectionReference,
        async () => {
          throw new Error('Callback failed.');
        },
        true
      ).catch(() => undefined);

      expect(calls).to.deep.equal(['rollback:start', 'rollback:end']);
    });
  });
});
