const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Leia sobiv kataloog: Renderis /tmp, muidu lokaalselt 'games'
const DB_DIR = process.env.RENDER ? '/tmp' : path.join(__dirname, 'games');
const DB_PATH = path.join(DB_DIR, 'games.db');

// Veendu, et kaust olemas
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Loo tabel kui see ei eksisteeri
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

module.exports = db;
