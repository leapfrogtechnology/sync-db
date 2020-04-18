import Knex from 'knex';
import * as path from 'path';

import { glob, exists } from '../util/fs';
import { resolveFile } from './sqlRunner';
import { getElapsedTime } from '../util/ts';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';
import { dbLogger } from '../util/logger';
import { isCLI } from '../config';
import SyncConfig from '../domain/SyncConfig';

const FILE_PATTERN = /(.+)\.(up|down)\.sql$/;

export interface MigrationResult {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  data: any;
  error?: any;
}

export interface MigrationCommandParams {
  onSuccess: (result: MigrationResult) => Promise<any>;
  onFailed: (context: MigrationResult) => Promise<any>;
}

export interface MigrationCommandContext {
  config: SyncConfig;
  connectionId: string;
  params: MigrationCommandParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

const knexMigrationRunnersMap = {
  'migrate.latest': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.latest(config),
  'migrate.rollback': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.rollback(config),
  'migrate.list': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.list(config)
};

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

export async function migrateRun(
  trx: Knex | Knex.Transaction,
  context: MigrationCommandContext,
  func: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => Promise<any>
): Promise<MigrationResult> {
  const log = dbLogger(context.connectionId);
  const { connectionId, knexMigrationConfig } = context;
  const funcName = func.name || 'func';

  let error;
  let data;

  const timeStart = process.hrtime();

  try {
    log(`BEGIN: ${funcName}`);
    data = await func(trx, knexMigrationConfig);

    log(`END: ${funcName}`);
    log('Result:\n%O', data);
  } catch (e) {
    log(`Error caught for connection ${connectionId}:`, e);
    error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  log(`Execution completed in ${timeElapsed} s`);

  const result: MigrationResult = {
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

export async function migrateLatest(
  trx: Knex | Knex.Transaction,
  context: MigrationCommandContext
): Promise<MigrationResult> {
  return migrateRun(trx, context, knexMigrationRunnersMap['migrate.latest']);
}

export async function migrateRollback(
  trx: Knex | Knex.Transaction,
  context: MigrationCommandContext
): Promise<MigrationResult> {
  return migrateRun(trx, context, knexMigrationRunnersMap['migrate.rollback']);
}

export async function migrateList(
  trx: Knex | Knex.Transaction,
  context: MigrationCommandContext
): Promise<MigrationResult> {
  return migrateRun(trx, context, knexMigrationRunnersMap['migrate.list']);
}
