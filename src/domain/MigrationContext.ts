import * as Knex from 'knex';

import OperationParams from './operation/OperationParams';
import OperationContext from './operation/OperationContext';

interface MigrationContext extends OperationContext {
  params: OperationParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

export default MigrationContext;
