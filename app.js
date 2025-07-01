// --- app.js ---

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3030;

// Määrame, kas oleme Renderis
const IS_RENDER = !!process.env.RENDER || !!process.env.RENDER_EXTERNAL_URL;
const DATA_DIR = IS_RENDER ? '/tmp' : path.join(__dirname, 'games');
const FILES_DIR = path.join(DATA_DIR, 'games');

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Vaated ja staatika
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Avaleht
app.get('/', (req, res) => {
  res.render('form');
});

// Mängu genereerimine
app.post('/generate', async (req, res) => {
  const { q1, a1, q2, a2, q3, a3, code } = req.body;
  const id = Math.random().toString(36).substr(2, 6).toLowerCase();

  const html = generateGame({ q1, a1, q2, a2, q3, a3, code });

  const filePath = path.join(FILES_DIR, `${id}.html`);
  fs.writeFileSync(filePath, html);

  db.prepare('INSERT INTO games (id, html, created_at) VALUES (?, ?, ?)').run(id, html, Date.now());

  const url = `${req.protocol}://${req.headers.host}/game/${id}`;
  const qr = await QRCode.toDataURL(url);

  res.render('result', { url, qr, code });
});

// Mängu kuvamine
app.get('/game/:id', (req, res) => {
  const row = db.prepare('SELECT html FROM games WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('Mängu ei leitud.');
  res.send(row.html);
});

// Mängu allalaadimine
app.get('/download/:id', (req, res) => {
  const filePath = path.join(FILES_DIR, `${req.params.id}.html`);
  if (!fs.existsSync(filePath)) return res.status(404).send('Faili ei leitud.');
  res.download(filePath);
});

// Mängu HTML genereerimine
function generateGame({ q1, a1, q2, a2, q3, a3, code }) {
  return `
<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <title>P\u00f5genemism\u00e4ng</title>
  <style>
    body {
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      background: #e1f5fe;
      color: #333;
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
    }

    h1 {
      font-size: 1.8rem;
    }

    h2 {
      font-size: 1.4rem;
      color: #0288d1;
    }

    .room, .next {
      display: none;
    }

    .visible {
      display: block;
    }

    input {
      padding: 0.7rem;
      font-size: 1.2rem;
      width: 90%;
      max-width: 300px;
    }

    button {
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      background: #03a9f4;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1.1rem;
    }

    @media (max-width: 600px) {
      body {
        font-size: 1.3rem;
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.6rem;
      }

      input {
        font-size: 1.4rem;
      }

      button {
        font-size: 1.3rem;
      }
    }
  </style>
</head>
<body>
  <h1>\ud83d\udeaa P\u00f5genemine vahetundi</h1>

  <div id="room1" class="room visible">
    <h2>1. tuba</h2>
    <p>${q1}</p>
    <input type="text" id="input1">
    <button onclick="check(1, '${a1}')">Kontrolli</button>
    <p id="msg1"></p>
  </div>

  <div id="next1" class="next">
    <h2>\u2705 \u00d5ige vastus!</h2>
    <p>Vajuta lukule</p>
    <button onclick="goToRoom(2)"><img src="https://cdn-icons-png.flaticon.com/128/93/93141.png" width="60"></button>
  </div>

  <div id="room2" class="room">
    <h2>2. tuba</h2>
    <p>${q2}</p>
    <input type="text" id="input2">
    <button onclick="check(2, '${a2}')">Kontrolli</button>
    <p id="msg2"></p>
  </div>

  <div id="next2" class="next">
    <h2>\u2705 \u00d5ige vastus!</h2>
    <p>Vajuta lukule</p>
    <button onclick="goToRoom(3)"><img src="https://cdn-icons-png.flaticon.com/128/93/93141.png" width="60"></button>
  </div>

  <div id="room3" class="room">
    <h2>3. tuba</h2>
    <p>${q3}</p>
    <input type="text" id="input3">
    <button onclick="check(3, '${a3}')">Kontrolli</button>
    <p id="msg3"></p>
  </div>

  <div id="next3" class="next">
    <h2>\ud83c\udf89 Tubli! Sa leidsid k\u00f5ik \u00f5iged vastused!</h2>
    <p>Oled t\u00f5eline m\u00f5istatuste meister!</p>
    <p style="margin-top: 1rem; background: #c8e6c9; padding: 1rem; border-radius: 10px;">
      Vahetundi p\u00e4\u00e4semise parool on: <strong>${code}</strong>
    </p>
  </div>

  <script>
    function check(n, correct) {
      const input = document.getElementById('input' + n).value.trim();
      const msg = document.getElementById('msg' + n);
      if (input.toLowerCase() === correct.toLowerCase()) {
        msg.textContent = "";
        document.getElementById('room' + n).classList.remove("visible");
        document.getElementById('next' + n).classList.add("visible");
      } else {
        msg.textContent = "\u274c Vale vastus. Proovi uuesti!";
      }
    }

    function goToRoom(n) {
      document.getElementById('next' + (n - 1)).classList.remove("visible");
      document.getElementById('room' + n).classList.add("visible");
    }
  </script>
</body>
</html>
  `;
}

// Serveri käivitamine
app.listen(PORT, () => {
  console.log(`Server töötab aadressil: http://localhost:${PORT}`);
});
