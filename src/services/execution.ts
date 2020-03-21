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
  log(`Execution Strategy: ${config.executionStrategy}`);

  switch (config.executionStrategy) {
    case 'sequential':
      return runSequentially(processes);

    case 'parallel':
      return Promise.all(processes.map(fn => fn()));

    default:
      throw new Error(`Invalid executionStrategy found in the configuration "${config.executionStrategy}".`);
  }
}
