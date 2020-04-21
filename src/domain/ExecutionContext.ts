/**
 * Execution context for each connection.
 */
interface ExecutionContext {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  error?: any;
}

export default ExecutionContext;
