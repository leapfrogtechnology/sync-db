import { log } from '../util/logger';
import Configuration from '../domain/Configuration';
import { Promiser, runSequentially } from '../util/promise';

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
