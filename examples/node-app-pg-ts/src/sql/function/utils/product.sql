--
-- Calculate multiplication of two numbers.
--
CREATE FUNCTION utils.product(INTEGER, INTEGER) RETURNS INTEGER
 AS 'SELECT $1 * $2;'
    LANGUAGE SQL
    IMMUTABLE
    RETURNS NULL ON NULL INPUT;
