import SqlCode from '../../domain/SqlCode';

interface SqlMigrationEntry {
  name: string;
  queries: {
    down?: SqlCode;
    up?: SqlCode;
  };
}

export default SqlMigrationEntry;
