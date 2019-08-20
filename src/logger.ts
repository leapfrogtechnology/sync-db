import * as debug from 'debug';

import ConnectionConfig from './domain/ConnectionConfig';

export const SYNC_DB = 'sync-db';
export const log = debug(SYNC_DB);
export const dbLogger = (db: ConnectionConfig) => log.extend(db.id || db.database);
