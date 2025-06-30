const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const db = require('./db');
const app = express();

const PORT = process.env.PORT || 3030;

// EJS vaated ja statiline kaust
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Vormivaade
app.get('/', (req, res) => {
  res.render('form');
});

// Vormilt saadud andmete töötlemine ja salvestamine
app.post('/generate', async (req, res) => {
  const { q1, a1, q2, a2, q3, a3, code } = req.body;
  const id = Math.random().toString(36).substr(2, 6);
  const html = generateGame({ q1, a1, q2, a2, q3, a3, code });

  const timestamp = Date.now();
  db.prepare('INSERT INTO games (id, html, created_at) VALUES (?, ?, ?)')
    .run(id, html, timestamp);

  const url = `${req.protocol}://${req.get('host')}/game/${id}`;
  const qr = await QRCode.toDataURL(url);
  res.render('result', { url, qr, code });
});

// Mängu teenindamine ID põhjal
app.get('/game/:id', (req, res) => {
  const row = db.prepare('SELECT html FROM games WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('Mängu ei leitud.');
  res.send(row.html);
});

// Mängu HTML genereerimine
function generateGame({ q1, a1, q2, a2, q3, a3, code }) {
  return `
<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <title>Põgenemismäng</title>
  <style>
    body {
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      background: #e1f5fe;
      color: #333;
      text-align: center;
      padding: 2rem;
    }
    .room, .next { display: none; }
    .visible { display: block; }
    input { padding: 0.5rem; font-size: 1rem; width: 200px; }
    button { margin-top: 1rem; padding: 0.5rem 1rem; background: #03a9f4; color: white; border: none; border-radius: 5px; cursor: pointer; }
    h2 { color: #0288d1; }
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
    <h2>✅ Õige vastus!</h2>
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

  <div id="next1" class="next">
    <h2>✅ Õige vastus!</h2>
    <p>Vajuta lukule</p>
    <button onclick="goToRoom(2)"><img src="https://cdn-icons-png.flaticon.com/128/93/93141.png" width="60"></button>
  </div>

  <div id="room3" class="room">
    <h2>3. tuba</h2>
    <p>${q3}</p>
    <input type="text" id="input3">
    <button onclick="check(3, '${a3}')">Kontrolli</button>
    <p id="msg3"></p>
  </div>

  <div id="next3" class="next">
    <h2>🎉 Tubli! Sa leidsid kõik õiged vastused!</h2>
    <p>Oled tõeline mõistatuste meister!</p>
    <p style="margin-top: 1rem; background: #c8e6c9; padding: 1rem; border-radius: 10px;">
      Vahetundi pääsemise parool on: <strong>${code}</strong>
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
    msg.textContent = "❌ Vale vastus. Proovi uuesti!";
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

app.listen(PORT, () => {
  console.log(`Server töötab aadressil: http://localhost:${PORT}`);
});
