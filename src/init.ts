import { Knex } from 'knex';

import { isCLI, validate } from './config';
import Configuration from './domain/Configuration';
import KnexMigrationSource from './migration/KnexMigrationSource';
import { resolveMigrationContext } from './migration/service/knexMigrator';
import { log } from './util/logger';

export interface PrepareOptions {
  loadMigrations?: boolean;
  loadSqlSources?: boolean;
  migrationPath?: string;
}

export interface PreparedRequirements {
  knexMigrationConfig: (connectionId: string) => Knex.MigratorConfig;
}

/**
 * Prepare configurations, preload requirements and validate before proceeding further.
 *
 * @param {Configuration} config
 * @param {PrepareOptions} options
 * @returns {Promise<PreparedRequirements>}
 */
export async function prepare(config: Configuration, options: PrepareOptions): Promise<PreparedRequirements> {
  log('Prepare: ', options);

  // Validate the config for programmatic API access.
  // CLI access validates the config while loading, for programmatic access it should be done here.
  if (!isCLI()) {
    validate(config);
  }

  const migrationContext = await resolveMigrationContext(config, options);

  return {
    knexMigrationConfig: (connectionId: string) => ({
      migrationSource: migrationContext ? new KnexMigrationSource(migrationContext.bind(connectionId)) : undefined,
      tableName: config.migration.tableName
    })
  };
}
