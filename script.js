const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const restartButton = document.querySelector("#restart");
const bgmButton = document.querySelector("#bgm");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 10500;
const GRAVITY = 0.7;
const keys = new Set();

const level = {
  platforms: [
    { x: 0, y: 470, width: 650, height: 70 },
    { x: 760, y: 430, width: 220, height: 110 },
    { x: 1100, y: 480, width: 260, height: 60 },
    { x: 1480, y: 390, width: 260, height: 150 },
    { x: 1860, y: 460, width: 470, height: 80 },
    { x: 2450, y: 360, width: 250, height: 180 },
    { x: 2800, y: 470, width: 360, height: 70 },
    { x: 3280, y: 410, width: 210, height: 130 },
    { x: 3610, y: 330, width: 250, height: 210 },
    { x: 3980, y: 470, width: 500, height: 70 },
    { x: 4580, y: 420, width: 300, height: 120 },
    { x: 5010, y: 470, width: 420, height: 70 },
    { x: 5570, y: 360, width: 230, height: 180 },
    { x: 5920, y: 450, width: 300, height: 90 },
    { x: 6380, y: 300, width: 250, height: 240 },
    { x: 6740, y: 440, width: 260, height: 100 },
    { x: 7140, y: 470, width: 460, height: 70 },
    { x: 7700, y: 380, width: 220, height: 160 },
    { x: 8040, y: 290, width: 220, height: 250 },
    { x: 8390, y: 450, width: 440, height: 90 },
    { x: 8910, y: 350, width: 280, height: 190 },
    { x: 9320, y: 470, width: 1180, height: 70 },
  ],
  coins: [
    [300, 420], [820, 380], [1190, 430], [1560, 340], [2050, 410],
    [2550, 310], [2900, 420], [3370, 360], [3700, 280], [4160, 420],
    [4670, 370], [5160, 420], [5670, 310], [6030, 400], [6490, 250],
    [6850, 390], [7300, 420], [7790, 330], [8130, 240], [8520, 400],
    [9040, 300], [9500, 420], [9850, 420], [10200, 420],
  ].map(([x, y]) => ({ x, y, collected: false })),
  items: [
    { x: 530, y: 420, type: "shield", collected: false },
    { x: 1575, y: 340, type: "heart", collected: false },
    { x: 2640, y: 310, type: "shield", collected: false },
    { x: 4140, y: 420, type: "heart", collected: false },
    { x: 6500, y: 250, type: "shield", collected: false },
    { x: 9010, y: 300, type: "heart", collected: false },
  ],
  enemies: [
    { type: "walker", x: 430, y: 430, width: 32, height: 40, speed: 1.2, min: 180, max: 600, direction: 1 },
    { type: "jumper", x: 1910, y: 420, width: 34, height: 40, speed: 1, min: 1880, max: 2260, direction: 1, jumpTimer: 50 },
    { type: "flyer", x: 1150, y: 330, width: 38, height: 26, speed: 1.4, min: 1120, max: 1320, direction: 1, baseY: 330, phase: 0 },
    { type: "walker", x: 2900, y: 430, width: 32, height: 40, speed: 1.4, min: 2820, max: 3120, direction: 1 },
    { type: "jumper", x: 3370, y: 360, width: 34, height: 40, speed: 1.1, min: 3280, max: 3460, direction: 1, jumpTimer: 20 },
    { type: "flyer", x: 4050, y: 350, width: 38, height: 26, speed: 1.5, min: 4000, max: 4400, direction: 1, baseY: 350, phase: 2 },
    { type: "walker", x: 5180, y: 430, width: 32, height: 40, speed: 1.5, min: 5050, max: 5400, direction: 1 },
    { type: "jumper", x: 5680, y: 310, width: 34, height: 40, speed: 1, min: 5570, max: 5780, direction: 1, jumpTimer: 70 },
    { type: "flyer", x: 6460, y: 210, width: 38, height: 26, speed: 1.6, min: 6400, max: 6600, direction: 1, baseY: 210, phase: 1 },
    { type: "walker", x: 7280, y: 430, width: 32, height: 40, speed: 1.6, min: 7160, max: 7550, direction: 1 },
    { type: "jumper", x: 8070, y: 250, width: 34, height: 40, speed: 1.2, min: 8040, max: 8200, direction: 1, jumpTimer: 35 },
    { type: "flyer", x: 9000, y: 270, width: 38, height: 26, speed: 1.7, min: 8920, max: 9150, direction: 1, baseY: 270, phase: 3 },
    { type: "walker", x: 9670, y: 430, width: 32, height: 40, speed: 1.5, min: 9400, max: 10100, direction: 1 },
  ],
  goal: { x: 10370, y: 390, width: 24, height: 80 },
};

