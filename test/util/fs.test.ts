import * as fs from 'fs';
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { write, read, remove, exists, mkdtemp } from '../../src/util/fs';

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

  it('should write content to the filepath', async () => {
    await write(filePath, fileContent);

    const res = await read(filePath);

    expect(res).to.equal(fileContent);
  });

  it('should read the content from the filepath', async () => {
    const res = await read(filePath);

    expect(res).to.equal(fileContent);
  });

  it('should return true if file exits in given file path', async () => {
    const res = await exists(filePath);

    expect(res).to.equal(true);
  });

  it('should return false if file does not exits in given file path', async () => {
    const res = await exists('foo/bar');

    expect(res).to.equal(false);
  });

  it('should remove the file', async () => {
    await remove(filePath);

    fs.stat(filePath, err => {
      expect(err && err.code).to.be.equal('ENOENT');
    });
  });

  it('should throw error if filepath is invalid (fs.write)', () => {
    return expect(write(invalidFilePath, fileContent)).to.eventually.rejected;
  });

  it('should throw error if filepath is invalid (fs.read)', () => {
    return expect(read(invalidFilePath)).to.eventually.rejected;
  });

  it('should throw an error if no such file or directory to remove', () => {
    return expect(remove(invalidFilePath)).to.eventually.rejected;
  });
});
