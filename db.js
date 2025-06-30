const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Kasuta alati sama asukohta (projektikaust)
const DB_PATH = path.join(__dirname, 'games', 'games.db');

// Veendu, et kaust on olemas
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);

// Tabel
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

module.exports = db;
