import * as fs from 'fs';
import * as path from 'path';
import { expect, assert } from 'chai';
import { it, describe } from 'mocha';

import { write, read, remove, exists, mkdtemp, glob, existsDir, validateScriptFileName } from '../../../src/util/fs';

describe('UTIL: fs', () => {
  let filePath: string;
  let invalidFilePath: string;

  const fileContent = 'this is random text content';

  beforeEach(async () => {
    const dirPath = await mkdtemp();

    filePath = `${dirPath}/hello.txt`;
    invalidFilePath = `${dirPath}/file.txt/random`;

    await write(filePath, fileContent);
  });

  describe('write', () => {
    it('should write content to the filepath', async () => {
      await write(filePath, fileContent);

      const res = await read(filePath);

      expect(res).to.equal(fileContent);
    });

    it('should throw error if filepath is invalid (fs.write)', () => {
      return expect(write(invalidFilePath, fileContent)).to.eventually.rejected;
    });
  });

  describe('read', () => {
    it('should read the content from the filepath', async () => {
      const res = await read(filePath);

      expect(res).to.equal(fileContent);
    });

    it('should throw error if filepath is invalid (fs.read)', () => {
      return expect(read(invalidFilePath)).to.eventually.rejected;
    });
  });

  describe('exists', () => {
    it('should return true if file exits in given file path', async () => {
      const res = await exists(filePath);

      expect(res).to.equal(true);
    });

    it('should return false if file does not exits in given file path', async () => {
      const res = await exists('foo/bar');

      expect(res).to.equal(false);
    });
  });

  describe('existsDir', () => {
    it('should return true if directory of given file path exist', async () => {
      const dirPath = await mkdtemp();

      const res = await existsDir(dirPath);

      expect(res).to.equal(true);
    });

    it('should return false if directory does not exits in given file path', async () => {
      const res = await existsDir('foo/bar');

      expect(res).to.equal(false);
    });
  });

  describe('remove', () => {
    it('should remove the file', async () => {
      await remove(filePath);

      fs.stat(filePath, err => {
        expect(err && err.code).to.be.equal('ENOENT');
      });
    });

    it('should throw an error if no such file or directory to remove', () => {
      return expect(remove(invalidFilePath)).to.eventually.rejected;
    });
  });

  describe('glob', async () => {
    it('should return the list of all the files under the directory.', async () => {
      const tmp1 = await mkdtemp();

      await Promise.all([
        write(path.join(tmp1, 'file1.txt'), 'Hello World!'),
        write(path.join(tmp1, 'file2.txt'), 'Hello World!'),
        write(path.join(tmp1, 'file3.txt'), 'Hello World!'),
        write(path.join(tmp1, 'file4.txt'), 'Hello World!'),
        write(path.join(tmp1, 'file5.txt'), 'Hello World!')
      ]);

      const result = await glob(tmp1);

      expect(result).to.deep.equal(['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt']);
    });

    it('should return empty array if the directory being globbed is empty.', async () => {
      const tmp2 = await mkdtemp();
      const result = await glob(tmp2);

      expect(result).to.deep.equal([]);
    });
  });

  describe('validateScriptFileName', () => {
    it('should throw error for invalid file name', async () => {
      return expect(() => validateScriptFileName('test')).to.throw('Invalid file name or extension');
    });

    it('should support only JS/TS or SQL script', () => {
      const fname0 = validateScriptFileName('test.sql');
      const fname1 = validateScriptFileName('test.js');
      const fname2 = validateScriptFileName('test.ts');

      assert(fname0 === 'test.sql');
      assert(fname1 === 'test.js');
      assert(fname2 === 'test.ts');

      expect(() => validateScriptFileName('test.c')).to.throw('Invalid file name or extension');
    });

    it('should return filename if validation is successfull', () => {
      const fname = validateScriptFileName('test.sql');

      return expect(fname).to.eq('test.sql');
    });
  });
});
