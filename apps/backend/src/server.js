import { setTimeout as delay } from "node:timers/promises";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { MongoOrderRepository } from "./repository.js";

const config = readConfig();
const repository = new MongoOrderRepository(config);
const state = { initialized: false, shuttingDown: false };
const { app } = createApp({ config, repository, state });
const server = app.listen(config.port, config.host, () =>
  console.log(
    JSON.stringify({
      event: "listening",
      port: server.address().port,
      version: config.version,
    }),
  ),
);

async function shutdown() {
  if (state.shuttingDown) return;
  state.shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10000).unref();
  server.close(async () => {
    await repository.close();
    clearTimeout(timeout);
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
while (!state.shuttingDown && !state.initialized) {
  try {
    await repository.connect();
    state.initialized = true;
  } catch (error) {
    console.log(
      JSON.stringify({ event: "database_retry", errorType: error.name }),
    );
    await delay(2000);
  }
}
