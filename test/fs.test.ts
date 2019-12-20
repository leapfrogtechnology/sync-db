import 'mocha';
import * as fs from 'fs';
import * as os from 'os';
import * as chai from 'chai';
import * as path from 'path';
import * as chaiAsPromised from 'chai-as-promised';

import { write, read, remove } from '../src/util/fs';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('UTIL: fs', () => {
  let filePath: string;
  let invalidFilePath: string;
  const fileContent = 'this is random text content';

  beforeEach(done => {
    fs.mkdtemp(`${os.tmpdir()}${path.sep}`, async (err, dirPath) => {
      if (err) {
        done(err);
      }

      filePath = (`${dirPath}/hello.txt`);
      invalidFilePath = (`${dirPath}/file.txt/random`);
      await write(filePath, fileContent).catch(e => done(e));
      done();
    });
  });

  it('should write content to the filepath', done => {
    write(filePath, fileContent).then(result => {
      read(filePath).then(res => {
        expect(res).to.equal(fileContent);
        done();
      });
    });
  });

  it('should read the content from the filepath', done => {
    read(filePath).then(res => {
      expect(res).to.equal(fileContent);
      done();
    });
  });

  it('should remove the file', done => {
    remove(filePath).then(() => {
      fs.stat(filePath, err => {
        expect(err && err.code).to.be.equal('ENOENT');
        done();
      });
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
