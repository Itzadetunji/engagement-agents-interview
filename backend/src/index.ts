import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { getDb } from "./db/connection.js";
import { initSocket } from "./socket/index.js";

getDb();

const app = createApp();
const server = createServer(app);

initSocket(server);

server.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
