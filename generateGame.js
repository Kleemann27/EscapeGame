module.exports = function ({ q1, a1, q2, a2, q3, a3, code }) {
  return `
<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <title>Põgenemismäng</title>
  <style>
    body { font-family: Verdana, Geneva, Tahoma, sans-serif; background: #e1f5fe; color: #333; text-align: center; padding: 2rem; }
    .room, .next { display: none; }
    .visible { display: block; }
    input { padding: 0.5rem; font-size: 1rem; width: 200px; }
    button { margin-top: 1rem; padding: 0.5rem 1rem; background: #03a9f4; color: white; border: none; border-radius: 5px; cursor: pointer; }
    .codebox { background: #fff3cd; border: 2px dashed #ff9800; padding: 1rem; margin-top: 2rem; font-size: 1.3rem; font-weight: bold; border-radius: 10px; color: #e65100; }
  </style>
</head>
<body>
  
  <div id="room1" class="room visible">
  <h1>Põgenemine vahetundi</h1>
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
  <h1>Põgenemine vahetundi</h1>
    <h2>2. tuba</h2>
    <p>${q2}</p>
    <input type="text" id="input2">
    <button onclick="check(2, '${a2}')">Kontrolli</button>
    <p id="msg2"></p>
  </div>
  <div id="next2" class="next">
    <h2>✅ Õige vastus!</h2>
    <p>Vajuta lukule</p>
    <button onclick="goToRoom(3)"><img src="https://cdn-icons-png.flaticon.com/128/93/93141.png" width="60"></button>
  </div>
  <div id="room3" class="room">
  <h1>Põgenemine vahetundi</h1>
    <h2>3. tuba</h2>
    <p>${q3}</p>
    <input type="text" id="input3">
    <button onclick="check(3, '${a3}')">Kontrolli</button>
    <p id="msg3"></p>
  </div>
  <div id="next3" class="next">
    <h2>🎉 Tubli! Sa pääsesid välja!</h2>
    <p>Vahetundi pääsemise parool on:</p>
    <div class="codebox">${code}</div>
  </div>
  <script>
    function check(n, correct) {
      const input = document.getElementById('input' + n).value.trim();
      const msg = document.getElementById('msg' + n);
      if (input === correct) {
        msg.textContent = "";
        document.getElementById('room' + n).classList.remove("visible");
        document.getElementById('next' + n).classList.add("visible");
      } else {
        msg.textContent = "❌ Vale vastus!";
      }
    }
    function goToRoom(n) {
      document.getElementById('next' + (n-1)).classList.remove("visible");
      document.getElementById('room' + n).classList.add("visible");
    }
  </script>
</body>
</html>
`;
};
