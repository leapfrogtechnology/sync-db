import CommandParams from './CommandParams';
import CommandResult from './CommandResult';

/**
 * Synchronize parameters.
 */
interface SynchronizeParams extends CommandParams {
  force: boolean;
  'skip-migration': boolean;
  onStarted?: (result: CommandResult) => Promise<any>;
  onTeardownSuccess?: (result: CommandResult) => Promise<any>;
  onMigrationSuccess?: (result: CommandResult) => Promise<any>;
  onMigrationFailed?: (result: CommandResult) => Promise<any>;
}

export default SynchronizeParams;
