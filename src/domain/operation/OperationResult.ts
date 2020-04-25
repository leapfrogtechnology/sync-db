interface OperationResult<T = any> {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  data: T;
  error?: any;
}

export default OperationResult;
