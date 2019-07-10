import * as fs from 'fs';

/**
 * Read file contents.
 *
 * @param {string} filename
 * @returns {Promise<string>}
 */
export function read(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data.toString());
    });
  });
}

/**
 * Check if the file exists.
 *
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
export function exists(filename: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(filename, fs.constants.F_OK, err => resolve(!!err));
  });
}

/**
 * Read all files in a directory.
 *
 * @param {string} pathName
 * @returns {Promise<string[]>}
 */
export function glob(pathName: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(pathName, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}
