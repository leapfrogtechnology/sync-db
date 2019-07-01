import 'mocha';
import { expect } from 'chai';

import * as sqlRunner from '../src/sqlRunner';

describe('UTIL: sqlRunner', () => {
  describe('extractSqlFileInfo()', () => {
    it('should return the parsed sql file info from the path (type = functions)', () => {
      expect(sqlRunner.extractSqlFileInfo('functions/test_data/test_function_name.sql')).to.deep.equal({
        name: 'test_function_name',
        fqon: 'test_data.test_function_name',
        type: 'functions',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = procedures)', () => {
      expect(sqlRunner.extractSqlFileInfo('procedures/test_data/test_procedure_name.sql')).to.deep.equal({
        name: 'test_procedure_name',
        fqon: 'test_data.test_procedure_name',
        type: 'procedures',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = views)', () => {
      expect(sqlRunner.extractSqlFileInfo('views/test_data/test_view_name.sql')).to.deep.equal({
        name: 'test_view_name',
        fqon: 'test_data.test_view_name',
        type: 'views',
        schema: 'test_data'
      });
    });

    it('should return the parsed sql file info from the path (type = schemas)', () => {
      expect(sqlRunner.extractSqlFileInfo('schemas/test_data.sql')).to.deep.equal({
        name: 'test_data',
        fqon: 'test_data',
        type: 'schemas',
        schema: undefined
      });
    });
  });

  describe('getDropStatement()', () => {
    it('should return DROP statement for a function', () => {
      expect(sqlRunner.getDropStatement('functions', 'test.hello_world')).to.equal(
        'DROP FUNCTION IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a procedure', () => {
      expect(sqlRunner.getDropStatement('procedures', 'test.hello_world')).to.equal(
        'DROP PROCEDURE IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a schema', () => {
      expect(sqlRunner.getDropStatement('schemas', 'test.hello_world')).to.equal(
        'DROP SCHEMA IF EXISTS test.hello_world'
      );
    });

    it('should return DROP statement for a view', () => {
      expect(sqlRunner.getDropStatement('views', 'test.hello_world')).to.equal('DROP VIEW IF EXISTS test.hello_world');
    });
  });
});
