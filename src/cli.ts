import * as path from 'path';

import * as fs from './util/fs';
import { printLine } from './util/io';
import SyncDbOptions from './domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from './constants';
import { resolveConnectionsFromEnv, loadConfig, resolveConnections } from './config';
import { getElapsedTime } from './util/misc';
import SyncParams from './domain/SyncParams';
import { log } from './util/logger';

/**
 * Generates connections.sync-db.json file.
 *
 * @returns {Promise<void>}
 */
async function generateConnection(): Promise<void> {
  const filePath = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

  const connections = resolveConnectionsFromEnv();
  const contents = JSON.stringify({ connections });

  await fs.write(filePath, contents);

  await printLine(`Generated file: ${CONNECTIONS_FILENAME}\n`);
}

async function migrate(params: SyncParams): Promise<void> {
  const config = await loadConfig();
  const connections = await resolveConnections();
  const { migrateLatest } = await import('./api');
  const timeStart = process.hrtime();

  await printLine('Synchronizing...\n');

  const results = await migrateLatest(config, connections, params);

  log('Results:', results);
  console.log('Results', results); // tslint:disable-line

  const successfulCount = results.filter(item => item.success).length;

  if (successfulCount > 0) {
    // Display output.
    await printLine(
      `Migration complete for ${successfulCount} / ${results.length} connection(s). ` +
        `(${getElapsedTime(timeStart)}s)`
    );
  }

  // If all completed successfully, exit gracefully.
  if (results.length === successfulCount) {
    return process.exit(0);
  }

  throw new Error(`Synchronization failed for some connections.`);
}

async function rollback(params: SyncParams): Promise<void> {
  const config = await loadConfig();
  const connections = await resolveConnections();
  const { migrateRollback } = await import('./api');
  const timeStart = process.hrtime();

  await printLine('Rolling back...\n');

  const results = await migrateRollback(config, connections, params);

  log('Results:', results);
  console.log('Results', results); // tslint:disable-line

  const successfulCount = results.filter(item => item.success).length;

  if (successfulCount > 0) {
    // Display output.
    await printLine(
      `Rollback complete for ${successfulCount} / ${results.length} connection(s). ` + `(${getElapsedTime(timeStart)}s)`
    );
  }

  // If all completed successfully, exit gracefully.
  if (results.length === successfulCount) {
    return process.exit(0);
  }

  throw new Error(`Synchronization failed for some connections.`);
}

async function list(params: SyncParams): Promise<void> {
  const config = await loadConfig();
  const connections = await resolveConnections();
  const { migrateList } = await import('./api');
  const timeStart = process.hrtime();

  const results = await migrateList(config, connections, params);

  log('Results:', results);
  console.log('Results', results); // tslint:disable-line

  const successfulCount = results.filter(item => item.success).length;

  if (successfulCount > 0) {
    // Display output.
    await printLine(
      `List complete for ${successfulCount} / ${results.length} connection(s). ` + `(${getElapsedTime(timeStart)}s)`
    );
  }

  // If all completed successfully, exit gracefully.
  if (results.length === successfulCount) {
    return process.exit(0);
  }

  throw new Error(`Synchronization failed for some connections.`);
}

/**
 * Handle the provided CLI flags.
 *
 * @param {SyncDbOptions} flags
 * @returns {Promise<void>}
 */
export async function handleFlags(flags: SyncDbOptions, params: SyncParams): Promise<void> {
  if (flags['generate-connections']) {
    await generateConnection();
    process.exit(0);
  } else if (flags['migrate']) {
    await migrate(params);
    process.exit(0);
  } else if (flags['rollback']) {
    await rollback(params);
    process.exit(0);
  } else if (flags['list']) {
    await list(params);
    process.exit(0);
  }
}
