import Configuration from '../Configuration';
import ConnectionReference from '../ConnectionReference';
import OperationParams from './OperationParams';

interface OperationContext {
  connectionId: string;
  config: Configuration;
  params: OperationParams;
  connection: ConnectionReference;
}

export default OperationContext;
