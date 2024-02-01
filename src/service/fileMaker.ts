import * as path from 'node:path';

import Configuration from '../domain/Configuration';
import MakeOptions from '../domain/MakeOptions';
import MakePublishResult from '../domain/MakePublishResult';
import FileExtensions from '../enum/FileExtensions';
import { getMigrationPath } from '../migration/service/knexMigrator';
import * as fs from '../util/fs';
import { log } from '../util/logger';
import { interpolate } from '../util/string';
import { getTimestampString } from '../util/ts';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;
const SOURCE_TYPE_STUBS = {
  javascript: ['create_js.stub', 'update_js.stub'],
  sql: ['create_up.stub', 'create_down.stub'],
  typescript: ['create_ts.stub', 'update_ts.stub']
};

/**
 * Copy stub files to user directory and return list of template names.
 *
 * @param  {Configuration} config - The sync-db configuration object.
 * @returns {Promise<MakePublishResult>} - A promise that resolves with the result of the publish operation.
 */
export async function publish(config: Configuration): Promise<MakePublishResult> {
  const ignoredList = [];
  const movedList = [];
  const templateBasePath = path.join(config.basePath, '/stub');
  const templateBasePathExists = await fs.exists(templateBasePath);
  const templates = SOURCE_TYPE_STUBS[config.migration.sourceType] || [];

  if (!templateBasePathExists) {
    log(`Template base path does not exist, creating ${templateBasePath}`);

    await fs.mkdir(templateBasePath, { recursive: true });
  }

  log(`Templates to be moved: ${templates}`);

  for (const template of templates) {
    const templatePath = path.join(templateBasePath, template);

    if (await fs.exists(templatePath)) {
      log(`File already exists: ${templatePath}`);
      ignoredList.push(templatePath);

      continue;
    }

    await fs.copy(path.join(MIGRATION_TEMPLATE_PATH, template), path.join(templateBasePath, template));
    movedList.push(templatePath);
  }

  return { ignoredList, movedList };
}

/**
 * Generate migration file(s).
 *
 * @param {Configuration} config - The sync-db configuration object.
 * @param {string} filename - The migration filename.
 * @param {Partial<MakeOptions>} options - The options for make migration.
 * @returns {Promise<string[]>} - A promise that resolves with the list of generated migration files.
 */
export async function makeMigration(
  config: Configuration,
  filename: string,
  options?: Partial<MakeOptions>
): Promise<string[]> {
  const migrationPath = getMigrationPath(config);
  const migrationPathExists = await fs.exists(migrationPath);

  if (!migrationPathExists) {
    log(`Migration path does not exist, creating ${migrationPath}`);

    await fs.mkdir(migrationPath, { recursive: true });
  }

  const timestamp = getTimestampString();
  const baseTemplatePath = path.join(config.basePath, '/stub');

  switch (config.migration.sourceType) {
    case 'sql': {
      log(`Creating sql migration. ${migrationPath}/${filename}`);

      return makeSqlMigration(filename, {
        ...options,
        baseTemplatePath,
        migrationPath,
        timestamp
      });
    }

    case 'javascript': {
      log(`Creating JS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
        baseTemplatePath,
        extension: FileExtensions.JS,
        migrationPath,
        timestamp
      });
    }

    case 'typescript': {
      log(`Creating TS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
        baseTemplatePath,
        extension: FileExtensions.TS,
        migrationPath,
        timestamp
      });
    }

    default: {
      throw new Error(`Unsupported migration.sourceType value "${config.migration.sourceType}".`);
    }
  }
}

/**
 * Generate sql migration file(s).
 *
 * @param {string} filename - The migration filename.
 * @param {MakeOptions} options - The options for make migration.
 * @returns {Promise<string[]>} - A promise that resolves with the list of generated migration files.
 */
export async function makeSqlMigration(filename: string, options: Omit<MakeOptions, 'extension'>): Promise<string[]> {
  let createUpTemplate = '';
  let createDownTemplate = '';
  const { migrationPath, timestamp } = options;

  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);
  const isCreateStub = Boolean(createTableMatched) || Boolean(options.create);

  if (isCreateStub) {
    const table = options.objectName || (createTableMatched && createTableMatched[1]);

    log(`Create migration for table: ${table}`);

    createUpTemplate = await getTemplate(options.baseTemplatePath, 'create_up.stub').then(template =>
      interpolate(template, { table })
    );
    createDownTemplate = await getTemplate(options.baseTemplatePath, 'create_down.stub').then(template =>
      interpolate(template, { table })
    );
  }

  await fs.write(upFilename, createUpTemplate);
  await fs.write(downFilename, createDownTemplate);

  return [upFilename, downFilename];
}

/**
 * Generate JS/TS migration file(s).
 *
 * @param {string} filename - The migration filename.
 * @param {MakeOptions} options - The options for make migration.
 * @returns {Promise<string[]>} - A promise that resolves with the list of generated migration files.
 */
export async function makeJSMigration(filename: string, options: MakeOptions): Promise<string[]> {
  const { extension, migrationPath, timestamp } = options;
  const migrationFilename = path.join(migrationPath, `${timestamp}_${filename}.${extension}`);
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  const table = options.objectName || (createTableMatched && createTableMatched[1]);
  const isCreateStub = Boolean(createTableMatched) || Boolean(options.create);

  log(`Migration for table '${table}' created.`);

  const templateFilename = `${isCreateStub ? 'create' : 'update'}_${extension}.stub`;
  const template = await getTemplate(options.baseTemplatePath, templateFilename);

  await fs.write(migrationFilename, interpolate(template, { table }));

  return [migrationFilename];
}

/**
 * Get template string by reading stub files either from project base path or sync-db assets' path.
 *
 * @param  {string} baseTemplatePath - The base template path.
 * @param  {string} templateFilename - The template filename.
 * @returns {Promise<string>} - A promise that resolves with the template string.
 */
async function getTemplate(baseTemplatePath: string, templateFilename: string): Promise<string> {
  const baseFilePathExists = await fs.exists(path.join(baseTemplatePath, templateFilename));
  const templatePath = path.join(baseFilePathExists ? baseTemplatePath : MIGRATION_TEMPLATE_PATH, templateFilename);

  return fs.read(templatePath);
}
