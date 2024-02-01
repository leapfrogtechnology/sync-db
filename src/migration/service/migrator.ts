import * as path from 'node:path';

import FileExtensions from '../../enum/FileExtensions';
import { resolveFile } from '../../service/sqlRunner';
import { exists, glob } from '../../util/fs';
import JavaScriptMigrationEntry from '../domain/JavaScriptMigrationEntry';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';

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
 * @param {string} migrationPath - The migration directory path.
 * @returns {Promise<string[]>} - A promise that resolves with the list of migration names.
 */
export async function getSqlMigrationNames(migrationPath: string): Promise<string[]> {
  const files = await glob(migrationPath);
  const migrationSet = new Set<string>();

  for (const filename of files) {
    const match = filename.match(FILE_PATTERN_SQL);

    if (match && match.length === 3) {
      migrationSet.add(match[1]);
    }
  }

  return [...migrationSet];
}

/**
 * Glob the migration directory and retrieve all the migration entries (names)
 * that need to be run.
 *
 * @param {string} migrationPath - The migration directory path.
 * @param {string} extension - The file extension.
 * @returns {Promise<string[]>} - A promise that resolves with the list of migration names.
 */
export async function getJavaScriptMigrationNames(migrationPath: string, extension: string): Promise<string[]> {
  const filenames = await glob(migrationPath);
  const migrationSet = new Set<string>();
  const pattern = extension === FileExtensions.JS ? FILE_PATTERN_JS : FILE_PATTERN_TS;

  for (const filename of filenames) {
    const match = filename.match(pattern);

    if (match) {
      migrationSet.add(match[1]);
    }
  }

  return [...migrationSet];
}

/**
 * Resolve all the migration source for each of the migration entries using the configurations.
 *
 * @param {string} migrationPath - The migration directory path.
 * @returns {Promise<SqlMigrationEntry[]>} - A promise that resolves with the list of sql migration entries.
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
      queries: { down, up }
    };
  });

  return Promise.all(migrationPromises);
}

/**
 * Resolve all the migration source for each of the migration entries using the configurations.
 *
 * @param {string} migrationPath - The migration directory path.
 * @param {string} extension - The file extension.
 * @returns {Promise<SqlMigrationEntry[]>} - A promise that resolves with the list of sql migration entries.
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

    const { down, up } = mRequire(path.resolve(migrationPath, filename));

    return {
      methods: {
        down,
        up
      },
      name: filename
    };
  });

  return Promise.all(migrationPromises);
}
