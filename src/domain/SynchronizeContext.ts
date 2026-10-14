import { Knex } from 'knex';

import { SqlSourceReader } from '../service/sqlRunner';
import SynchronizeParams from './SynchronizeParams';
import OperationContext from './operation/OperationContext';

/**
 * Synchronize context for a database connection.
 */
interface SynchronizeContext extends OperationContext {
  params: SynchronizeParams;
  readSource?: SqlSourceReader;
  migrateFunc: (trx: Knex.Transaction) => Promise<any>;
}

export default SynchronizeContext;
