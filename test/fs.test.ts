import 'mocha';
import * as path from 'path';
import { expect } from 'chai';

import * as fs from '../src/util/fs';

describe('UTIL: fs', () => {

  const filePath = path.resolve(__dirname, 'hello.txt');
  const invalidFilePath = path.resolve(__dirname, 'fake_file.txt/random');
  const fileContent = 'hello@123';

  const rejectionCallback = (error: { errno: any; code: any; syscall: any; }) => {
    expect(error.errno).to.equal(-2);
    expect(error.code).to.equal('ENOENT');
    expect(error.syscall).to.equal('open');
  };

  it('should write content to the filepath', done => {
    fs.write(filePath, fileContent).then(result => {
      expect(result).to.equal(undefined);
      done();
    });
  });

  it('should read the content from the filepath', done => {
    fs.read(filePath).then(res => {
      expect(res).to.equal(fileContent);
      done();
    });
  });

  it('should remove the file', done => {
    fs.remove(filePath).then(res => {
      expect(res).to.equal(`${filePath} was removed`);
      done();
    });
  });

  it('should throw error if filepath is invalid (fs.write)', done => {
    fs.write(invalidFilePath, fileContent)
      .catch(e => {
        rejectionCallback(e);
        done();
      });
  });

  it('should throw error if filepath is invalid (fs.read)', done => {
    fs.read(invalidFilePath)
      .catch(e => {
        rejectionCallback(e);
        done();
      });
  });

  it('should throw an error if no such file or directory', done => {
    fs.remove(invalidFilePath)
      .catch(error => {
        expect(error.errno).to.equal(-2);
        expect(error.code).to.equal('ENOENT');
        expect(error.syscall).to.equal('unlink');
        done();
      });
  });
});
