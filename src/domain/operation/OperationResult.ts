interface OperationResult {
  connectionId: string;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: Error;
  success: boolean;
  timeElapsed: number;
}

export default OperationResult;
