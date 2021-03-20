import * as path from 'path';

import * as fs from '../util/fs';
import { log } from '../util/logger';
import { interpolate } from '../util/string';
import { getTimestampString } from '../util/ts';
import MakeOptions from '../domain/MakeOptions';
import Configuration from '../domain/Configuration';
import FileExtensions from '../enum/FileExtensions';
import MakePublishResult from '../domain/MakePublishResult';
import { getMigrationPath } from '../migration/service/knexMigrator';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;
const SOURCE_TYPE_STUBS = {
  sql: ['create_up.stub', 'create_down.stub'],
  javascript: ['create_js.stub', 'update_js.stub'],
  typescript: ['create_ts.stub', 'update_ts.stub']
};

/**
 * Copy stub files to user directory and return list of template names.
 *
 * @param  {Configuration} config
 * @returns {Promise<MakePublishResult>}
 */
export async function publish(config: Configuration): Promise<MakePublishResult> {
  const ignoredList = [];
  const movedList = [];
  const templateBasePath = path.join(config.basePath, '/stubs');
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
 * @param {Configuration} config
 * @param {string} filename
 * @param {Partial<MakeOptions} options
 * @returns {Promise<string[]>}
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
  const baseTemplatePath = path.join(config.basePath, '/stubs');

  switch (config.migration.sourceType) {
    case 'sql':
      log(`Creating sql migration. ${migrationPath}/${filename}`);

      return makeSqlMigration(filename, {
        ...options,
        migrationPath,
        timestamp,
        baseTemplatePath
      });

    case 'javascript':
      log(`Creating JS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
        migrationPath,
        timestamp,
        baseTemplatePath,
        extension: FileExtensions.JS
      });

    case 'typescript':
      log(`Creating TS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
        migrationPath,
        timestamp,
        baseTemplatePath,
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
  const { migrationPath, timestamp } = options;

  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);
  const isCreateStub = !!createTableMatched || !!options.create;

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
 * @param {string} filename
 * @param {MakeOptions} options
 * @returns {Promise<string[]>}
 */
export async function makeJSMigration(filename: string, options: MakeOptions): Promise<string[]> {
  const { migrationPath, timestamp, extension } = options;
  const migrationFilename = path.join(migrationPath, `${timestamp}_${filename}.${extension}`);
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  const table = options.objectName || (createTableMatched && createTableMatched[1]);
  const isCreateStub = !!createTableMatched || !!options.create;

  log(`Migration for table '${table}' created.`);

  const templateFilename = `${isCreateStub ? 'create' : 'update'}_${extension}.stub`;
  const template = await getTemplate(options.baseTemplatePath, templateFilename);

  await fs.write(migrationFilename, interpolate(template, { table }));

  return [migrationFilename];
}

/**
 * Get template string by reading stub files either from project base path or sync-db assets' path.
 *
 * @param  {string} baseTemplatePath
 * @param  {string} templateFilename
 * @returns {Promise<string>}
 */
async function getTemplate(baseTemplatePath: string, templateFilename: string): Promise<string> {
  const baseFilePathExists = await fs.exists(path.join(baseTemplatePath, templateFilename));
  const templatePath = path.join(baseFilePathExists ? baseTemplatePath : MIGRATION_TEMPLATE_PATH, templateFilename);

  return fs.read(templatePath);
}
