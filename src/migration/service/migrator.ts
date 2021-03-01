import * as path from 'path';

import { glob, exists } from '../../util/fs';
import { resolveFile } from '../../service/sqlRunner';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';
import JavaScriptMigrationEntry from '../domain/JavaScriptMigrationEntry';

const FILE_PATTERN_JS = /(.+).(js|ts)$/
const FILE_PATTERN_SQL = /(.+)\.(up|down)\.sql$/;

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
    const match = filename.match(FILE_PATTERN_SQL);

    if (match && match.length === 3) {
      migrationSet.add(match[1]);
    }
  });

  return Array.from(migrationSet);
}

/**
 * Glob the migration directory and retrieve all the migration entries (names)
 * that needs to be run.
 *
 * @param {string} migrationPath
 * @returns {Promise<string[]>}
 */
export async function getJavaScriptMigrationNames(migrationPath: string): Promise<string[]> {
  const files = await glob(migrationPath);
  const migrationSet = new Set<string>();

  files.forEach(filename => {
    const match = filename.match(FILE_PATTERN_JS);

    if (match) {
      migrationSet.add(match[1]);
    }
  });

  return Array.from(migrationSet);
}

/**
 * Resolve all the migration source for each of the migration entries using the configurations.
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
 * Resolve all the migration source for each of the migration entries using the configurations.
 *
 * @param {string} migrationPath
 * @param {string} extension
 * @returns {Promise<SqlMigrationEntry[]>}
 */
export async function resolveJavaScriptMigrations(migrationPath: string, extension: string = 'js'): Promise<JavaScriptMigrationEntry[]> {
  const migrationNames = await getJavaScriptMigrationNames(migrationPath);
  const migrationPromises = migrationNames.map(async name => {
    const filename = `${name}.${extension}`;

    const {up, down} = require(path.resolve(migrationPath, filename));

    return {
      name,
      queries: { up, down }
    };
  });

  return Promise.all(migrationPromises);
}
