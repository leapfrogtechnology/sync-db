import { log, dbLogger } from '../util/logger';
import Configuration from '../domain/Configuration';
import { Promiser, runSequentially } from '../util/promise';
import CommandContext from '../domain/CommandContext';
import CommandResult from '../domain/CommandResult';
import { getElapsedTime } from '../util/ts';

/**
 * Execute a list of processes according to the configuration.
 *
 * @param {Promiser<T>[]} processes
 * @param {Configuration} config
 * @returns {Promise<T[]>}
 */
export function executeProcesses<T>(processes: Promiser<T>[], config: Configuration): Promise<T[]> {
  log(`Executing ${processes.length} processes [strategy=${config.execution}]`);

  switch (config.execution) {
    case 'sequential':
      return runSequentially(processes);

    case 'parallel':
      return Promise.all(processes.map(fn => fn()));

    default:
      throw new Error(`Execution strategy should be "sequential" or "parallel" found: "${config.execution}".`);
  }
}

/**
 * Execute a unit operation.
 *
 * @param {T} context
 * @param {(options: any) => Promise<any>} func
 * @returns {Promise<CommandResult>}
 */
export async function executeOperation<T extends CommandContext>(
  context: T,
  func: (options: any) => Promise<any>
): Promise<CommandResult> {
  const { connectionId } = context;
  const logDb = dbLogger(connectionId);
  const result: CommandResult = { connectionId, success: false, data: null, timeElapsed: 0 };

  const timeStart = process.hrtime();

  try {
    logDb('BEGIN: operation');

    result.data = await func({ timeStart });

    logDb(`END: operation`);
    result.success = true;
  } catch (e) {
    logDb('FAILED: operation');
    logDb(`Error caught for connection ${connectionId}:`, e);
    result.error = e;
  }

  result.timeElapsed = getElapsedTime(timeStart);

  logDb(`Execution completed in ${result.timeElapsed} s`);

  // Invoke corresponding handlers if they're sent.
  if (result.success && context.params.onSuccess) {
    await context.params.onSuccess(result);
  } else if (!result.success && context.params.onFailed) {
    await context.params.onFailed(result);
  }

  return result;
}
