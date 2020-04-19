import Configuration from './Configuration';
import SynchronizeParams from './SynchronizeParams';
import Knex from 'knex';

/**
 * Synchronize context for a database connection.
 */
interface SyncContext {
  config: Configuration;
  connectionId: string;
  params: SynchronizeParams;
  migrateFunc: (trx: Knex.Transaction) => Promise<any>;
}

export default SyncContext;
