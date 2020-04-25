import SqlCode from '../SqlCode';

interface SqlMigrationEntry {
  name: string;
  queries: {
    up?: SqlCode;
    down?: SqlCode;
  };
}

export default SqlMigrationEntry;
