import CommandResult from './CommandResult';

interface CommandParams<T = any> {
  onSuccess?: (result: CommandResult<T>) => Promise<any>;
  onFailed?: (result: CommandResult<T>) => Promise<any>;
}

export default CommandParams;
