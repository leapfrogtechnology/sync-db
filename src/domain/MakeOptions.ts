import FileExtensions from '../enum/FileExtensions';

interface MakeOptions {
  objectName?: string;
  migrationPath: string;
  timestamp: string;
  extension: FileExtensions;
  stubPath: string | null;
}

export default MakeOptions;