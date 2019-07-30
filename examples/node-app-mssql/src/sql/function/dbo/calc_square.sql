--
-- Calculate square of a number.
--
CREATE FUNCTION [dbo].calc_square(@x INT) RETURNS INT
AS
BEGIN
  RETURN @x * @x;
END
