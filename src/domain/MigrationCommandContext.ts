import * as Knex from 'knex';

import CommandParams from './CommandParams';
import CommandContext from './CommandContext';

interface MigrationCommandContext extends CommandContext {
  params: CommandParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

export default MigrationCommandContext;
