import { green, red } from 'chalk';

export type ModifierFunc = (message: string) => string;

/**
 * Prints a line into the console (stdout).
 *
 * @param {string} [message='']
 * @param {ModifierFunc} [modifier=(str: string) => str]
 * @returns {Promise<any>}
 */
export function printLine(message: string = '', modifier: ModifierFunc = (str: string) => str): Promise<any> {
  return print(modifier(message.toString()) + '\n');
}

/**
 * Print an info line on the console (in green color).
 *
 * @param {string} [message='']
 * @returns {Promise<any>}
 */
export function printInfo(message: string = ''): Promise<any> {
  return printLine(message, green);
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
