import * as debug from 'debug';

import Connection from './Connection';

export const SYNC_DB = 'sync-db';
export const log = debug(SYNC_DB);
export const dbLogger = (conn: Connection) => log.extend(conn.config.id || conn.config.database);
