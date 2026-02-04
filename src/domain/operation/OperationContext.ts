import Configuration from '../Configuration';
import OperationParams from './OperationParams';

interface OperationContext {
  connectionId: string;
  config: Configuration;
  params: OperationParams;
}

export default OperationContext;
