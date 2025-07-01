const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Kontroll, kas töötame Renderis
const IS_RENDER = !!process.env.RENDER || !!process.env.RENDER_EXTERNAL_URL;

// Andmete kaust (Renderis /tmp/games, lokaalselt ./games/games)
const DATA_DIR = IS_RENDER ? path.join('/tmp', 'games') : path.join(__dirname, 'games', 'games');

// Veendu, et kaust on olemas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Tee andmebaasi failitee
const DB_PATH = path.join(DATA_DIR, 'games.db');

// Ühenda andmebaasiga
const db = new Database(DB_PATH);

// Loo tabel kui seda pole
db.prepare(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    html TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

module.exports = db;
