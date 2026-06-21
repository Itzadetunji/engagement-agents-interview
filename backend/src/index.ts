import { createApp } from "./app.js";
import { config } from "./config.js";
import { getDb } from "./db/connection.js";

getDb();

const app = createApp();

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
