import { Knex } from 'knex';
import * as path from 'node:path';

import Configuration from '../../domain/Configuration';
import MigrationContext from '../../domain/MigrationContext';
import OperationResult from '../../domain/operation/OperationResult';
import FileExtensions from '../../enum/FileExtensions';
import { PrepareOptions } from '../../init';
import { executeOperation } from '../../service/execution';
import { dbLogger, log } from '../../util/logger';
import MigrationSourceContext from '../domain/MigrationSourceContext';
import JavaScriptMigrationContext from '../source-types/JavaScriptMigrationSourceContext';
import SqlMigrationSourceContext from '../source-types/SqlMigrationSourceContext';
import { resolveJavaScriptMigrations, resolveSqlMigrations } from './migrator';

export enum KnexMigrationAPI {
  MIGRATE_LATEST = 'migrate.latest',
  MIGRATE_LIST = 'migrate.list',
  MIGRATE_ROLLBACK = 'migrate.rollback'
}

/**
 * A map of Knex's migration API functions.
 */
const migrationApiMap = {
  // Run up to the latest migrations.
  [KnexMigrationAPI.MIGRATE_LATEST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.latest(config),

  // List migrations.
  [KnexMigrationAPI.MIGRATE_LIST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.list(config),

  // Rollback migrations.
  [KnexMigrationAPI.MIGRATE_ROLLBACK]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.rollback(config)
};

/**
 * Invoke Knex's migration API for given function.
 *
 * @param {Knex.Transaction} trx
 * @param {KnexMigrationAPI} funcName
 * @param {MigrationContext} context
 * @returns {Promise<OperationResult>}
 */
export async function invokeMigrationApi(
  trx: Knex.Transaction,
  funcName: KnexMigrationAPI,
  context: MigrationContext
): Promise<OperationResult> {
  return executeOperation(context, async () => {
    const func = migrationApiMap[funcName];

    const dbLog = dbLogger(context.connectionId);

    dbLog(`BEGIN: ${funcName}`);

    const data = await func(trx, context.knexMigrationConfig);

    dbLog(`END: ${funcName}`);
    dbLog('Result:\n%O', data);

    return data;
  });
}

/**
 * Resolve migration context based on the migration configuration.
 *
 * @param {Configuration} config
 * @param {PrepareOptions} options
 * @returns {(Promise<MigrationSourceContext | null>)}
 */
export async function resolveMigrationContext(
  config: Configuration,
  options: PrepareOptions
): Promise<MigrationSourceContext | null> {
  if (options.loadMigrations !== true || !options.migrationPath) {
    return null;
  }

  log(`Initialize migration context [sourceType=${config.migration.sourceType}]`);

  switch (config.migration.sourceType) {
    case 'sql': {
      const src = await resolveSqlMigrations(options.migrationPath);
      log('Available migration sources:\n%O', src);

      return new SqlMigrationSourceContext(src);
    }

    case 'javascript': {
      const srcJS = await resolveJavaScriptMigrations(options.migrationPath);

      log('Available migration sources:\n%O', srcJS);

      return new JavaScriptMigrationContext(srcJS);
    }

    case 'typescript': {
      const srcTS = await resolveJavaScriptMigrations(options.migrationPath, FileExtensions.TS);

      log('Available migration sources:\n%O', srcTS);

      return new JavaScriptMigrationContext(srcTS);
    }

    default: {
      throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
    }
  }
}

/**
 * Get Migration directory path.
 *
 * @param {Configuration} config
 * @returns {string}
 */
export function getMigrationPath(config: Configuration): string {
  const { basePath, migration } = config;
  // Migration directory could be absolute OR could be relative to the basePath.
  const migrationPath = path.isAbsolute(migration.directory)
    ? migration.directory
    : path.join(basePath, migration.directory);

  return migrationPath;
}
