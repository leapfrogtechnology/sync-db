--
-- Calculate multiplication of two numbers.
--
CREATE FUNCTION [utils].calc_multiply(@a INT, @b INT) RETURNS INT
AS
BEGIN
  RETURN @a * @b;
END
