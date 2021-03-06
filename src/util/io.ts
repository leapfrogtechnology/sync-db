import { green, red } from 'chalk';

/**
 * Prints a line into the console (stdout).
 *
 * @param {string} [message='']
 * @returns {Promise<any>}
 */
export function printLine(message: string = ''): Promise<any> {
  return print(message.toString() + '\n');
}

/**
 * Print an info line on the console (in green color).
 *
 * @param {string} [message='']
 * @returns {Promise<any>}
 */
export function printInfo(message: string = ''): Promise<any> {
  return printLine(green(message));
}

/**
 * Prints a message into the console (stdout).
 *
 * @param {string} message
 * @returns {Promise<any>}
 */
export function print(message: string): Promise<any> {
  return new Promise(resolve => process.stdout.write(message.toString(), resolve));
}

/**
 * Prints an error message with stack trace available
 * into the stderr.
 *
 * @param {any} error
 * @param {boolean} [stacktrace=true]
 * @returns {Promise<any>}
 */
export function printError(error: any, stacktrace: boolean = true): Promise<any> {
  const errorStr = stacktrace ? (error.stack || error).toString() : error.toString();

  return new Promise(resolve => process.stderr.write(red(errorStr) + '\n', resolve));
}
