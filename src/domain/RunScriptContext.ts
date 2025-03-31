import { Knex } from 'knex';

import { RunScriptParams } from './RunScriptParams';
import OperationContext from './operation/OperationContext';

export interface RunScriptContext extends OperationContext {
  params: RunScriptParams;
  migrateFunc: (
    trx: Knex.Transaction,
    files: string[],
    connectionId: string,
    runSQLScripts: (trx: Knex.Transaction, filteredScripts: string[]) => Promise<void>
  ) => Promise<(number | string[])[]>;
}
