import { log } from '../logger';
import SyncConfig from '../domain/SyncConfig';
import { Promiser, runSequentially } from '../util/promise';

/**
 * Execute a list of processes according to the configuration.
 *
 * @param {Promiser<T>[]} processes
 * @param {SyncConfig} config
 * @returns {Promise<T[]>}
 */
export function executeProcesses<T>(processes: Promiser<T>[], config: SyncConfig): Promise<T[]> {
  log(`Execution Strategy: ${config.execution}`);

  switch (config.execution) {
    case 'sequential':
      return runSequentially(processes);

    case 'parallel':
      return Promise.all(processes.map(fn => fn()));

    default:
      throw new Error(`Execution strategy should be "sequential" or "parallel" found: "${config.execution}".`);
  }
}
