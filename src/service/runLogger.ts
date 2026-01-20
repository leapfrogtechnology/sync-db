import { Knex } from 'knex';
import * as crypto from 'crypto';
import { log } from '../util/logger';

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
 * @param {Knex} knex
 * @param {Partial<RunLogEntry>} entry
 * @returns {Promise<string>} runId
 */
export async function startRunLog(knex: Knex, entry: Partial<RunLogEntry>): Promise<string> {
  await ensureRunLogsTable(knex);

  const runId = generateRunId();
  const logEntry: Partial<RunLogEntry> = {
    run_id: runId,
    run_date: new Date(),
    is_successful: false,
    ...entry
  };

  await knex(TABLE_NAME).insert(logEntry);

  log(`Run log started: ${runId} for command: ${entry.command_type}`);

  return runId;
}

/**
 * Complete a run log entry with success status.
 *
 * @param {Knex} knex
 * @param {string} runId
 * @param {Partial<RunLogEntry>} entry
 * @returns {Promise<void>}
 */
export async function completeRunLog(knex: Knex, runId: string, entry: Partial<RunLogEntry>): Promise<void> {
  await knex(TABLE_NAME).where('run_id', runId).update(entry);

  log(`Run log completed: ${runId} - Success: ${entry.is_successful}`);
}
