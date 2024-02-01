import Configuration from '../domain/Configuration';
import OperationContext from '../domain/operation/OperationContext';
import OperationResult from '../domain/operation/OperationResult';
import { dbLogger, log } from '../util/logger';
import { Promiser, runSequentially } from '../util/promise';
import { getElapsedTime } from '../util/ts';

/**
 * Execute a list of processes according to the configuration.
 *
 * @param {Promiser<T>[]} processes The list of processes to execute.
 * @param {Configuration} config The sync-db configuration.
 * @returns {Promise<T[]>} Result of the processes.
 */
export function executeProcesses<T>(processes: Promiser<T>[], config: Configuration): Promise<T[]> {
  log(`Executing ${processes.length} processes [strategy=${config.execution}]`);

  switch (config.execution) {
    case 'sequential': {
      return runSequentially(processes);
    }

    case 'parallel': {
      return Promise.all(processes.map(fn => fn()));
    }

    default: {
      throw new Error(`Execution strategy should be "sequential" or "parallel" found: "${config.execution}".`);
    }
  }
}

/**
 * Executes an operation with the provided context and function.
 *
 * @template T - The type of the operation context.
 * @param {T} context - The operation context.
 * @param {(options: { timeStart: [number, number] }) => Promise<any>} func - The function to execute.
 * @returns {Promise<OperationResult>} - A promise that resolves to the operation result.
 */
export async function executeOperation<T extends OperationContext>(
  context: T,
  func: (options: { timeStart: [number, number] }) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<OperationResult> {
  const { connectionId, params } = context;
  const logDb = dbLogger(connectionId);
  const result: OperationResult = { connectionId, data: null, success: false, timeElapsed: 0 };

  const timeStart = process.hrtime();

  // Trigger onStarted handler if bound.
  if (params.onStarted) {
    params.onStarted({
      connectionId,
      data: null,
      success: false,
      timeElapsed: getElapsedTime(timeStart)
    });
  }

  try {
    result.data = await func({ timeStart });

    result.success = true;
  } catch (error) {
    logDb(`Error caught for connection ${connectionId}:`);

    result.error = error;
  }

  result.timeElapsed = getElapsedTime(timeStart);

  logDb(`Execution completed in ${result.timeElapsed} s`);

  // Invoke corresponding handlers if they're sent.
  if (result.success && params.onSuccess) {
    params.onSuccess(result);
  } else if (!result.success && params.onFailed) {
    params.onFailed(result);
  }

  if (result.error) {
    logDb('Result:\n%O', result);

    throw result;
  }

  return result;
}
