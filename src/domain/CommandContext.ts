import Configuration from './Configuration';
import CommandParams from './CommandParams';

interface CommandContext {
  config: Configuration;
  connectionId: string;
  params: CommandParams;
}

export default CommandContext;
