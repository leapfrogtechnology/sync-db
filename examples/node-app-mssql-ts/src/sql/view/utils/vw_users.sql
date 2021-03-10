--
-- View to fetch users persisted in the database.
--
CREATE VIEW [utils].vw_users
AS (
  SELECT id, email, created_at FROM users
);
