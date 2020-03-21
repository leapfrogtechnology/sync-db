import * as Knex from 'knex';

type Value = Date | string | number | boolean | Date[] | string[] | number[] | boolean[] | Buffer | Knex.Raw;

type RawBindingParams = (
  | Date
  | Buffer
  | string
  | number
  | Date[]
  | boolean
  | Knex.Raw
  | string[]
  | number[]
  | boolean[]
  | Knex.QueryBuilder
)[];

export interface ValueMap {
  [key: string]: Value | Knex.QueryBuilder;
}

export default RawBindingParams;
