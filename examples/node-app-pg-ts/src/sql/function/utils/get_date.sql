--
-- Procedure that returns current date.
--
CREATE FUNCTION utils.get_date() RETURNS DATE
  AS 'SELECT NOW()'
  LANGUAGE SQL
  IMMUTABLE
  RETURNS NULL ON NULL INPUT;
