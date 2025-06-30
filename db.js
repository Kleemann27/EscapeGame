const path = require('path');
const Database = require('better-sqlite3');

// Kontrollime, kas töötab Renderis
const dbPath = process.env.RENDER ? '/tmp/games.db' : path.join(__dirname, 'games.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT,
    created_at INTEGER
  )
`);

module.exports = db;
