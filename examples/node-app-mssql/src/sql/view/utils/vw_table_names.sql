--
-- View to fetch table names in the database.
--
CREATE VIEW [utils].vw_table_names
AS (
  SELECT t.name
  FROM sys.tables t
);
