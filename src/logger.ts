import * as debug from 'debug';

import Connection from './domain/Connection';

export const SYNC_DB = 'sync-db';
export const log = debug(SYNC_DB);
export const dbLogger = (db: Connection) => log.extend(db.id || db.database);
