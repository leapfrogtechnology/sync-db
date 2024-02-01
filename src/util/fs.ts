import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

export const mkdir = promisify(fs.mkdir);
export const readDir = promisify(fs.readdir);

/*
 * Create a temporary directory and return its path.
 *
 * @returns {Promise<string>} The path of the temporary directory.
 */
export function mkdtemp(): Promise<string> {
  return promisify(fs.mkdtemp)(`${os.tmpdir()}${path.sep}`);
}

/**
 * Create a temporary directory and return it's path. (synchronous)
 *
 * @returns {string} The path of the temporary directory.
 */
export function mkdtempSync(): string {
  return fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
}

/**
 * Read file contents.
 *
 * @param {string} filename The path to the file.
 * @returns {Promise<string>} The contents of the file.
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
 * @param {string} filename The path to the file.
 * @returns {Promise<boolean>} True if the file exists, false otherwise.
 */
export function exists(filename: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(filename, fs.constants.F_OK, err => resolve(!err));
  });
}

/**
 * Check if the directory exist.
 *
 * @param {string} pathName The path to the directory.
 * @returns {boolean} True if the directory exists, false otherwise.
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
 * @param {string} pathName The path to the directory.
 * @returns {Promise<string[]>} The list of files in the directory.
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
 * @param {string} filepath The path to the file.
 * @param {any} data The contents to write.
 * @returns {Promise<void>} A promise that resolves when the file is written.
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
 * @param {string} filepath The path to the file.
 * @returns {Promise<void>} A promise that resolves when the file is removed.
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
 * @param {string} fromPath The path of the file to copy.
 * @param {string} toPath The path to copy the file to.
 * @returns {Promise<void>} A promise that resolves when the file is copied.
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
