import { Knex } from 'knex';

import OperationContext from './operation/OperationContext';
import OperationParams from './operation/OperationParams';

interface MigrationContext extends OperationContext {
  knexMigrationConfig: Knex.MigratorConfig;
  params: OperationParams;
}

export default MigrationContext;
