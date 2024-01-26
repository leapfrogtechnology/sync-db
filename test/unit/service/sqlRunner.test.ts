import { expect } from 'chai';
import 'mocha';

import * as sqlRunner from '../../../src/service/sqlRunner';

describe('SERVICE: sqlRunner', () => {
  describe('extractSqlFileInfo()', () => {
    it('should return the parsed sql file info from the path (type = function)', () => {
      expect(sqlRunner.extractSqlFileInfo('function/test_data/test_function_name.sql')).to.deep.equal({
        fqon: 'test_data.test_function_name',
        name: 'test_function_name',
        schema: 'test_data',
        type: 'function'
      });
    });

    it('should return the parsed sql file info from the path (type = procedure)', () => {
      expect(sqlRunner.extractSqlFileInfo('procedure/test_data/test_procedure_name.sql')).to.deep.equal({
        fqon: 'test_data.test_procedure_name',
        name: 'test_procedure_name',
        schema: 'test_data',
        type: 'procedure'
      });
    });

    it('should return the parsed sql file info from the path (type = view)', () => {
      expect(sqlRunner.extractSqlFileInfo('view/test_data/test_view_name.sql')).to.deep.equal({
        fqon: 'test_data.test_view_name',
        name: 'test_view_name',
        schema: 'test_data',
        type: 'view'
      });
    });

    it('should return the parsed sql file info from the path (type = schema)', () => {
      expect(sqlRunner.extractSqlFileInfo('schema/test_data.sql')).to.deep.equal({
        fqon: 'test_data',
        name: 'test_data',
        schema: undefined,
        type: 'schema'
      });
    });
  });

  describe('getDropStatement()', () => {
    it('should return DROP statement for a function', () => {
      expect(sqlRunner.getDropStatement('function', 'test.hello_world')).to.equal(
        'DROP FUNCTION IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a procedure', () => {
      expect(sqlRunner.getDropStatement('procedure', 'test.hello_world')).to.equal(
        'DROP PROCEDURE IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a schema', () => {
      expect(sqlRunner.getDropStatement('schema', 'test.hello_world')).to.equal(
        'DROP SCHEMA IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a view', () => {
      expect(sqlRunner.getDropStatement('view', 'test.hello_world')).to.equal('DROP VIEW IF EXISTS test.hello_world');
    });

    it('should throw an error if naming convention of the object is wrong', () => {
      expect(() => sqlRunner.getDropStatement('views', 'test.hello_world')).to.throw(Error);
    });
  });
});
