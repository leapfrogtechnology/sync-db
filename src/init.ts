import * as Knex from 'knex';

import { log } from './util/logger';
import { validate, isCLI } from './config';
import Configuration from './domain/Configuration';
import KnexMigrationSource from './migration/KnexMigrationSource';
import { resolveMigrationContext } from './migration/service/knexMigrator';

export interface PrepareOptions {
  migrationPath?: string;
  loadMigrations?: boolean;
  loadSqlSources?: boolean;
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
      tableName: config.migration.tableName,
      migrationSource: migrationContext ? new KnexMigrationSource(migrationContext.bind(connectionId)) : null
    })
  };
}
