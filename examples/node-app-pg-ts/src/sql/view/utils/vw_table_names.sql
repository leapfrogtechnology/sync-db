--
-- View to fetch table names in the database.
--
CREATE VIEW utils.vw_table_names
AS (
  SELECT table_name AS name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
);
