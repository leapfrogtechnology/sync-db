import 'mocha';
import { expect } from 'chai';

import * as sqlRunner from '../src/sqlRunner';

describe('UTIL: sqlRunner', () => {
  describe('extractSqlFileInfo()', () => {
    it('should return the parsed sql file info from the path (type = function)', () => {
      expect(sqlRunner.extractSqlFileInfo('function/test_data/test_function_name.sql')).to.deep.equal({
        name: 'test_function_name',
        fqon: 'test_data.test_function_name',
        type: 'function',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = procedure)', () => {
      expect(sqlRunner.extractSqlFileInfo('procedure/test_data/test_procedure_name.sql')).to.deep.equal({
        name: 'test_procedure_name',
        fqon: 'test_data.test_procedure_name',
        type: 'procedure',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = view)', () => {
      expect(sqlRunner.extractSqlFileInfo('view/test_data/test_view_name.sql')).to.deep.equal({
        name: 'test_view_name',
        fqon: 'test_data.test_view_name',
        type: 'view',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = schema)', () => {
      expect(sqlRunner.extractSqlFileInfo('schema/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'schema',
        schema: undefined
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
  });
});
