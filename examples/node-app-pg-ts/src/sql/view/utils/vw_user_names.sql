
--
-- View to fetch server login names.
--
CREATE VIEW utils.vw_user_names
AS (
  SELECT DISTINCT usename as username
  FROM pg_stat_activity WHERE usename IS NOT NULL
);
