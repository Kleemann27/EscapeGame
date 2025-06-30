const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/games.db'
  : path.join(__dirname, 'games.db');

console.log('Andmebaas avati asukohas:', dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

module.exports = db;
