// This script checks if the command-line argument provided is one of the available commands.
// If the command is not recognized, it prints an error message and exits the process.
import { printError } from '../util/io';

(async () => {
  const availableCommands = [
    '--help',
    'make-publish',
    'make',
    'migrate-latest',
    'migrate-list',
    'migrate-rollback',
    'prune',
    'synchronize',
    '--version'
  ];

  // Check if there are at least 3 arguments (node, script, command)
  // and if the command is not in the list of available commands
  if (process.argv.length >= 3 && !availableCommands.includes(process.argv[2])) {
    await printError(`Invalid command. Please use one of the following commands: ${availableCommands.join(', ')}`);
    // Exit the process with a status code of 1 (indicating an error)
    process.exit(1);
  }
})();

export { run } from '@oclif/command';
