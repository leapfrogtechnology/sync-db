import 'mocha';
import { expect } from 'chai';

import * as sqlRunner from '../../../src/service/sqlRunner';

describe('SERVICE: sqlRunner', () => {
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

    it('should throw an error if naming convention of the object is wrong', () => {
      expect(() => sqlRunner.getDropStatement('views', 'test.hello_world')).to.throw(Error);
    });
  });

  describe('extractSqlFileInfo() name sanitization', () => {
    it('should only strip the literal .sql / .drop extensions.', () => {
      expect(sqlRunner.extractSqlFileInfo('view/dbo/mysql_view.sql').name).to.equal('mysql_view');
      expect(sqlRunner.extractSqlFileInfo('view/dbo/vw_dropdown.sql.drop').name).to.equal('vw_dropdown');
    });
  });

  describe('rollbackSequentially()', () => {
    const files = ['a', 'b', 'c'].map(name => ({ name, fqon: `s.${name}`, type: 'view', schema: 's' }));
    const run = async (dialect: string) => {
      const queries: string[] = [];
      const trx: any = { client: { dialect }, raw: (sql: string) => Promise.resolve(queries.push(sql)) };

      await sqlRunner.rollbackSequentially(trx, files, 'test');

      return queries;
    };

    it('should batch the drops in reverse order for postgresql and mssql.', async () => {
      const expected = ['DROP VIEW IF EXISTS s.c;\nDROP VIEW IF EXISTS s.b;\nDROP VIEW IF EXISTS s.a'];

      expect(await run('postgresql')).to.deep.equal(expected);
      expect(await run('mssql')).to.deep.equal(expected);
    });

    it('should run one drop per query for other dialects (e.g. mysql).', async () => {
      expect(await run('mysql')).to.deep.equal([
        'DROP VIEW IF EXISTS s.c',
        'DROP VIEW IF EXISTS s.b',
        'DROP VIEW IF EXISTS s.a'
      ]);
    });
  });

  describe('toBatches()', () => {
    it('should join statements into ordered batches of the given size.', () => {
      expect(sqlRunner.toBatches(['a', 'b', 'c', 'd', 'e'], 2)).to.deep.equal(['a;\nb', 'c;\nd', 'e']);
    });

    it('should return no batches for no statements.', () => {
      expect(sqlRunner.toBatches([], 2)).to.deep.equal([]);
    });
  });
});
