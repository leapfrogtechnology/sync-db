import OperationResult from './OperationResult';

interface OperationParams<T = any> {
  onSuccess?: (result: OperationResult<T>) => Promise<any>;
  onFailed?: (result: OperationResult<T>) => Promise<any>;
}

export default OperationParams;
