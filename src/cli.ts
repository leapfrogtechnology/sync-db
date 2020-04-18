import * as path from 'path';

import * as fs from './util/fs';
import { printLine } from './util/io';
import SyncDbOptions from './domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from './constants';
import { resolveConnectionsFromEnv } from './config';
import SyncParams from './domain/SyncParams';

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
  }
}
