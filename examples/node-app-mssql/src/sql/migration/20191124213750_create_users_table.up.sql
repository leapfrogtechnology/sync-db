CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY(1, 1),
  email VARCHAR(255),
  password VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);
