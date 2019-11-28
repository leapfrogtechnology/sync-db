import { synchronize, loadConfig, resolveConnections } from '@leapfrogtechnology/sync-db';

(async function sync() {
  try {
    const config = await loadConfig(); // Load sync-db.yml
    const connections = await resolveConnections(); // Load connections.sync-db.json

    // Invoke the command.
    await synchronize(config, connections);
    process.exit(0);
  } catch (error) {
    process.exit(-1);
  }
})();
