const Database = require('better-sqlite3');
const path = require('path');

// ⬇ salvestab andmebaasi TMP kausta
const dbPath = path.join('/tmp', 'games.db');
const db = new Database(dbPath);

console.log('Andmebaas avati asukohas:', dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`).run();

module.exports = db;
