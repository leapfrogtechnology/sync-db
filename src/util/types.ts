export interface Ikeys {
  [key: string]: string | {
    [key: string]: boolean
  };
}

export interface Iflags {
  version: void;
  help: void;
  force: boolean;
  'generate-connections': boolean;
}

export interface Ilogger {
  info: (message: string) => void;
  error: (input: string | Error, options: {
    code?: string | undefined;
    exit: false;
  }) => void;
}
