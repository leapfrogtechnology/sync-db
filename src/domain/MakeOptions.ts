import FileExtensions from '../enum/FileExtensions';

interface MakeOptions {
  baseTemplatePath: string;
  create?: boolean;
  extension: FileExtensions;
  migrationPath: string;
  objectName?: string;
  timestamp: string;
}

export default MakeOptions;
