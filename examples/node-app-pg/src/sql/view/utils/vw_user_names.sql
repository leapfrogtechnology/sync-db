
--
-- View to fetch server login names.
--
CREATE VIEW [utils].vw_user_names
AS
    (SELECT name
    FROM sys.server_principals);
