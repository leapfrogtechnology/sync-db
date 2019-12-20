export default interface OcliffLogger {
  info: (message: string) => void;
  error: (input: string | Error, options: {
    code?: string | undefined;
    exit: false;
  }) => void;
}
