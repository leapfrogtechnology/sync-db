import { log } from '../logger';
import { resolveFiles } from '../util/sql';
import SyncConfig from '../domain/SyncConfig';
import SourceTree from '../domain/SourceTree';

/**
 * Resolve source code from the filesystem using the configuration.
 *
 * @param {SyncConfig} config
 * @returns {Promise<SourceTree>}
 */
export async function resolveSourceCode(config: SyncConfig): Promise<SourceTree> {
  log(`Resolving source files. (basePath = ${config.basePath})`);

  // Resolve all the source files from the file system.
  const sql = await resolveFiles(config.basePath, config.sql);
  const preSync = await resolveFiles(config.basePath, config.hooks.pre_sync);
  const postSync = await resolveFiles(config.basePath, config.hooks.post_sync);

  log('Finished loading source files.');

  return {
    sql,
    hooks: {
      preSync,
      postSync
    }
  };
}
