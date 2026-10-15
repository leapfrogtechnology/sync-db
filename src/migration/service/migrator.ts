import * as path from 'path';

import { glob } from '../../util/fs';
import { runWithConcurrency } from '../../util/promise';
import { MAX_CONCURRENT_FILE_READS } from '../../constants';
import { resolveFile } from '../../service/sqlRunner';
import FileExtensions from '../../enum/FileExtensions';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';
import JavaScriptMigrationEntry from '../domain/JavaScriptMigrationEntry';

const FILE_PATTERN_JS = /(.+).js$/;
const FILE_PATTERN_TS = /(.+).ts$/;
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
  return toSqlMigrationNames(await glob(migrationPath));
}

/**
 * Get the migration entry names from the list of file names of the migration directory.
 *
 * @param {string[]} files
 * @returns {string[]}
 */
function toSqlMigrationNames(files: string[]): string[] {
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
 * that need to be run.
 *
 * @param {string} migrationPath
 * @param {string} extension
 * @returns {Promise<string[]>}
 */
export async function getJavaScriptMigrationNames(migrationPath: string, extension: string): Promise<string[]> {
  const filenames = await glob(migrationPath);
  const migrationSet = new Set<string>();
  const pattern = extension === FileExtensions.JS ? FILE_PATTERN_JS : FILE_PATTERN_TS;

  filenames.forEach(filename => {
    const match = filename.match(pattern);

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
  // The directory listing already tells which of the up / down files exist.
  const files = await glob(migrationPath);
  const available = new Set(files);
  const migrationNames = toSqlMigrationNames(files);

  // Read the files (not the migrations) with a bounded concurrency so that up + down reads stay within the limit.
  const readers = migrationNames.flatMap(name =>
    [`${name}.up.sql`, `${name}.down.sql`].map(filename => async () =>
      available.has(filename) ? resolveFile(migrationPath, filename) : undefined
    )
  );
  const sources = await runWithConcurrency(readers, MAX_CONCURRENT_FILE_READS);

  return migrationNames.map((name, i) => ({
    name,
    queries: { up: sources[2 * i], down: sources[2 * i + 1] }
  }));
}

/**
 * Resolve all the migration source for each of the migration entries using the configurations.
 *
 * @param {string} migrationPath
 * @param {string} extension
 * @returns {Promise<SqlMigrationEntry[]>}
 */
export async function resolveJavaScriptMigrations(
  migrationPath: string,
  extension: string = FileExtensions.JS
): Promise<JavaScriptMigrationEntry[]> {
  const migrationNames = await getJavaScriptMigrationNames(migrationPath, extension);

  if (extension === FileExtensions.TS) {
    // Transpile & execute ts files required on the fly
    require('ts-node').register({
      transpileOnly: true
    });
  }

  const migrationPromises = migrationNames.map(async name => {
    const filename = `${name}.${extension}`;

    const { up, down } = require(path.resolve(migrationPath, filename));

    return {
      name: filename,
      methods: {
        up,
        down
      }
    };
  });

  return Promise.all(migrationPromises);
}
