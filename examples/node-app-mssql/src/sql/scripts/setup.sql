--
-- Setup data.
--
DECLARE @create_admin BIT;
DECLARE @admin_email VARCHAR(100);

SET @create_admin = (SELECT IIF([value] = 'true', 1, 0) FROM __injected_config WHERE [key] = 'create_admin');
SET @admin_email = (SELECT [value] FROM __injected_config WHERE [key] = 'admin_email');

-- Setup data.
EXEC testdata.setup_users @create_admin, @admin_email;
