import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import { loadConfig } from '../../config';
import * as fileMakerService from '../../service/fileMaker';
import { printInfo, printLine } from '../../util/io';

class MakePublish extends Command {
  static description = 'Publish migration templates files.';
  static flags = {
    config: Flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>} Promise.
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = await this.parse(MakePublish);
    const config = await loadConfig(parsedFlags.config);

    printLine();

    const { ignoredList, movedList } = await fileMakerService.publish(config);
    const movedCount = movedList.length;

    // Completed migrations.
    for (const template of movedList) {
      printLine(chalk.cyan(`   • ${template}`));
    }

    for (const template of ignoredList) {
      printLine(chalk.grey(`   - ${template} (exists)`));
    }

    movedCount ? printInfo('\n Templates published successfully.\n') : printLine('\n Nothing to publish.\n');
  }
}

export default MakePublish;
