import 'mocha';
import { expect } from 'chai';

import { extractSqlFileInfo, getDropStatement } from '../src/util/sql';
import UnsupportedObjectError from '../src/errors/UnsupportedObjectError';

describe('UTIL: sqlRunner', () => {
  describe('extractSqlFileInfo()', () => {
    it('should return the parsed sql file info from the relative path (type = function)', () => {
      expect(extractSqlFileInfo('function/test_data/test_function_name.sql')).to.deep.equal({
        name: 'test_function_name',
        fqon: 'test_data.test_function_name',
        type: 'function',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the relative path (type = procedure)', () => {
      expect(extractSqlFileInfo('procedure/test_data/test_procedure_name.sql')).to.deep.equal({
        name: 'test_procedure_name',
        fqon: 'test_data.test_procedure_name',
        type: 'procedure',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the relative path (type = view)', () => {
      expect(extractSqlFileInfo('view/test_data/test_view_name.sql')).to.deep.equal({
        name: 'test_view_name',
        fqon: 'test_data.test_view_name',
        type: 'view',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the relative path (type = schema)', () => {
      expect(extractSqlFileInfo('schema/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'schema',
        schema: undefined
      });
    });

    it('does not support absolute paths and throws error if given.', () => {
      const path1 = '/home/user/project/src/sql/procedure/test/test_data.sql';

      expect(() => extractSqlFileInfo(path1)).to.throw(
        `Path must be relative to the 'basePath'. Invalid path provided "${path1}".`
      );
    });

    it('should omit the schema if the files are defined directly under the "type" directory.', () => {
      expect(extractSqlFileInfo('view/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'view',
        schema: undefined
      });

      expect(extractSqlFileInfo('procedure/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'procedure',
        schema: undefined
      });

      expect(extractSqlFileInfo('function/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'function',
        schema: undefined
      });
    });

    it('should check the type and throw an error if the an unsupported type directory is found.', () => {
      expect(() => extractSqlFileInfo('xyz/test_data.sql')).to.throw(
        'Unsupported object type "xyz". The only supported types are: schema, view, function, procedure.'
      );
      expect(() => extractSqlFileInfo('xyz/abc/test_data.sql')).to.throw(
        'Unsupported object type "xyz". The only supported types are: schema, view, function, procedure.'
      );
      expect(() => extractSqlFileInfo('xyz/test_data.sql')).to.throw(UnsupportedObjectError);
      expect(() => extractSqlFileInfo('xyz/abc/test_data.sql')).to.throw(UnsupportedObjectError);
    });
  });

  describe('getDropStatement()', () => {
    it('should return DROP statement for a function', () => {
      expect(getDropStatement('function', 'test.hello_world')).to.equal('DROP FUNCTION IF EXISTS test.hello_world');
    });

    it('should return DROP statement for a procedure', () => {
      expect(getDropStatement('procedure', 'test.hello_world')).to.equal('DROP PROCEDURE IF EXISTS test.hello_world');
    });

    it('should return DROP statement for a schema', () => {
      expect(getDropStatement('schema', 'test.hello_world')).to.equal('DROP SCHEMA IF EXISTS test.hello_world');
    });

    it('should return DROP statement for a view', () => {
      expect(getDropStatement('view', 'test.hello_world')).to.equal('DROP VIEW IF EXISTS test.hello_world');
    });

    it('should throw an error if naming convention of the object is wrong', () => {
      expect(() => getDropStatement('views', 'test.hello_world')).to.throw(Error);
    });
  });
});
