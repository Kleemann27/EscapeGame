const db = require('./db');

const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
const cutoff = Date.now() - TWO_WEEKS;

const deleted = db.prepare('DELETE FROM games WHERE created_at < ?').run(cutoff);
console.log(`Kustutati ${deleted.changes} vana mängu.`);
