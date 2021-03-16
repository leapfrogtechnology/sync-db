import * as path from 'path';

import * as fs from '../util/fs';
import { log } from '../util/logger';
import { interpolate } from '../util/string';
import { getTimestampString } from '../util/ts';
import MakeOptions from '../domain/MakeOptions';
import Configuration from '../domain/Configuration';
import FileExtensions from '../enum/FileExtensions';
import { getMigrationPath } from '../migration/service/knexMigrator';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;

/**
 * Get template stub directory path.
 *
 * @param {string} basePath
 * @param {string} stubPath
 * @returns {string | null}
 */
export function getStubPath(config: Configuration): string | null {
  if (!config.migration.stubPath) {
    return null;
  }

  return path.isAbsolute(config.migration.stubPath)
    ? config.migration.stubPath
    : path.join(config.basePath, config.migration.stubPath);
}

/**
 * Generate migration file(s).
 *
 * @param {Configuration} config
 * @param {string} filename
 * @param {string} objectName
 * @returns {Promise<string[]>}
 */
export async function makeMigration(config: Configuration, filename: string, objectName?: string): Promise<string[]> {
  const migrationPath = getMigrationPath(config);
  const migrationPathExists = await fs.exists(migrationPath);

  if (!migrationPathExists) {
    log(`Migration path does not exist, creating ${migrationPath}`);

    await fs.mkdir(migrationPath, { recursive: true });
  }

  const timestamp = getTimestampString();
  const stubPath = getStubPath(config);

  switch (config.migration.sourceType) {
    case 'sql':
      log(`Creating sql migration. ${migrationPath}/${filename}`);

      return makeSqlMigration(filename, {
        objectName,
        migrationPath,
        timestamp,
        stubPath
      });

    case 'javascript':
      log(`Creating JS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        objectName,
        migrationPath,
        timestamp,
        stubPath,
        extension: FileExtensions.JS
      });

    case 'typescript':
      log(`Creating TS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        objectName,
        migrationPath,
        timestamp,
        stubPath,
        extension: FileExtensions.TS
      });

    default:
      throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
  }
}

/**
 * Generate sql migration file(s).
 *
 * @param {string} filename
 * @param {MakeOptions} options
 * @returns {Promise<string[]>}
 */
export async function makeSqlMigration(filename: string, options: Omit<MakeOptions, 'extension'>): Promise<string[]> {
  let createUpTemplate = '';
  let createDownTemplate = '';
  const { migrationPath, timestamp, stubPath } = options;

  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    const table = createTableMatched[1];

    log(`Create migration for table: ${table}`);

    createUpTemplate = await fs
      .read(stubPath || path.join(MIGRATION_TEMPLATE_PATH, 'create_up.sql'))
      .then(template => interpolate(template, { table }));
    createDownTemplate = await fs
      .read(stubPath || path.join(MIGRATION_TEMPLATE_PATH, 'create_down.sql'))
      .then(template => interpolate(template, { table }));
  }

  await fs.write(upFilename, createUpTemplate);
  await fs.write(downFilename, createDownTemplate);

  return [upFilename, downFilename];
}

/**
 * Generate JS/TS migration file(s).
 *
 * @param {string} filename
 * @param {MakeOptions} options
 * @returns {Promise<string[]>}
 */
export async function makeJSMigration(filename: string, options: MakeOptions): Promise<string[]> {
  let template = '';
  let table = options.objectName;

  const { migrationPath, timestamp, extension, stubPath } = options;
  const migrationFilename = path.join(migrationPath, `${timestamp}_${filename}.${extension}`);
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    table = table || createTableMatched[1];

    log(`Create migration for table: ${table}`);

    template = await fs.read(stubPath || path.join(MIGRATION_TEMPLATE_PATH, `create_table_${extension}.stub`));
  } else {
    log(`Migration for table: ${table}`);

    template = await fs.read(stubPath || path.join(MIGRATION_TEMPLATE_PATH, `alter_${extension}.stub`));
  }

  await fs.write(migrationFilename, interpolate(template, { table }));

  return [migrationFilename];
}
