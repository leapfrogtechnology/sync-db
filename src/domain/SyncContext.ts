import * as Knex from 'knex';

import SynchronizeParams from './SynchronizeParams';
import OperationContext from './operation/OperationContext';

/**
 * Synchronize context for a database connection.
 */
interface SyncContext extends OperationContext {
  params: SynchronizeParams;
  migrateFunc: (trx: Knex.Transaction) => Promise<any>;
}

export default SyncContext;
