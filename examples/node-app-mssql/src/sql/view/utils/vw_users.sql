--
-- View to fetch server login names.
--
CREATE VIEW [utils].vw_users
AS (
  SELECT id, email, created_at FROM users
);
