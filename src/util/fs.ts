import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

export const mkdir = promisify(fs.mkdir);
export const readDir = promisify(fs.readdir);

/**
 * Create a temporary directory and return it's path.
 *
 * @returns {Promise<string>}
 */
export function mkdtemp() {
  return promisify(fs.mkdtemp)(`${os.tmpdir()}${path.sep}`);
}

/**
 * Create a temporary directory and return it's path. (synchronous)
 *
 * @returns {string}
 */
export function mkdtempSync(): string {
  return fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
}

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
    fs.access(filename, fs.constants.F_OK, err => resolve(!err));
  });
}

/**
 * Check if the directory exist.
 *
 * @param {string} pathName
 * @returns {boolean}
 */
export async function existsDir(pathName: string) {
  try {
    await readDir(pathName);

    return true;
  } catch {
    return false;
  }
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

/**
 * Write contents to file.
 *
 * @param {string} filepath
 * @param {any} data
 * @returns {Promise<void>}
 */
export function write(filepath: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

/**
 * Remove the file.
 *
 * @param {string} filepath
 * @returns {Promise<void>}
 */
export function remove(filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

/**
 * Copy file.
 *
 * @param {string} fromPath
 * @param {string} toPath
 * @returns {Promise<void>}
 */
export function copy(fromPath: string, toPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.copyFile(fromPath, toPath, err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}
