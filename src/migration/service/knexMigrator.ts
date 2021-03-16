import * as Knex from 'knex';
import * as path from 'path';

import { PrepareOptions } from '../../init';
import { dbLogger, log } from '../../util/logger';
import Configuration from '../../domain/Configuration';
import FileExtensions from '../../enum/FileExtensions';
import { executeOperation } from '../../service/execution';
import MigrationContext from '../../domain/MigrationContext';
import OperationResult from '../../domain/operation/OperationResult';
import MigrationSourceContext from '../domain/MigrationSourceContext';
import { resolveSqlMigrations, resolveJavaScriptMigrations } from './migrator';
import SqlMigrationSourceContext from '../source-types/SqlMigrationSourceContext';
import JavaScriptMigrationContext from '../source-types/JavaScriptMigrationSourceContext';

export enum KnexMigrationAPI {
  MIGRATE_LIST = 'migrate.list',
  MIGRATE_LATEST = 'migrate.latest',
  MIGRATE_ROLLBACK = 'migrate.rollback'
}

/**
 * A map of Knex's migration API functions.
 */
const migrationApiMap = {
  // Run up to the latest migrations.
  [KnexMigrationAPI.MIGRATE_LATEST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.latest(config),

  // Rollback migrations.
  [KnexMigrationAPI.MIGRATE_ROLLBACK]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.rollback(config),

  // List migrations.
  [KnexMigrationAPI.MIGRATE_LIST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.list(config)
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
  if (options.loadMigrations !== true) {
    return null;
  }

  log(`Initialize migration context [sourceType=${config.migration.sourceType}]`);

  const migrationPath = getMigrationPath(config);

  switch (config.migration.sourceType) {
    case 'sql':
      const src = await resolveSqlMigrations(migrationPath);

      log('Available migration sources:\n%O', src);

      return new SqlMigrationSourceContext(src);

    case 'javascript':
      const srcJS = await resolveJavaScriptMigrations(migrationPath, FileExtensions.JS, config.migration.includeExtension);

      log('Available migration sources:\n%O', srcJS);

      return new JavaScriptMigrationContext(srcJS);

    case 'typescript':
      const srcTS = await resolveJavaScriptMigrations(migrationPath, FileExtensions.TS, config.migration.includeExtension);

      log('Available migration sources:\n%O', srcTS);

      return new JavaScriptMigrationContext(srcTS);

    default:
      throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
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
