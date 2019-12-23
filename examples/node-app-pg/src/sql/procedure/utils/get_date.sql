--
-- Procedure that select GETDATE function.
--
CREATE PROCEDURE [utils].get_date
AS
BEGIN
    SELECT GETDATE() AS result;
END
