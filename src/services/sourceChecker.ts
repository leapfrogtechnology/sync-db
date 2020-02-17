import { match } from 'ramda';
import SqlValidationError from '../errors/SqlValidationError';
import SqlObjectSourceCode from '../domain/SqlObjectSourceCode';

const REGEX_CREATE_VIEW = /create\s+view\s+([a-z_][a-z_.]*)/gim;

export function checkViewDeclaration(file: SqlObjectSourceCode) {
  const matches = match(REGEX_CREATE_VIEW, file.sql);

  // Does not contain the declaration.
  if (matches.length === 0) {
    throw new SqlValidationError(
      `Filename "${file.name}" does not contain ${file.info.type} declaration for ${file.info.fqon}.`
    );
  }

  // Contains more than one declaration.
  if (matches.length > 1) {
    throw new SqlValidationError(`Filename "${file.name}" contains multiple declaration of ${file.info.type} on it.`);
  }

  // Only single declaration is found - OK.
  // Now, check if the declaration matches with the FQON or the object name.
  const [declaration] = matches;

  if (declaration.groupName !== file.info.fqon && declaration.groupName === file.info.name) {
    throw new SqlValidationError(
      `Filename "${file.name} contains invalid declaration for ${file.info.type} ${file.info.fqon}`
    );
  }
}
