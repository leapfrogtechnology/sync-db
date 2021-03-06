import OperationResult from './OperationResult';

interface OperationParams<T = any> {
  only?: string;
  'dry-run'?: boolean;
  onStarted?: (result: OperationResult<T>) => Promise<any>;
  onSuccess?: (result: OperationResult<T>) => Promise<any>;
  onFailed?: (result: OperationResult<T>) => Promise<any>;
}

export default OperationParams;
