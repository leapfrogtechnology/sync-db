/**
 * Execution context for each connection.
 */
interface ExecutionContext {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
}

export default ExecutionContext;
