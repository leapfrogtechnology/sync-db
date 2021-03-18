import * as path from 'path';
import { cyan } from 'chalk';

import * as fs from '../util/fs';
import { log } from '../util/logger';
import { printInfo, printLine } from '../util/io';
import { interpolate } from '../util/string';
import { getTimestampString } from '../util/ts';
import MakeOptions from '../domain/MakeOptions';
import Configuration from '../domain/Configuration';
import FileExtensions from '../enum/FileExtensions';
import { getMigrationPath } from '../migration/service/knexMigrator';

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, '../../assets/templates/migration');
const CREATE_TABLE_CONVENTION = /create_(\w+)_table/;
const SOURCE_TYPE_STUBS = {
  sql: ['create_up.stub', 'create_down.stub'],
  javascript: ['create_js.stub', 'update_js.stub'],
  typescript: ['create_ts.stub', 'update_ts.stub']
};

/**
 * Get template stub directory path.
 *
 * @param {string} basePath
 * @param {string} stubPath
 * @returns {string | null}
 */
export async function publish(config: Configuration) {
  const stubPath = path.join(config.basePath, '/stubs');
  const stubPathExists = await fs.exists(stubPath);

  if (!stubPathExists) {
    log(`Stub path does not exist, creating ${stubPath}`);

    await fs.mkdir(stubPath, { recursive: true });
  }

  const stubs = SOURCE_TYPE_STUBS[config.migration.sourceType] || [];

  log(`Templates to be moved: ${stubs}`);
  await printLine('');

  const res = await Promise.all(
    stubs.map(async stub => {
      if (await fs.exists(path.join(stubPath, stub))) {
        return false;
      }

      await fs.copy(path.join(MIGRATION_TEMPLATE_PATH, stub), path.join(stubPath, stub));
      await printLine(cyan(`  - ${stub}`));

      return true;
    })
  );

  if (res.includes(true)) {
    await printInfo('\n Templates published successfully.\n');
  } else {
    await printLine(' Nothing to publish.\n');
  }
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
  const stubPath = path.join(config.basePath, '/stubs');

  switch (config.migration.sourceType) {
    case 'sql':
      log(`Creating sql migration. ${migrationPath}/${filename}`);

      return makeSqlMigration(filename, {
        ...options,
        migrationPath,
        timestamp,
        stubPath
      });

    case 'javascript':
      log(`Creating JS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
        migrationPath,
        timestamp,
        stubPath,
        extension: FileExtensions.JS
      });

    case 'typescript':
      log(`Creating TS migration. ${migrationPath}/${filename}`);

      return makeJSMigration(filename, {
        ...options,
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
  const { migrationPath, timestamp } = options;

  const upFilename = path.join(migrationPath, `${timestamp}_${filename}.up.sql`);
  const downFilename = path.join(migrationPath, `${timestamp}_${filename}.down.sql`);

  // Use the create migration template if the filename follows the pattern: create_<table>_table.sql
  const createTableMatched = filename.match(CREATE_TABLE_CONVENTION);

  if (createTableMatched) {
    const table = createTableMatched[1];

    log(`Create migration for table: ${table}`);

    createUpTemplate = await getTemplate(options.stubPath, 'create_up.sql').then(template =>
      interpolate(template, { table })
    );
    createDownTemplate = await getTemplate(options.stubPath, 'create_down.sql').then(template =>
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

  const stubFile = `${isCreateStub ? 'create' : 'update'}_${extension}.stub`;
  const template = await getTemplate(options.stubPath, stubFile);

  await fs.write(migrationFilename, interpolate(template, { table }));

  return [migrationFilename];
}

/**
 * Get template from stub file. It looks for published directory stubs files first to use customized
 * stub file. It uses default sync-db stubs if directory is not published.
 *
 * @param  {string} stubPath
 * @param  {string} stubFile
 * @returns {Promise<string>}
 */
async function getTemplate(stubPath: string, stubFile: string): Promise<string> {
  const stubFileExists = await fs.exists(path.join(stubPath, stubFile));
  const templatePath = path.join(stubFileExists ? stubPath : MIGRATION_TEMPLATE_PATH, stubFile);

  return fs.read(templatePath);
}
