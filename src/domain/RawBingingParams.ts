import { Knex } from 'knex';

type Value = Buffer | Date | Date[] | Knex.Raw | boolean | boolean[] | number | number[] | string | string[];

type RawBindingParams = (
  | Buffer
  | Date
  | Date[]
  | Knex.QueryBuilder
  | Knex.Raw
  | boolean
  | boolean[]
  | number
  | number[]
  | string
  | string[]
)[];

export interface ValueMap {
  [key: string]: Knex.QueryBuilder | Value;
}

export default RawBindingParams;
