import Knex from 'knex';
import * as path from 'path';

import { glob, exists } from '../util/fs';
import { resolveFile } from './sqlRunner';
import { getElapsedTime } from '../util/ts';
// import SqlMigrationContext, { MigrationContext } from '../migration/SqlMigrationContext';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';
import SyncResult from '../domain/SyncResult';
// import SyncContext from '../domain/SyncContext';
import { dbLogger } from '../util/logger';
import { isCLI } from '../config';
import ExecutionContext from '../domain/ExecutionContext';
// import KnexMigrationSource from '../migration/KnexMigrationSource';
import SyncConfig from '../domain/SyncConfig';
import SyncParams from '../domain/SyncParams';

const FILE_PATTERN = /(.+)\.(up|down)\.sql$/;

/**
 * Glob the migration directory and retrieve all the migration entries (names)
 * that needs to be run.
 *
 * Note: The ".up.sql" and ".down.sql" part of the migration files are
 * omitted and and a pair of those files are considered a single migration entry.
 *
 * @param {string} migrationPath
 * @returns {Promise<string[]>}
 */
export async function getSqlMigrationNames(migrationPath: string): Promise<string[]> {
  const files = await glob(migrationPath);
  const migrationSet = new Set<string>();

  files.forEach(filename => {
    const match = filename.match(FILE_PATTERN);

    if (match && match.length === 3) {
      migrationSet.add(match[1]);
    }
  });

  return Array.from(migrationSet);
}

/**
 * Resolve all the migration source for each of the migration entries.
 *
 * @param {string} migrationPath
 * @returns {Promise<SqlMigrationEntry[]>}
 */
export async function resolveSqlMigrations(migrationPath: string): Promise<SqlMigrationEntry[]> {
  const migrationNames = await getSqlMigrationNames(migrationPath);
  const migrationPromises = migrationNames.map(async name => {
    const upFilename = `${name}.up.sql`;
    const downFilename = `${name}.down.sql`;

    const upFileExists = await exists(path.join(migrationPath, upFilename));
    const downFileExists = await exists(path.join(migrationPath, downFilename));

    const up = upFileExists ? await resolveFile(migrationPath, upFilename) : undefined;
    const down = downFileExists ? await resolveFile(migrationPath, downFilename) : undefined;

    return {
      name,
      queries: { up, down }
    };
  });

  return Promise.all(migrationPromises);
}

// /**
//  * Get a new instance of KnexMigrationSource.
//  *
//  * @param {SyncConfig} context
//  * @returns {SqlMigrationContext}
//  */
// async function getMigrationConfig(context: SyncContext): Promise<Knex.MigratorConfig> {
//   const log = dbLogger(context.connectionId);
//   log('Getting migration config');

//   const { basePath, migration } = context.config;
//   const migrationPath = path.join(basePath, migration.directory);

//   const migrations = await resolveSqlMigrations(migrationPath);

//   // TODO: Multiple migration context based on type of migration (sql, js, etc)
//   const migrationContext = new SqlMigrationContext(context.connectionId, migrations);

//   log('Available Migrations:', migrations);
//   log('Table Name:', migration.tableName);

//   return {
//     tableName: migration.tableName,
//     migrationSource: new KnexMigrationSource(migrationContext)
//   };
// }

/**
 * Synchronize context parameters for the current database connection.
 */
interface MigrationCommandContext {
  config: SyncConfig;
  connectionId: string;
  params: SyncParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

/**
 * Run migrations on a target database connection / transaction.
 *
 * @param {(Knex | Knex.Transaction)} trx
 * @param {SyncConfig} context
 * @returns {Promise<any>}
 */
export async function migrateLatest(trx: Knex | Knex.Transaction, context: MigrationCommandContext): Promise<any> {
  const { connectionId, knexMigrationConfig } = context;
  const log = dbLogger(context.connectionId);
  const result: SyncResult = { connectionId, success: false };

  const timeStart = process.hrtime();

  try {
    log('BEGIN: migrate.latest');
    const migrationResult = await trx.migrate.latest(knexMigrationConfig);

    log('END: migrate.latest');
    log('Migration Result:\n%O', migrationResult);

    result.success = true;
  } catch (e) {
    log(`Error caught for connection ${connectionId}:`, e);
    result.error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  log(`Execution completed in ${timeElapsed} s`);

  // If it's a CLI environment, invoke the handler.
  if (isCLI()) {
    const handler = result.success ? context.params.onSuccess : context.params.onFailed;
    const execContext: ExecutionContext = {
      connectionId,
      timeElapsed,
      success: result.success
    };

    await handler(execContext);
  }

  return result;
}

export async function migrateRollback(trx: Knex | Knex.Transaction, context: MigrationCommandContext): Promise<any> {
  const { connectionId, knexMigrationConfig } = context;
  const log = dbLogger(context.connectionId);
  const result: SyncResult = { connectionId, success: false };

  const timeStart = process.hrtime();

  try {
    log('BEGIN: migrate.rollback');
    const migrationResult = await trx.migrate.rollback(knexMigrationConfig);

    log('END: migrate.rollback');
    log('Migration Result:\n%O', migrationResult);

    result.success = true;
  } catch (e) {
    log(`Error caught for connection ${connectionId}:`, e);
    result.error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  log(`Execution completed in ${timeElapsed} s`);

  // If it's a CLI environment, invoke the handler.
  if (isCLI()) {
    const handler = result.success ? context.params.onSuccess : context.params.onFailed;
    const execContext: ExecutionContext = {
      connectionId,
      timeElapsed,
      success: result.success
    };

    await handler(execContext);
  }

  return result;
}

export interface MigrationListResult {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  data: any;
  error?: any;
}

/**
 * Synchronize parameters.
 */
export interface MigrationListParams {
  onSuccess: (context: MigrationListResult) => Promise<any>;
  onFailed: (context: MigrationListResult) => Promise<any>;
}

export interface MCommandContext<T> {
  config: SyncConfig;
  connectionId: string;
  params: T;
  knexMigrationConfig: Knex.MigratorConfig;
}

export async function migrateList(
  trx: Knex | Knex.Transaction,
  context: MCommandContext<MigrationListParams>
): Promise<MigrationListResult> {
  const { connectionId, knexMigrationConfig } = context;
  const log = dbLogger(context.connectionId);

  let error;
  let data;

  const timeStart = process.hrtime();

  try {
    log('BEGIN: migrate.list');
    data = await trx.migrate.list(knexMigrationConfig);

    log('END: migrate.list');
    log('Migration Result:\n%O', data);
  } catch (e) {
    log(`Error caught for connection ${connectionId}:`, e);
    error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  log(`Execution completed in ${timeElapsed} s`);

  const result: MigrationListResult = {
    connectionId,
    error,
    data,
    timeElapsed,
    success: !error
  };

  // If it's a CLI environment, invoke the handler.
  if (isCLI()) {
    const handler = result.success ? context.params.onSuccess : context.params.onFailed;

    await handler(result);
  }

  return result;
}
