import * as path from 'path';

import * as fs from '../util/fs';
import { log } from '../util/logger';
import { getTimestampString } from '../util/ts';
import Configuration from '../domain/Configuration';
import { getMigrationPath } from '../migration/service/knexMigrator';

const MIGRATION_TMPL_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;

/**
 * Generate migration file(s).
 *
 * @param {string} filename
 * @returns {Promise<string[]>}
 */
export async function makeMigration(config: Configuration, filename: string): Promise<string[]> {
  if (config.migration.sourceType !== 'sql') {
    // TODO: We'll need to support different types of migrations eg both sql & js
    // For instance migrations in JS would have different context like JavaScriptMigrationContext.
    throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
  }

  let createUpTemplate = '';
  let createDownTemplate = '';

  const migrationPath = getMigrationPath(config);
  const migrationPathExists = await fs.exists(migrationPath);

  if (!migrationPathExists) {
    log(`Migration path does not exist, creating ${migrationPath}`);

    await fs.mkdir(migrationPath, { recursive: true });
  }

  const timestamp = getTimestampString();
  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    const table = createTableMatched[1];

    log(`Create migration for table: ${table}`);
    console.log('Table: ', table); // tslint:disable-line

    // TODO: Use interpolation function.
    createUpTemplate = await fs
      .read(path.join(MIGRATION_TMPL_PATH, 'create_up.sql'))
      .then(template => template.replace(new RegExp('{{table}}', 'g'), table));
    createDownTemplate = await fs
      .read(path.join(MIGRATION_TMPL_PATH, 'create_down.sql'))
      .then(template => template.replace(new RegExp('{{table}}', 'g'), table));
  }

  await fs.write(upFilename, createUpTemplate);
  await fs.write(downFilename, createDownTemplate);

  return [upFilename, downFilename];
}
