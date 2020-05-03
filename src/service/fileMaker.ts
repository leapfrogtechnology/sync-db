import * as path from 'path';

import * as fs from '../util/fs';
import Configuration from '../domain/Configuration';
import { getMigrationPath } from '../migration/service/knexMigrator';
import { printLine } from '../util/io';

const migrationTemplatePath = path.resolve(__dirname, '../../assets/templates/migration');

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

  const migrationPath = getMigrationPath(config);
  const createUpTemplate = await fs.read(path.join(migrationTemplatePath, 'create_up.sql'));
  const createDownTemplate = await fs.read(path.join(migrationTemplatePath, 'create_down.sql'));

  const timestamp = '20200503200303';
  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  await fs.write(upFilename, createUpTemplate);
  await fs.write(downFilename, createDownTemplate);

  await printLine(`Created ${upFilename}`);
  await printLine(`Created ${downFilename}`);
}
