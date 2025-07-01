const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Renderis salvestame /tmp alla, lokaalselt kasutame ./games kausta
const IS_RENDER = !!process.env.RENDER || !!process.env.RENDER_EXTERNAL_URL;
const DATA_DIR = IS_RENDER ? '/tmp' : path.join(__dirname, 'games');
const DB_PATH = path.join(DATA_DIR, 'games.db');

// Veendu, et kaust on olemas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ühendu andmebaasiga
const db = new Database(DB_PATH);

// Loo tabel kui puudub
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

module.exports = { db, DATA_DIR };
