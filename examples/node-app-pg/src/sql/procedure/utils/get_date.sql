--
-- Procedure that select GETDATE function.
--
CREATE PROCEDURE utils.get_date()
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT GETDATE() AS result;
END; $$
