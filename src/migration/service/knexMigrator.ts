import { Knex } from 'knex';
import * as path from 'path';

import { PrepareOptions } from '../../init';
import { dbLogger, log } from '../../util/logger';
import * as runLogger from '../../service/runLogger';
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
    let runId: string | undefined;

    try {
      dbLog(`BEGIN: ${funcName}`);

      // Start run log based on migration API type
      const commandType = getCommandTypeFromMigrationAPI(funcName);
      runId = await runLogger.startRunLog(context.connection, {
        command_type: commandType,
        connection_id: context.connectionId
      });

      const data = await func(trx, context.knexMigrationConfig);

      dbLog(`END: ${funcName}`);
      dbLog('Result:\\n%O', data);

      // Complete run log with success
      await runLogger.completeRunLog(context.connection, runId, {
        is_successful: true
      });

      return data;
    } catch (error) {
      // Complete run log with failure
      if (runId) {
        await runLogger.completeRunLog(context.connection, runId, {
          is_successful: false,
          error: error.message || error.toString()
        });
      }
      throw error;
    }
  });
}

/**
 * Map KnexMigrationAPI to CommandType for logging.
 *
 * @param {KnexMigrationAPI} apiFunc
 * @returns {runLogger.CommandType}
 */
function getCommandTypeFromMigrationAPI(apiFunc: KnexMigrationAPI): runLogger.CommandType {
  switch (apiFunc) {
    case KnexMigrationAPI.MIGRATE_LATEST:
      return runLogger.CommandType.MIGRATE_LATEST;
    case KnexMigrationAPI.MIGRATE_ROLLBACK:
      return runLogger.CommandType.MIGRATE_ROLLBACK;
    case KnexMigrationAPI.MIGRATE_LIST:
      return runLogger.CommandType.MIGRATE_LIST;
    default:
      return runLogger.CommandType.MIGRATE_LIST;
  }
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
    case 'sql':
      const src = await resolveSqlMigrations(options.migrationPath);
      log('Available migration sources:\n%O', src);

      return new SqlMigrationSourceContext(src);

    case 'javascript':
      const srcJS = await resolveJavaScriptMigrations(options.migrationPath);

      log('Available migration sources:\n%O', srcJS);

      return new JavaScriptMigrationContext(srcJS);

    case 'typescript':
      const srcTS = await resolveJavaScriptMigrations(options.migrationPath, FileExtensions.TS);

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
