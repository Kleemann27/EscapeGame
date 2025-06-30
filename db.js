const Database = require('better-sqlite3');
const db = new Database('games.db');

// Loome tabeli kui seda pole
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT,
    created_at INTEGER
  )
`).run();

module.exports = db;
