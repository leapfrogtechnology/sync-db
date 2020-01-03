/**
 * Interface for oclif logger.
 */
interface OclifLogger {
  info: (message: string) => void;
  error: (input: string | Error, options: {
    code?: string | undefined;
    exit: false;
  }) => void;
}

export default OclifLogger;
