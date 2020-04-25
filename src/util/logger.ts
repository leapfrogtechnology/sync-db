import * as debug from 'debug';

export const SYNC_DB = 'sync-db';
export const log = debug(SYNC_DB);
export const dbLogger = (connectionId: string) => log.extend(connectionId);
