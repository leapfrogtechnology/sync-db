import * as Knex from 'knex';

import SynchronizeParams from './SynchronizeParams';
import CommandContext from './CommandContext';

/**
 * Synchronize context for a database connection.
 */
interface SyncContext extends CommandContext {
  params: SynchronizeParams;
  migrateFunc: (trx: Knex.Transaction) => Promise<any>;
}

export default SyncContext;
