import { Knex } from 'knex';

import SynchronizeParams from './SynchronizeParams';
import OperationContext from './operation/OperationContext';
import OperationResult from './operation/OperationResult';

/**
 * Synchronize context for a database connection.
 */
interface SynchronizeContext extends OperationContext {
  migrateFunc: (trx: Knex.Transaction) => Promise<OperationResult>;
  params: SynchronizeParams;
}

export default SynchronizeContext;
