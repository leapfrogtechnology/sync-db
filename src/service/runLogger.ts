import { Knex } from 'knex';
import * as crypto from 'crypto';
import { log } from '../util/logger';
import ConnectionReference from '../domain/ConnectionReference';

/**
 * Command types that can be logged.
 */
export enum CommandType {
  PRUNE = 'prune',
  SYNCHRONIZE = 'synchronize',
  MIGRATE_LIST = 'migrate-list',
  MIGRATE_LATEST = 'migrate-latest',
  MIGRATE_ROLLBACK = 'migrate-rollback'
}

/**
 * Run log entry interface.
 */
export interface RunLogEntry {
  run_id: string;
  run_date: Date;
  error?: string;
  connection_id?: string;
  is_successful: boolean;
  command_type: CommandType;
  metadata?: Record<string, any>;
}

const TABLE_NAME = '__sync_db_run_logs';

/**
 * Generate a unique run ID.
 *
 * @returns {string}
 */
function generateRunId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Ensure the run logs table exists.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function ensureRunLogsTable(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);

  if (!hasTable) {
    log(`Creating ${TABLE_NAME} table...`);

    await knex.schema.createTable(TABLE_NAME, table => {
      table.string('run_id', 36).primary();
      table.timestamp('run_date').notNullable().defaultTo(knex.fn.now());
      table.string('command_type', 50).notNullable();
      table.string('connection_id', 100).nullable();
      table.boolean('is_successful').notNullable().defaultTo(false);
      table.text('error').nullable();
      table.json('metadata').nullable();

      // Add indexes for common queries
      table.index(['command_type', 'run_date']);
      table.index(['connection_id', 'run_date']);
      table.index(['is_successful', 'run_date']);
    });

    log(`${TABLE_NAME} table created successfully.`);
  }
}

/**
 * Start a run log entry.
 *
 * @param {ConnectionReference} conn
 * @param {Partial<RunLogEntry>} entry
 * @returns {Promise<string>} runId
 */
export async function startRunLog(conn: ConnectionReference, entry: Partial<RunLogEntry>): Promise<string> {
  const knex = conn.connection;
  await ensureRunLogsTable(knex);

  const runId = generateRunId();
  const logEntry = {
    run_id: runId,
    run_date: new Date(),
    is_successful: false,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : '',
    ...entry
  };

  await knex(TABLE_NAME).insert(logEntry);

  log(`Run log started: ${runId} for command: ${entry.command_type}`);

  return runId;
}

/**
 * Complete a run log entry with success status.
 *
 * @param {ConnectionReference} conn
 * @param {string} runId
 * @param {Partial<RunLogEntry>} entry
 * @returns {Promise<void>}
 */
export async function completeRunLog(
  conn: ConnectionReference,
  runId: string,
  entry: Partial<RunLogEntry>
): Promise<void> {
  const knex = conn.connection;

  await knex(TABLE_NAME)
    .where('run_id', runId)
    .update({ ...entry, metadata: entry.metadata ? JSON.stringify(entry.metadata) : '' });

  log(`Run log completed: ${runId} - Success: ${entry.is_successful}`);
}

/**
 * Check if a synchronize run exists for a given connection ID.
 *
 * @param {ConnectionReference} conn
 * @param {string} connectionId
 * @returns {Promise<boolean>}
 */
export async function checkIfSynchronizeRunExists(conn: ConnectionReference, connectionId: string): Promise<boolean> {
  const knex = conn.connection;

  const result = await knex(TABLE_NAME)
    .where({ connection_id: connectionId, command_type: CommandType.SYNCHRONIZE })
    .orderBy('run_date', 'desc')
    .first();

  return !!result;
}
