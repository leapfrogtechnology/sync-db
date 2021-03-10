--
-- Procedure to setup data for the tables.
--
CREATE PROCEDURE [testdata].setup_data(
  @create_admin BIT = 0,
  @admin_email VARCHAR(100) = NULL,
  @task_status VARCHAR(100) = NULL
)
AS
BEGIN
  -- Add general users.
  MERGE dbo.users t
    USING (
      VALUES
        ('user1@example.com', CONVERT(VARCHAR(100), REPLACE(NEWID(), '-', ''))),
        ('user2@example.com', CONVERT(VARCHAR(100), REPLACE(NEWID(), '-', ''))),
        ('user3@example.com', CONVERT(VARCHAR(100), REPLACE(NEWID(), '-', ''))),
        ('user4@example.com', CONVERT(VARCHAR(100), REPLACE(NEWID(), '-', '')))
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
    VALUES (@admin_email, CONVERT(VARCHAR(100), REPLACE(NEWID(), '-', '')));

  -- Empty tasks data.
  DELETE FROM tasks;

  -- Add tasks
  INSERT INTO dbo.tasks
    (user_id, title, description, is_complete)
  SELECT
    u.id as user_id,
    t.title,
    t.description,
    t.is_complete
  FROM (
    VALUES
      ('user1@example.com', 'Task 1', 'This is task 1.', 1),
      ('user1@example.com', 'Task 2', 'This is task 2.', 0),
      ('user1@example.com', 'Task 3', 'This is task 3.', 0),
      ('user1@example.com', 'Task 4', 'This is task 4.', 0),
      ('user1@example.com', 'Task 5', 'This is task 5.', 0),
      ('user2@example.com', 'Task 6', 'This is task 6.', 0),
      ('user2@example.com', 'Task 7', 'This is task 7.', 1),
      ('user2@example.com', 'Task 8', 'This is task 8.', 0),
      ('user2@example.com', 'Task 9', 'This is task 9.', 0),
      ('user2@example.com', 'Task 10', 'This is task 10.', 1),
      ('user3@example.com', 'Task 11', 'This is task 11.', 0),
      ('user3@example.com', 'Task 12', 'This is task 12.', 0),
      ('user3@example.com', 'Task 13', 'This is task 13.', 0),
      ('user3@example.com', 'Task 14', 'This is task 14.', 0),
      ('user3@example.com', 'Task 15', 'This is task 15.', 1),
      ('user4@example.com', 'Task 16', 'This is task 16.', 0),
      ('user4@example.com', 'Task 17', 'This is task 17.', 0),
      ('user4@example.com', 'Task 18', 'This is task 18.', 0),
      ('user4@example.com', 'Task 19', 'This is task 19.', 0),
      ('user4@example.com', 'Task 20', 'This is task 20.', 0)
  ) AS t(user_email, title, description, is_complete)
  INNER JOIN dbo.users u ON u.email = t.user_email

  -- Update status according to the @task_status flag.
  IF (@task_status = 'all_complete')
    UPDATE dbo.tasks SET is_complete = 1;

  IF (@task_status = 'none_complete')
    UPDATE dbo.tasks SET is_complete = 0;

END
