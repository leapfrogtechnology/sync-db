import * as path from 'path';

import * as fs from '../util/fs';
import { log } from '../util/logger';
import { interpolate } from '../util/string';
import { getTimestampString } from '../util/ts';
import Configuration from '../domain/Configuration';
import FileExtensions from '../enum/FileExtensions';
import { getMigrationPath } from '../migration/service/knexMigrator';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;

/**
 * Generate migration file(s).
 *
 * @param {string} filename
 * @returns {Promise<string[]>}
 */
export async function makeMigration(config: Configuration, filename: string): Promise<string[]> {
  const migrationPath = getMigrationPath(config);
  const migrationPathExists = await fs.exists(migrationPath);

  if (!migrationPathExists) {
    log(`Migration path does not exist, creating ${migrationPath}`);

    await fs.mkdir(migrationPath, { recursive: true });
  }

  const timestamp = getTimestampString();

  switch (config.migration.sourceType) {
    case 'sql':
      log(`Creating sql migration. ${migrationPath}/${filename}`);

      return makeSqlMigration(filename, migrationPath, timestamp);

    case 'javascript':
      log(`Creating JS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, migrationPath, timestamp);

    case 'typescript':
      log(`Creating TS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, migrationPath, timestamp, FileExtensions.TS);

    default:
      throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
  }
}

/**
 * Generate sql migration file(s).
 *
 * @param {string} filename
 * @param {string} migrationPath
 * @param {string} timestamp
 * @returns {Promise<string[]>}
 */
export async function makeSqlMigration(filename: string, migrationPath: string, timestamp: string): Promise<string[]> {
  let createUpTemplate = '';
  let createDownTemplate = '';

  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    const table = createTableMatched[1];

    log(`Create migration for table: ${table}`);

    createUpTemplate = await fs
      .read(path.join(MIGRATION_TEMPLATE_PATH, 'create_up.sql'))
      .then(template => interpolate(template, { table }));
    createDownTemplate = await fs
      .read(path.join(MIGRATION_TEMPLATE_PATH, 'create_down.sql'))
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
 * @param {string} migrationPath
 * @param {string} timestamp
 * @param {string} extension
 * @returns {Promise<string[]>}
 */
export async function makeJSMigration(
  filename: string,
  migrationPath: string,
  timestamp: string,
  extension: string = FileExtensions.JS
): Promise<string[]> {
  let createTemplate = '';

  const migrationFilename = path.join(migrationPath, `${timestamp}_${filename}.${extension}`);
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    const table = createTableMatched[1];

    log(`Create migration for table: ${table}`);

    createTemplate = await fs
      .read(path.join(MIGRATION_TEMPLATE_PATH, `create_table_${extension}.stub`))
      .then(template => interpolate(template, { table }));
  }

  await fs.write(migrationFilename, createTemplate);

  return [migrationFilename];
}
