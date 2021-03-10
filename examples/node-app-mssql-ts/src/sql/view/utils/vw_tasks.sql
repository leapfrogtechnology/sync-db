--
-- View to fetch tasks persisted in the database.
--
CREATE VIEW [utils].vw_tasks
AS (
  SELECT * FROM dbo.tasks
);