let player;
let cameraX;
let coins;
let items;
let enemies;
let lives;
let gameState;
let lastTime = 0;
let bullets = [];
let facing = 1;
let attackCooldown = 0;
let audioContext;
let bgmTimer;
let bgmOn = false;
let shielded = false;
let invulnerableTimer = 0;
const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

function resetGame() {
  player = { x: 80, y: 350, width: 30, height: 46, vx: 0, vy: 0, grounded: false };
  cameraX = 0;
  coins = level.coins.map((coin) => ({ ...coin }));
  items = level.items.map((item) => ({ ...item }));
  enemies = level.enemies.map((enemy) => ({ ...enemy }));
  bullets = [];
  facing = 1;
  attackCooldown = 0;
  lives = 5;
  shielded = false;
  invulnerableTimer = 0;
  gameState = "playing";
  message.textContent = "";
  updateHud();
}

function updateHud() {
  const collected = coins.filter((coin) => coin.collected).length;
  status.textContent = `コイン: ${collected}/${coins.length}　|　残機: ${lives}　|　${shielded ? "シールド有効" : "シールドなし"}`;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

function respawn() {
  if (invulnerableTimer > 0) return;
  if (shielded) {
    shielded = false;
    invulnerableTimer = 90;
    playTone(180, 0.16, "sawtooth");
    updateHud();
    return;
  }
  lives -= 1;
  if (lives <= 0) {
    gameState = "gameover";
    message.textContent = "ゲームオーバー。リスタートで再挑戦！";
    updateHud();
    return;
  }
  player.x = Math.max(80, player.x - 420);
  player.y = 250;
  player.vx = 0;
  player.vy = 0;
  invulnerableTimer = 120;
  updateHud();
}

function playTone(frequency, duration, type = "sine") {
  audioContext ??= new AudioContext();
  audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.09, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function startBgm() {
  if (bgmOn) return;
  audioContext ??= new AudioContext();
  audioContext.resume();
  let note = 0;
  const playNote = () => {
    if (!bgmOn) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = melody[note % melody.length];
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.24);
    note += 1;
  };
  bgmOn = true;
  playNote();
  bgmTimer = setInterval(playNote, 280);
  bgmButton.textContent = "BGM: ON";
}

function stopBgm() {
  bgmOn = false;
  clearInterval(bgmTimer);
  bgmTimer = undefined;
  bgmButton.textContent = "BGM: OFF";
}

function toggleBgm() {
  if (bgmOn) stopBgm();
  else startBgm();
}

function fire() {
  if (attackCooldown > 0 || gameState !== "playing") return;
  bullets.push({
    x: player.x + (facing > 0 ? player.width : -14),
    y: player.y + 20,
    width: 14,
    height: 6,
    vx: facing * 9,
  });
  playTone(520, 0.08, "square");
  attackCooldown = 18;
}

function update(delta) {
  if (gameState !== "playing") return;
  const dt = Math.min(delta / 16.67, 2);
  invulnerableTimer = Math.max(0, invulnerableTimer - dt);
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has("ArrowUp") || keys.has("w") || keys.has(" ");
  const attack = keys.has("x") || keys.has("j");

  player.vx = (right ? 4.5 : 0) - (left ? 4.5 : 0);
  if (left) facing = -1;
  if (right) facing = 1;
  if (attack) fire();
  attackCooldown = Math.max(0, attackCooldown - dt);
  if (jump && player.grounded) {
    player.vy = -13;
    player.grounded = false;
    playTone(390, 0.14, "triangle");
  }
  player.vy += GRAVITY * dt;
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x + player.vx * dt));
  player.y += player.vy * dt;
  player.grounded = false;

  for (const platform of level.platforms) {
    const wasAbove = player.y + player.height - player.vy * dt <= platform.y;
    if (wasAbove && overlaps(player, platform) && player.vy >= 0) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }

  for (const coin of coins) {
    if (!coin.collected && overlaps(player, { x: coin.x - 10, y: coin.y - 10, width: 20, height: 20 })) {
      coin.collected = true;
      updateHud();
    }
    for (const item of items) {
      if (!item.collected && overlaps(player, { x: item.x - 14, y: item.y - 14, width: 28, height: 28 })) {
        item.collected = true;
        if (item.type === "shield") shielded = true;
        if (item.type === "heart") lives = Math.min(9, lives + 1);
        playTone(item.type === "shield" ? 700 : 880, 0.22, "triangle");
        updateHud();
      }
    }
  }

  for (const enemy of enemies) {
    enemy.x += enemy.speed * enemy.direction * dt;
    if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.direction *= -1;
    if (enemy.type === "jumper") {
      enemy.jumpTimer -= dt;
      if (enemy.jumpTimer <= 0) {
        enemy.vy = -10;
        enemy.jumpTimer = 90;
      }
      enemy.vy = (enemy.vy || 0) + GRAVITY * dt;
      enemy.y += enemy.vy * dt;
      const platform = level.platforms.find((item) =>
        enemy.x + enemy.width > item.x && enemy.x < item.x + item.width &&
        enemy.y + enemy.height >= item.y && enemy.y + enemy.height - enemy.vy * dt <= item.y
      );
      if (platform) {
        enemy.y = platform.y - enemy.height;
        enemy.vy = 0;
      }
    } else if (enemy.type === "flyer") {
      enemy.phase += 0.07 * dt;
      enemy.y = enemy.baseY + Math.sin(enemy.phase) * 38;
    }
    if (overlaps(player, enemy)) {
      respawn();
      break;
    }
  }
  for (const bullet of bullets) {
    bullet.x += bullet.vx * dt;
  }
  for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
    const hitBullet = bullets.find((bullet) => overlaps(bullet, enemies[enemyIndex]));
    if (hitBullet) {
      enemies.splice(enemyIndex, 1);
      bullets.splice(bullets.indexOf(hitBullet), 1);
      playTone(110, 0.16, "square");
    }
  }
  bullets = bullets.filter((bullet) => bullet.x > cameraX - 100 && bullet.x < cameraX + WIDTH + 100);
  if (player.y > HEIGHT + 80) respawn();
  if (overlaps(player, level.goal)) {
    gameState = "won";
    message.textContent = "クリア！すべてのコインを集めると高得点です。";
  }
  cameraX += (player.x - WIDTH * 0.35 - cameraX) * 0.1;
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, cameraX));
}

