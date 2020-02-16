import { log } from '../logger';
import SqlCode from '../domain/SqlCode';
import SyncConfig from '../domain/SyncConfig';
import SourceTree from '../domain/SourceTree';
import SqlObjectSourceCode from '../domain/SqlObjectSourceCode';
import { resolveFiles, resolveSourceFile, resolveFile } from '../util/sql';

/**
 * Resolve source code from the filesystem using the configuration.
 *
 * @param {SyncConfig} config
 * @returns {Promise<SourceTree>}
 */
export async function resolveSourceCode(config: SyncConfig): Promise<SourceTree> {
  const { basePath, hooks } = config;

  log(`Resolving source files. (basePath = ${basePath})`);

  // Resolve all the source files from the file system.
  const sql = await resolveFiles<SqlObjectSourceCode>(basePath, config.sql, resolveSourceFile);
  const preSync = await resolveFiles<SqlCode>(basePath, hooks.pre_sync, resolveFile);
  const postSync = await resolveFiles<SqlCode>(basePath, hooks.post_sync, resolveFile);

  log('Finished loading source files.');

  return {
    sql,
    hooks: {
      preSync,
      postSync
    }
  };
}
