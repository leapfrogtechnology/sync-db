export interface SyncDbOptions {
  version: void;
  help: void;
  force: boolean;
  'generate-connections': boolean;
}

export interface Logger {
  info: (message: string) => void;
  error: (input: string | Error, options: {
    code?: string | undefined;
    exit: false;
  }) => void;
}
