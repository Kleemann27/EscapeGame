const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, 'games');
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const now = Date.now();

fs.readdir(GAMES_DIR, (err, files) => {
  if (err) return console.error('Viga kausta lugemisel:', err);

  files.forEach(file => {
    const filePath = path.join(GAMES_DIR, file);
    fs.stat(filePath, (err, stats) => {
      if (err) return console.error('Viga faili vaatamisel:', err);

      const age = now - stats.ctimeMs;
      if (age > TWO_WEEKS_MS) {
        fs.unlink(filePath, err => {
          if (err) console.error('Viga faili kustutamisel:', err);
          else console.log(`Kustutati aegunud fail: ${file}`);
        });
      }
    });
  });
});

const db = require('./db');
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
const cutoff = Date.now() - TWO_WEEKS;

const deleted = db.prepare('DELETE FROM games WHERE created_at < ?').run(cutoff);
console.log(`Kustutati ${deleted.changes} vana mängu.`);
