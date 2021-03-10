--
-- Setup data.
--
DECLARE @create_admin BIT;
DECLARE @admin_email VARCHAR(100);
DECLARE @task_status VARCHAR(100);

SET @create_admin = (SELECT IIF([value] = 'true', 1, 0) FROM __sync_db_injected_config WHERE [key] = 'create_admin');
SET @admin_email = (SELECT [value] FROM __sync_db_injected_config WHERE [key] = 'admin_email');
SET @task_status = (SELECT [value] FROM __sync_db_injected_config WHERE [key] = 'task_status');

-- Setup data.
EXEC testdata.setup_data @create_admin, @admin_email, @task_status;
