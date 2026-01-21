import 'mocha';
import { expect } from 'chai';

import * as runLogger from '../../../src/service/runLogger';

describe('SERVICE: runLogger', () => {
  describe('CommandType enum', () => {
    it('should have SYNCHRONIZE command type', () => {
      expect(runLogger.CommandType.SYNCHRONIZE).to.equal('synchronize');
    });

    it('should have PRUNE command type', () => {
      expect(runLogger.CommandType.PRUNE).to.equal('prune');
    });

    it('should have MIGRATE_LATEST command type', () => {
      expect(runLogger.CommandType.MIGRATE_LATEST).to.equal('migrate-latest');
    });

    it('should have MIGRATE_ROLLBACK command type', () => {
      expect(runLogger.CommandType.MIGRATE_ROLLBACK).to.equal('migrate-rollback');
    });

    it('should have MIGRATE_LIST command type', () => {
      expect(runLogger.CommandType.MIGRATE_LIST).to.equal('migrate-list');
    });
  });

  describe('ensureRunLogsTable', () => {
    it('should create table when it does not exist', async () => {
      let tableCreated = false;
      const mockKnex = {
        schema: {
          hasTable: async () => false,
          createTable: async (tableName: string, callback: any) => {
            tableCreated = true;
            expect(tableName).to.equal('__sync_db_run_logs');
            const mockTable = {
              string: () => mockTable,
              timestamp: () => mockTable,
              datetime: () => mockTable,
              boolean: () => mockTable,
              text: () => mockTable,
              json: () => mockTable,
              jsonb: () => mockTable,
              primary: () => mockTable,
              notNullable: () => mockTable,
              nullable: () => mockTable,
              defaultTo: () => mockTable,
              index: () => mockTable
            };
            callback(mockTable);
          }
        },
        fn: {
          now: () => 'CURRENT_TIMESTAMP'
        }
      } as any;

      await runLogger.ensureRunLogsTable(mockKnex);

      expect(tableCreated).to.equal(true);
    });

    it('should not create table when it already exists', async () => {
      let tableCreated = false;
      const mockKnex = {
        schema: {
          hasTable: async () => true,
          createTable: async () => {
            tableCreated = true;
          }
        }
      } as any;

      await runLogger.ensureRunLogsTable(mockKnex);

      expect(tableCreated).to.equal(false);
    });
  });

  describe('startRunLog', () => {
    it('should insert a new log entry and return run_id', async () => {
      let insertedData: any;
      const mockKnex = ((tableName: string) => {
        expect(tableName).to.equal('__sync_db_run_logs');

        return {
          insert: async (data: any) => {
            insertedData = data;
          }
        };
      }) as any;

      mockKnex.schema = {
        hasTable: async () => true
      };

      const mockConn = {
        connection: mockKnex
      } as any;

      const entry = {
        command_type: runLogger.CommandType.SYNCHRONIZE,
        connection_id: 'test-db'
      };

      const runId = await runLogger.startRunLog(mockConn, entry);

      expect(runId).to.be.a('string');
      expect(runId).to.have.lengthOf(32);
      expect(insertedData.run_id).to.equal(runId);
      expect(insertedData.command_type).to.equal('synchronize');
      expect(insertedData.connection_id).to.equal('test-db');
      expect(insertedData.is_successful).to.equal(false);
    });

    it('should generate unique run IDs', async () => {
      const mockKnex = (() => ({
        insert: async () => {
          return;
        }
      })) as any;

      mockKnex.schema = {
        hasTable: async () => true
      };

      const mockConn = {
        connection: mockKnex
      } as any;

      const runId1 = await runLogger.startRunLog(mockConn, {
        command_type: runLogger.CommandType.PRUNE
      });
      const runId2 = await runLogger.startRunLog(mockConn, {
        command_type: runLogger.CommandType.PRUNE
      });

      expect(runId1).to.not.equal(runId2);
    });
  });

  describe('completeRunLog', () => {
    it('should update log entry with success status', async () => {
      let updatedData: any;
      let whereColumn = '';
      let whereValue = '';
      const mockWhere = {
        update: async (data: any) => {
          updatedData = data;
        }
      };
      const mockKnex = ((tableName: string) => {
        expect(tableName).to.equal('__sync_db_run_logs');

        return {
          where: (column: string, value: string) => {
            whereColumn = column;
            whereValue = value;

            return mockWhere;
          }
        };
      }) as any;

      const mockConn = {
        connection: mockKnex
      } as any;

      await runLogger.completeRunLog(mockConn, 'test-run-id', {
        is_successful: true,
        metadata: { files: 10 }
      });

      expect(whereColumn).to.equal('run_id');
      expect(whereValue).to.equal('test-run-id');
      expect(updatedData.is_successful).to.equal(true);
      expect(JSON.stringify(updatedData.metadata)).to.equal(JSON.stringify({ files: 10 }));
    });

    it('should update log entry with error information', async () => {
      let updatedData: any;
      const mockKnex = (() => ({
        where: () => ({
          update: async (data: any) => {
            updatedData = data;
          }
        })
      })) as any;

      const mockConn = {
        connection: mockKnex
      } as any;

      await runLogger.completeRunLog(mockConn, 'error-run-id', {
        is_successful: false,
        error: 'Database connection failed'
      });

      expect(updatedData.is_successful).to.equal(false);
      expect(updatedData.error).to.equal('Database connection failed');
    });
  });
});
