/**
 * Demonstrates using sync-db programmatically (instead of the CLI) to synchronize the database.
 */
import { synchronize, loadConfig, resolveConnections } from '@leapfrogtechnology/sync-db';

(async () => {
  try {
    const config = await loadConfig(); // Load sync-db.yml
    const connections = await resolveConnections(config); // Load connections.sync-db.json

    // Invoke the synchronize operation.
    const results = await synchronize(config, connections);
    const failed = results.filter(({ success }) => !success);

    for (const { connectionId, success, timeElapsed } of results) {
      console.log(`${success ? '✓' : '✖'} ${connectionId} (${timeElapsed}s)`);
    }

    process.exit(failed.length === 0 ? 0 : -1);
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
})();
