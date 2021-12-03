import { getElapsedTime } from '../util/ts';
import { log, dbLogger } from '../util/logger';
import Configuration from '../domain/Configuration';
import { Promiser, runSequentially } from '../util/promise';
import OperationResult from '../domain/operation/OperationResult';
import OperationContext from '../domain/operation/OperationContext';

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
 * @returns {Promise<OperationResult>}
 */
export async function executeOperation<T extends OperationContext>(
  context: T,
  func: (options: any) => Promise<any>
): Promise<OperationResult> {
  const { connectionId } = context;
  const logDb = dbLogger(connectionId);
  const result: OperationResult = { connectionId, success: false, data: null, timeElapsed: 0 };

  const timeStart = process.hrtime();

  // Trigger onStarted handler if bound.
  if (context.params.onStarted) {
    await context.params.onStarted({
      connectionId,
      success: false,
      data: null,
      timeElapsed: getElapsedTime(timeStart)
    });
  }

  try {
    result.data = await func({ timeStart });

    result.success = true;
  } catch (e) {
    logDb(`Error caught for connection ${connectionId}:`);

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

  if (result.error) {
    logDb('Result:\n%O', result);

    throw result;
  }

  return result;
}
