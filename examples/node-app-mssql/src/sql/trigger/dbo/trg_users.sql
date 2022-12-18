CREATE TRIGGER dbo.trg_users
  ON dbo.users
FOR DELETE
AS
  BEGIN
    DECLARE @deleted_record_count INT = (SELECT COUNT(*) FROM deleted);

    PRINT CAST(@deleted_record_count AS VARCHAR(500)) + 'records deleted.';
  END;
