import 'mocha';
import { expect } from 'chai';

import SynchronizeParams from '../../../src/domain/SynchronizeParams';

describe('SERVICE: sync - sync-files logic', () => {
  describe('sync-files parameter filtering', () => {
    it('should filter sync files to only include available files from config', () => {
      const syncFiles = ['function/schema/test_func.sql', 'function/schema/non_existent.sql'];
      const availableSql = ['function/schema/test_func.sql', 'view/schema/test_view.sql'];

      const filesToSync = syncFiles.filter(file => availableSql.includes(file) && !file.includes('.drop'));

      void expect(filesToSync).to.deep.equal(['function/schema/test_func.sql']);
    });

    it('should exclude .drop files from sync-files list', () => {
      const syncFiles = ['function/schema/test_func.sql', 'function/schema/test_func.drop.sql'];
      const availableSql = [
        'function/schema/test_func.sql',
        'function/schema/test_func.drop.sql',
        'view/schema/test_view.sql'
      ];

      const filesToSync = syncFiles.filter(file => availableSql.includes(file) && !file.includes('.drop'));

      void expect(filesToSync).to.deep.equal(['function/schema/test_func.sql']);
    });

    it('should handle multiple valid files in sync-files', () => {
      const syncFiles = ['function/schema/func1.sql', 'function/schema/func2.sql', 'view/schema/view1.sql'];
      const availableSql = [...syncFiles, 'procedure/schema/proc1.sql'];

      const filesToSync = syncFiles.filter(file => availableSql.includes(file) && !file.includes('.drop'));

      void expect(filesToSync).to.deep.equal(syncFiles);
    });

    it('should return empty array when sync-files is empty', () => {
      const syncFiles: string[] = [];
      const availableSql = ['function/schema/test_func.sql', 'view/schema/test_view.sql'];

      const filesToSync = syncFiles.filter(file => availableSql.includes(file) && !file.includes('.drop'));

      void expect(filesToSync).to.be.an('array').that.is.empty;
    });

    it('should return empty array when no files match available config', () => {
      const syncFiles = ['function/schema/non_existent1.sql', 'function/schema/non_existent2.sql'];
      const availableSql = ['function/schema/test_func.sql', 'view/schema/test_view.sql'];

      const filesToSync = syncFiles.filter(file => availableSql.includes(file) && !file.includes('.drop'));

      void expect(filesToSync).to.be.an('array').that.is.empty;
    });
  });

  describe('isPartialSync detection', () => {
    it('should detect partial sync when sync-files property exists', () => {
      const params: SynchronizeParams = {
        force: false,
        'skip-migration': false,
        'sync-files': ['function/schema/test_func.sql']
      };

      const isPartialSync = params.hasOwnProperty('sync-files');

      void expect(isPartialSync).to.be.true;
    });

    it('should not detect partial sync when sync-files property does not exist', () => {
      const params: SynchronizeParams = {
        force: false,
        'skip-migration': false
      };

      const isPartialSync = params.hasOwnProperty('sync-files');

      void expect(isPartialSync).to.be.false;
    });

    it('should detect partial sync even when sync-files is empty array', () => {
      const params: SynchronizeParams = {
        force: false,
        'skip-migration': false,
        'sync-files': []
      };

      const isPartialSync = params.hasOwnProperty('sync-files');

      void expect(isPartialSync).to.be.true;
    });
  });
});
