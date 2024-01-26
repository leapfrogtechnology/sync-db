import chalk from 'chalk';

/**
 * Prints a line into the console (stdout).
 *
 * @param {string} [message=''] - The message to print. Defaults to an empty string.
 * @returns {void}
 */
export function printLine(message: string = '') {
  print(message.toString() + '\n');
}

/**
 * Print an info line on the console (in green color).
 *
 * @param {string} [message=''] - The message to print. Defaults to an empty string.
 * @returns {void}
 */
export function printInfo(message: string = '') {
  return printLine(chalk.green(message));
}

/**
 * Prints a message into the console (stdout).
 *
 * @param {string} message - The message to print.
 * @returns {void}
 */
export function print(message: string) {
  process.stdout.write(message.toString());
}

/**
 * Prints an error message with stack trace available into the stderr.
 *
 * @param {Error} error - The error to print.
 * @param {boolean} [stacktrace=true] - Whether to print the stack trace. Defaults to true.
 * @returns {void}
 */
export function printError(error: any, stacktrace: boolean = true) {
  const errorStr = stacktrace ? (error.stack || error).toString() : error.toString();

  process.stderr.write(chalk.red(errorStr) + '\n');
}
