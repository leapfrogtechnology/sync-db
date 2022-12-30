--
-- View to fetch the list of email addresses.
-- This view is written to display the purpose of `.drop` terminator in the config file. Since, in the config file,
-- `.drop` is appended to this database object's name, sync-db will only attempt to drop it and never attempt to sync it.
--
CREATE VIEW [utils].vw_user_emails
AS (
  SELECT id, email FROM users
);
