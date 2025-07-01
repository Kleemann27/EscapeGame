const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const { db, DATA_DIR } = require('./db'); // db ja kausta tee

const app = express();
const PORT = process.env.PORT || 3030;
const GAMES_DIR = path.join(DATA_DIR, 'games');

// Veendu, et mängude kaust eksisteerib
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

// EJS ja staatika
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Avaleht
app.get('/', (req, res) => {
  res.render('form');
});

// Vormilt saadud andmete töötlemine ja salvestamine
app.post('/generate', async (req, res) => {
  const { q1, a1, q2, a2, q3, a3, code } = req.body;
  const id = Math.random().toString(36).substr(2, 6).toLowerCase();

  const html = generateGame({ q1, a1, q2, a2, q3, a3, code });
  const filePath = path.join(GAMES_DIR, `${id}.html`);

  // Salvesta HTML-fail
  fs.writeFileSync(filePath, html);

  // Salvesta andmebaasi
  db.prepare('INSERT INTO games (id, html, created_at) VALUES (?, ?, ?)').run(id, html, Date.now());
  console.log(`✔ Mäng salvestati: ${filePath}`);

  // Loo mängu link ja QR
  const url = `${req.protocol}://${req.headers.host}/game/${id}`;
  const qr = await QRCode.toDataURL(url);

  res.render('result', { url, qr, code });
});

// Teenindab mängu andmebaasist
app.get('/game/:id', (req, res) => {
  const row = db.prepare('SELECT html FROM games WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('❌ Mängu ei leitud');
  res.send(row.html);
});

// HTML mängu genereerimine
function generateGame({ q1, a1, q2, a2, q3, a3, code }) {
  return `
<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <title>Põgenemismäng</title>
  <style>
    body {
      font-family: Verdana, sans-serif;
      background: #e1f5fe;
      color: #333;
      text-align: center;
      padding: 2rem;
      font-size: 1.2rem;
    }
    .room, .next { display: none; }
    .visible { display: block; }
    input { padding: 0.5rem; font-size: 1.2rem; width: 80%; max-width: 300px; }
    button {
      margin-top: 1rem; padding: 0.6rem 1.2rem;
      background: #03a9f4; color: white; border: none;
      border-radius: 5px; cursor: pointer; font-size: 1rem;
    }
  </style>
</head>
<body>
  <h1>🚪 Põgenemine vahetundi</h1>

  <div id="room1" class="room visible">
    <h2>1. tuba</h2>
    <p>${q1}</p>
    <input type="text" id="input1">
    <button onclick="check(1, '${a1}')">Kontrolli</button>
    <p id="msg1"></p>
  </div>

  <div id="next1" class="next">
    <h2>✅ Õige!</h2>
    <button onclick="goToRoom(2)">➡️ Edasi</button>
  </div>

  <div id="room2" class="room">
    <h2>2. tuba</h2>
    <p>${q2}</p>
    <input type="text" id="input2">
    <button onclick="check(2, '${a2}')">Kontrolli</button>
    <p id="msg2"></p>
  </div>

  <div id="next2" class="next">
    <h2>✅ Õige!</h2>
    <button onclick="goToRoom(3)">➡️ Edasi</button>
  </div>

  <div id="room3" class="room">
    <h2>3. tuba</h2>
    <p>${q3}</p>
    <input type="text" id="input3">
    <button onclick="check(3, '${a3}')">Kontrolli</button>
    <p id="msg3"></p>
  </div>

  <div id="next3" class="next">
    <h2>🎉 Tubli! Parool on:</h2>
    <p><strong>${code}</strong></p>
  </div>

  <script>
    function check(n, correct) {
      const input = document.getElementById('input' + n).value.trim();
      const msg = document.getElementById('msg' + n);
      if (input.toLowerCase() === correct.toLowerCase()) {
        msg.textContent = '';
        document.getElementById('room' + n).classList.remove('visible');
        document.getElementById('next' + n).classList.add('visible');
      } else {
        msg.textContent = '❌ Vale vastus!';
      }
    }

    function goToRoom(n) {
      document.getElementById('next' + (n - 1)).classList.remove('visible');
      document.getElementById('room' + n).classList.add('visible');
    }
  </script>
</body>
</html>
`;
}

// Kuvab kõik mängud andmebaasist (kontrolliks Renderis)
app.get('/list', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, created_at FROM games ORDER BY created_at DESC').all();
    res.send(`
      <h1>Salvestatud mängud (${rows.length})</h1>
      <ul>
        ${rows.map(row => `
          <li>
            <a href="/game/${row.id}" target="_blank">${row.id}</a>
            - ${new Date(row.created_at).toLocaleString()}
          </li>
        `).join('')}
      </ul>
    `);
  } catch (err) {
    console.error("❌ Viga mängude kuvamisel:", err);
    res.status(500).send('Tekkis viga mängude nimekirja kuvamisel.');
  }
});

// Käivita server
app.listen(PORT, () => {
  console.log(`✅ Server töötab: http://localhost:${PORT}`);
});
