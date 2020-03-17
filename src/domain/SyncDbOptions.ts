/**
 * Interface for sync-db options(flags).
 */
interface SyncDbOptions {
  version: void;
  help: void;
  force: boolean;
  'generate-connections': boolean;
  migrate: boolean;
  rollback: boolean;
  list: boolean;
}

export default SyncDbOptions;
