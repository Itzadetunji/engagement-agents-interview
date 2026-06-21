import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

const dbPath = path.resolve(process.env.DATABASE_PATH ?? "./data/promotions.db");

for (const file of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Deleted ${file}`);
  }
}

console.log("Database cleared. Tables will be recreated on next server start.");
