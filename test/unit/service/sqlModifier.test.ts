import 'mocha';
import { expect } from 'chai';

import * as sqlModifier from '../../../src/util/string';

describe('SERVICE: sqlModifier', () => {
  describe('convertToCreateOrReplace', () => {
    describe('PostgreSQL (default)', () => {
      it('should convert CREATE VIEW to CREATE OR REPLACE VIEW', () => {
        const sql = 'CREATE VIEW my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'pg');

        expect(result).to.equal('CREATE OR REPLACE VIEW my_view AS SELECT * FROM table1;');
      });

      it('should convert CREATE FUNCTION to CREATE OR REPLACE FUNCTION', () => {
        const sql = 'CREATE FUNCTION my_func() RETURNS INT AS BEGIN RETURN 1; END;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'pg');

        expect(result).to.equal('CREATE OR REPLACE FUNCTION my_func() RETURNS INT AS BEGIN RETURN 1; END;');
      });

      it('should convert CREATE PROCEDURE to CREATE OR REPLACE PROCEDURE', () => {
        const sql = 'CREATE PROCEDURE my_proc AS BEGIN SELECT 1; END;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'pg');

        expect(result).to.equal('CREATE OR REPLACE PROCEDURE my_proc AS BEGIN SELECT 1; END;');
      });

      it('should use CREATE OR REPLACE when no dbClient specified', () => {
        const sql = 'CREATE VIEW my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE OR REPLACE VIEW my_view AS SELECT * FROM table1;');
      });
    });

    describe('MSSQL', () => {
      it('should convert CREATE VIEW to CREATE OR ALTER VIEW for MSSQL', () => {
        const sql = 'CREATE VIEW my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'mssql');

        expect(result).to.equal('CREATE OR ALTER VIEW my_view AS SELECT * FROM table1;');
      });

      it('should convert CREATE FUNCTION to CREATE OR ALTER FUNCTION for MSSQL', () => {
        const sql = 'CREATE FUNCTION my_func() RETURNS INT AS BEGIN RETURN 1; END;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'mssql');

        expect(result).to.equal('CREATE OR ALTER FUNCTION my_func() RETURNS INT AS BEGIN RETURN 1; END;');
      });

      it('should convert CREATE PROCEDURE to CREATE OR ALTER PROCEDURE for MSSQL', () => {
        const sql = 'CREATE PROCEDURE my_proc AS BEGIN SELECT 1; END;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'mssql');

        expect(result).to.equal('CREATE OR ALTER PROCEDURE my_proc AS BEGIN SELECT 1; END;');
      });

      it('should handle tedious client name for MSSQL', () => {
        const sql = 'CREATE FUNCTION my_func() RETURNS INT;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'tedious');

        expect(result).to.equal('CREATE OR ALTER FUNCTION my_func() RETURNS INT;');
      });
    });

    describe('Common behavior', () => {
      it('should handle CREATE with case insensitivity', () => {
        const sql = 'create view my_view as select * from table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE OR REPLACE VIEW my_view as select * from table1;');
      });

      it('should handle mixed case CREATE statements', () => {
        const sql = 'CrEaTe FuNcTiOn my_func() RETURNS INT;';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE OR REPLACE FUNCTION my_func() RETURNS INT;');
      });

      it('should not modify CREATE OR REPLACE if already present', () => {
        const sql = 'CREATE OR REPLACE VIEW my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE OR REPLACE VIEW my_view AS SELECT * FROM table1;');
      });

      it('should not modify CREATE OR ALTER if already present for MSSQL', () => {
        const sql = 'CREATE OR ALTER VIEW my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql, 'mssql');

        expect(result).to.equal('CREATE OR ALTER VIEW my_view AS SELECT * FROM table1;');
      });

      it('should handle multiple CREATE statements in one SQL', () => {
        const sql = `
        CREATE VIEW view1 AS SELECT * FROM t1;
        CREATE FUNCTION func1() RETURNS INT AS BEGIN RETURN 1; END;
        CREATE PROCEDURE proc1 AS BEGIN SELECT 1; END;
      `;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE VIEW view1');
        expect(result).to.include('CREATE OR REPLACE FUNCTION func1()');
        expect(result).to.include('CREATE OR REPLACE PROCEDURE proc1');
      });

      it('should handle multiple CREATE statements for MSSQL', () => {
        const sql = `
        CREATE VIEW view1 AS SELECT * FROM t1;
        CREATE FUNCTION func1() RETURNS INT AS BEGIN RETURN 1; END;
        CREATE PROCEDURE proc1 AS BEGIN SELECT 1; END;
      `;
        const result = sqlModifier.convertToCreateOrReplace(sql, 'mssql');

        expect(result).to.include('CREATE OR ALTER VIEW view1');
        expect(result).to.include('CREATE OR ALTER FUNCTION func1()');
        expect(result).to.include('CREATE OR ALTER PROCEDURE proc1');
      });

      it('should handle CREATE with extra whitespace', () => {
        const sql = 'CREATE    VIEW   my_view AS SELECT * FROM table1;';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE OR REPLACE VIEW   my_view AS SELECT * FROM table1;');
      });

      it('should handle CREATE with newlines', () => {
        const sql = `CREATE
VIEW my_view AS SELECT * FROM table1;`;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE VIEW');
      });

      it('should not modify CREATE TABLE statements', () => {
        const sql = 'CREATE TABLE my_table (id INT PRIMARY KEY);';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE TABLE my_table (id INT PRIMARY KEY);');
      });

      it('should not modify CREATE INDEX statements', () => {
        const sql = 'CREATE INDEX idx_name ON table1 (column1);';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('CREATE INDEX idx_name ON table1 (column1);');
      });

      it('should handle empty string', () => {
        const sql = '';
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.equal('');
      });

      it('should handle null or undefined', () => {
        const result1 = sqlModifier.convertToCreateOrReplace(null as any);
        const result2 = sqlModifier.convertToCreateOrReplace(undefined as any);

        expect(result1).to.equal(null);
        expect(result2).to.equal(undefined);
      });

      it('should handle SQL with comments', () => {
        const sql = `
        -- This creates a view
        CREATE VIEW my_view AS SELECT * FROM table1;
      `;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE VIEW');
      });

      it('should handle complex view definition', () => {
        const sql = `CREATE VIEW user_summary AS
        SELECT u.id, u.name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.name;`;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE VIEW user_summary');
        expect(result).to.include('FROM users u');
      });

      it('should handle function with parameters', () => {
        const sql = `CREATE FUNCTION calculate_tax(amount DECIMAL, rate DECIMAL)
        RETURNS DECIMAL
        AS BEGIN
          RETURN amount * rate;
        END;`;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE FUNCTION calculate_tax');
      });

      it('should preserve SQL structure and formatting', () => {
        const sql = `CREATE VIEW my_view AS
  SELECT
    id,
    name,
    email
  FROM
    users
  WHERE
    active = 1;`;
        const result = sqlModifier.convertToCreateOrReplace(sql);

        expect(result).to.include('CREATE OR REPLACE VIEW');
        expect(result).to.include('  SELECT');
        expect(result).to.include('    id,');
      });
    });
  });
});
