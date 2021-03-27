import { grey, cyan } from 'chalk';
import { Command, flags } from '@oclif/command';

import { loadConfig } from '../config';
import { printInfo, printLine } from '../util/io';
import * as fileMakerService from '../service/fileMaker';

class MakePublish extends Command {
  static description = 'Publish migration templates files.';
  static flags = {
    config: flags.string({
      char: 'c',
      description: 'Custom configuration file.'
    })
  };

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const { flags: parsedFlags } = this.parse(MakePublish);
    const config = await loadConfig(parsedFlags.config);

    await printLine();

    const { ignoredList, movedList } = await fileMakerService.publish(config);
    const movedCount = movedList.length;

    // Completed migrations.
    for (const template of movedList) {
      await printLine(cyan(`   • ${template}`));
    }

    for (const template of ignoredList) {
      await printLine(grey(`   - ${template} (exists)`));
    }

    if (movedCount) {
      await printInfo('\n Templates published successfully.\n');
    } else {
      await printLine('\n Nothing to publish.\n');
    }
  }
}

export default MakePublish;
