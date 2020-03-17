import Knex from 'knex';
import * as path from 'path';

import { glob, exists } from '../util/fs';
import { resolveFile } from './sqlRunner';
import SyncConfig from '../domain/SyncConfig';
import KnexMigrationSource from '../KnexMigrationSource';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';

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

/**
 * Get a new instance of KnexMigrationSource.
 *
 * @param {SyncConfig} config
 * @returns {KnexMigrationSource}
 */
function getMigrationConfig(config: SyncConfig): Knex.MigratorConfig {
  const { basePath, migration } = config;
  const migrationPath = path.join(basePath, migration.directory);

  return {
    directory: migrationPath,
    tableName: migration.tableName,
    migrationSource: new KnexMigrationSource(migrationPath)
  };
}

/**
 * Run migrations on a target database connection (transaction).
 *
 * @param {(Knex | Knex.Transaction)} trx
 * @param {SyncConfig} config
 * @returns {Promise<any>}
 */
export function migrateLatest(trx: Knex | Knex.Transaction, config: SyncConfig): Promise<any> {
  return trx.migrate.latest(getMigrationConfig(config));
}

/**
 * Rollback migrations on a target database connection (transaction).
 *
 * @param {(Knex | Knex.Transaction)} trx
 * @param {SyncConfig} config
 * @returns {Promise<any>}
 */
export function rollback(trx: Knex | Knex.Transaction, config: SyncConfig): Promise<any> {
  return trx.migrate.rollback(getMigrationConfig(config));
}

/**
 * List migrations on a target database connection (transaction).
 *
 * @param {(Knex | Knex.Transaction)} trx
 * @param {SyncConfig} config
 * @returns {Promise<any>}
 */
export function list(trx: Knex | Knex.Transaction, config: SyncConfig): Promise<any> {
  return trx.migrate.list(getMigrationConfig(config));
}
