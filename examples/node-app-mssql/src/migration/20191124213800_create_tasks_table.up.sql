CREATE TABLE tasks (
  id INT PRIMARY KEY IDENTITY(1, 1),
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  is_complete BIT NOT NULL DEFAULT(0),
  created_at DATETIME,
  updated_at DATETIME
);
