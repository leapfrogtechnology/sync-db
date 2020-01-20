--
-- View to fetch server login names.
--
CREATE VIEW [utils].vw_user_names
AS (
  SELECT id, email, created_at FROM users
);
