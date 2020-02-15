/**
 * Prints a line into the console (stdout).
 *
 * @param {string} [message='']
 */
export function printLine(message: string = '') {
  print(message.toString() + '\n');
}

/**
 * Prints a message into the console (stdout).
 *
 * @param {string} message
 */
export function print(message: string) {
  process.stdout.write(message.toString());
}

/**
 * Prints an error message with stack trace available
 * into the stderr.
 *
 * @param {Error} error
 */
export function printError(error: Error) {
  process.stderr.write((error.stack || error).toString() + '\n');
}
