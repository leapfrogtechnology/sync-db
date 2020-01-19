--
-- Procedure to setup data for the tables.
--
CREATE PROCEDURE [utils].setup_data(
  @create_admin BIT = 0,
  @admin_email VARCHAR(100) = NULL
)
AS
BEGIN
  -- Add general users.
  MERGE dbo.users t
    USING (
      VALUES
        ('user1@example.com', CONVERT(varchar(100), REPLACE(NEWID(), '-', ''))),
        ('user2@example.com', CONVERT(varchar(100), REPLACE(NEWID(), '-', ''))),
        ('user3@example.com', CONVERT(varchar(100), REPLACE(NEWID(), '-', ''))),
        ('user4@example.com', CONVERT(varchar(100), REPLACE(NEWID(), '-', '')))
    ) AS s(email, password) ON t.email = s.email
  WHEN NOT MATCHED BY TARGET THEN
    INSERT (email, password)
    VALUES (s.email, s.password)
  WHEN MATCHED THEN
    UPDATE
      SET
        t.email = s.email,
        t.password = s.password
  WHEN NOT MATCHED BY SOURCE THEN
    DELETE;

  -- Add admin user if needed.
  IF (@create_admin = 1)
    INSERT INTO dbo.users (email, password)
    VALUES (@admin_email, CONVERT(varchar(100), REPLACE(NEWID(), '-', '')));

END
