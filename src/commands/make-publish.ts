import { cyan } from 'chalk';
import { Command } from '@oclif/command';

import { loadConfig } from '../config';
import { printInfo, printLine } from '../util/io';
import * as fileMakerService from '../service/fileMaker';

class MakePublish extends Command {
  static description = 'Publish migration templates files.';

  /**
   * CLI command execution handler.
   *
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    const config = await loadConfig();

    await printLine('');

    const templates = await fileMakerService.publish(config);

    for (const template of templates) {
      await printLine(cyan(`  - ${template}`));
    }

    if (templates.length) {
      await printInfo('\n Templates published successfully.\n');
    } else {
      await printLine(' Nothing to publish.\n');
    }
  }
}

export default MakePublish;
