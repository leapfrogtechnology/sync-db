import FileExtensions from '../enum/FileExtensions';

interface MakeOptions {
  objectName?: string;
  migrationPath: string;
  timestamp: string;
  extension: FileExtensions;
  baseTemplatePath: string;
  create?: boolean;
}

export default MakeOptions;
