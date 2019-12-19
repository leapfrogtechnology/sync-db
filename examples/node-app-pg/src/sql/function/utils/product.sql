--
-- Calculate multiplication of two numbers.
--
CREATE FUNCTION [utils].product(@a INT, @b INT) RETURNS INT
AS
BEGIN
    RETURN @a * @b;
END
