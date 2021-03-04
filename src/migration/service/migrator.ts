import * as path from 'path';

import { glob, exists } from '../../util/fs';
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
export async function resolveJavaScriptMigrations(
  migrationPath: string,
  extension: string = FileExtensions.JS
): Promise<JavaScriptMigrationEntry[]> {
  const migrationNames = await getJavaScriptMigrationNames(migrationPath, extension);

  let mRequire: NodeRequire = require;

  if (extension === FileExtensions.TS) {
    // Transpile & execute ts files required on the fly
    require('ts-node').register({
      transpileOnly: true
    });
  } else {
    // On the fly es6 => commonJS
    mRequire = require('esm')(module);
  }

  const migrationPromises = migrationNames.map(async name => {
    const filename = `${name}.${extension}`;

    const { up, down } = mRequire(path.resolve(migrationPath, filename));

    return {
      name,
      methods: {
        up,
        down
      }
    };
  });

  return Promise.all(migrationPromises);
}
