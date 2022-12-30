--
-- View to fetch the list of server-level principals.
-- This view is written to display the purpose of `.drop` terminator in the config file. Since, in the config file,
-- `.drop` is appended to this database object's name, sync-db will only attempt to drop it and never attempt to sync it.
--
CREATE VIEW [utils].vw_principals
AS (
  SELECT name, principal_id
  FROM sys.server_principals
);