function draw() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#090d2b");
  sky.addColorStop(0.55, "#312e81");
  sky.addColorStop(1, "#c24175");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.translate(-cameraX * 0.18, 0);
  ctx.fillStyle = "#fef3c7";
  ctx.globalAlpha = 0.75;
  for (let x = -400; x < WORLD_WIDTH + 400; x += 240) {
    ctx.beginPath();
    ctx.arc(x, 85 + (x % 120), 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#17133f";
  for (let x = -400; x < WORLD_WIDTH + 400; x += 360) {
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.lineTo(x + 120, 330);
    ctx.lineTo(x + 240, 500);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-cameraX, 0);
  for (const platform of level.platforms) {
    ctx.fillStyle = "#166534";
    ctx.fillRect(platform.x, platform.y, platform.width, 12);
    ctx.fillStyle = "#854d0e";
    ctx.fillRect(platform.x, platform.y + 12, platform.width, platform.height - 12);
  }
  for (const coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a16207";
      ctx.stroke();
    }
    for (const item of items) {
      if (item.collected) continue;
      ctx.fillStyle = item.type === "shield" ? "#fde047" : "#fb7185";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      if (item.type === "shield") {
        ctx.arc(item.x, item.y, 13, 0, Math.PI * 2);
      } else {
        ctx.moveTo(item.x, item.y + 13);
        ctx.bezierCurveTo(item.x - 24, item.y - 2, item.x - 10, item.y - 18, item.x, item.y - 5);
        ctx.bezierCurveTo(item.x + 10, item.y - 18, item.x + 24, item.y - 2, item.x, item.y + 13);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  for (const enemy of enemies) {
    ctx.fillStyle = enemy.type === "flyer" ? "#7c3aed" : enemy.type === "jumper" ? "#ea580c" : "#dc2626";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(enemy.x + 6, enemy.y + 7, 6, 6);
    ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + 7, 6, 6);
    if (enemy.type === "flyer") {
      ctx.fillStyle = "#c4b5fd";
      ctx.fillRect(enemy.x - 8, enemy.y + 8, 8, 8);
      ctx.fillRect(enemy.x + enemy.width, enemy.y + 8, 8, 8);
    }
  }
  for (const bullet of bullets) {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(level.goal.x, level.goal.y, 4, level.goal.height);
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(level.goal.x + 4, level.goal.y);
  ctx.lineTo(level.goal.x + 40, level.goal.y + 14);
  ctx.lineTo(level.goal.x + 4, level.goal.y + 28);
  ctx.fill();
  if (invulnerableTimer <= 0 || Math.floor(invulnerableTimer / 6) % 2 === 0) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(player.x + 3, player.y + 4, 24, 42);
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(player.x, player.y + 13, player.width, 27);
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(player.x + 7, player.y + 7, 16, 15);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(player.x + (facing > 0 ? 18 : 6), player.y + 13, 4, 4);
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(player.x + 4, player.y, 22, 7);
    if (shielded) {
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 29, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function frame(time) {
  update(time - lastTime);
  lastTime = time;
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w", "x", "j"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
});
window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});
restartButton.addEventListener("click", resetGame);
bgmButton.addEventListener("click", toggleBgm);

resetGame();
requestAnimationFrame(frame);
