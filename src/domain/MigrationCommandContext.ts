import * as Knex from 'knex';

import OperationParams from './operation/OperationParams';
import OperationContext from './operation/OperationContext';

interface MigrationCommandContext extends OperationContext {
  params: OperationParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

export default MigrationCommandContext;
