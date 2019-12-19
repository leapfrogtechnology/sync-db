CREATE VIEW [utils].vw_user_names
As
    (
    SELECT name
    FROM sys.server_principals
);

