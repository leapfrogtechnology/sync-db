--
-- Calculate sum of two numbers.
--
CREATE FUNCTION [dbo].calc_sum(@a INT, @b INT) RETURNS INT
AS
BEGIN
  RETURN @a + @b;
END
