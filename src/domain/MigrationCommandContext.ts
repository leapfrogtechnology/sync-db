import * as Knex from 'knex';

import Configuration from './Configuration';
import CommandParams from './CommandParams';
import CommandResult from './CommandResult';

interface MigrationCommandContext {
  config: Configuration;
  connectionId: string;
  params: CommandParams<CommandResult>;
  knexMigrationConfig: Knex.MigratorConfig;
}

export default MigrationCommandContext;
