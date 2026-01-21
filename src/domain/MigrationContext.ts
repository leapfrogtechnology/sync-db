import { Knex } from 'knex';

import OperationParams from './operation/OperationParams';
import OperationContext from './operation/OperationContext';
import ConnectionReference from './ConnectionReference';

interface MigrationContext extends OperationContext {
  params: OperationParams;
  connection: ConnectionReference;
  knexMigrationConfig: Knex.MigratorConfig;
}

export default MigrationContext;
