import { Knex } from 'knex';

import SynchronizeParams from './SynchronizeParams';
import OperationContext from './operation/OperationContext';
import ConnectionReference from './ConnectionReference';

/**
 * Synchronize context for a database connection.
 */
interface SynchronizeContext extends OperationContext {
  params: SynchronizeParams;
  connection: ConnectionReference;
  migrateFunc: (trx: Knex.Transaction) => Promise<any>;
}

export default SynchronizeContext;
