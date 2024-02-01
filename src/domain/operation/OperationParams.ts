import OperationResult from './OperationResult';

interface OperationParams {
  'dry-run'?: boolean;
  onFailed?: (result: OperationResult) => void;
  onStarted?: (result: OperationResult) => void;
  onSuccess?: (result: OperationResult) => void;
  only?: string;
}

export default OperationParams;
