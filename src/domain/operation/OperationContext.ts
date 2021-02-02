import Configuration from '../Configuration';
import OperationParams from './OperationParams';

interface OperationContext {
  config: Configuration;
  connectionId: string;
  params: OperationParams;
}

export default OperationContext;
