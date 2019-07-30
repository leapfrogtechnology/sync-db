--
-- Procedure that exec GETDATE function.
--
CREATE PROCEDURE [utils].exec_get_date
AS
BEGIN
  SELECT GETDATE() AS result;
END
