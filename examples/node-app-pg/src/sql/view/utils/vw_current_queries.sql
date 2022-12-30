--
-- View to fetch the list of current queries executed by users who are connected to the database
-- This view is written to display the purpose of `.drop` terminator in the config file. Since, in the config file,
-- `.drop` is appended to this database object's name, sync-db will only attempt to drop it and never attempt to sync it.
--
CREATE VIEW utils.vw_current_queries
AS (
  SELECT datname, usename, query FROM pg_stat_activity
);
