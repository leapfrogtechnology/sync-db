import OperationResult from './OperationResult';

interface OperationParams<T = any> {
  only?: string;
  onSuccess?: (result: OperationResult<T>) => Promise<any>;
  onFailed?: (result: OperationResult<T>) => Promise<any>;
}

export default OperationParams;
