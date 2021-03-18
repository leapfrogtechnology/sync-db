import { loadConfig } from '../config';
import { Command } from '@oclif/command';

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

    await fileMakerService.publish(config);
  }
}

export default MakePublish;
