const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const restartButton = document.querySelector("#restart");
const bgmButton = document.querySelector("#bgm");
const respawnButton = document.querySelector("#respawn");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 18000;
const GRAVITY = 0.7;
const keys = new Set();

const level = {
  platforms: [
    { x: 0, y: 470, width: 650, height: 70 },
    { x: 760, y: 450, width: 220, height: 90 },
    { x: 1100, y: 480, width: 260, height: 60 },
    { x: 1480, y: 440, width: 260, height: 100 },
    { x: 1860, y: 460, width: 470, height: 80 },
    { x: 2450, y: 420, width: 250, height: 120 },
    { x: 2800, y: 470, width: 360, height: 70 },
    { x: 3280, y: 450, width: 210, height: 90 },
    { x: 3610, y: 410, width: 250, height: 130 },
    { x: 3980, y: 470, width: 500, height: 70 },
    { x: 4580, y: 450, width: 300, height: 90 },
    { x: 5010, y: 470, width: 420, height: 70 },
    { x: 5570, y: 420, width: 230, height: 120 },
    { x: 5920, y: 460, width: 300, height: 80 },
    { x: 6280, y: 430, width: 160, height: 110 },
    { x: 6520, y: 390, width: 250, height: 150 },
    { x: 6740, y: 460, width: 260, height: 80 },
    { x: 6800, y: 420, width: 150, height: 120 },
    { x: 7000, y: 380, width: 120, height: 160 },
    { x: 7180, y: 430, width: 140, height: 110 },
    { x: 7140, y: 470, width: 460, height: 70 },
    { x: 7700, y: 430, width: 220, height: 110 },
    { x: 7980, y: 400, width: 180, height: 140 },
    { x: 8260, y: 370, width: 220, height: 170 },
    { x: 8390, y: 450, width: 440, height: 90 },
    { x: 8510, y: 380, width: 280, height: 160, hidden: true },
    { x: 8910, y: 410, width: 280, height: 130 },
    { x: 9320, y: 470, width: 1180, height: 70 },
    { x: 10580, y: 450, width: 420, height: 90 },
    { x: 11160, y: 470, width: 360, height: 70 },
    { x: 11700, y: 420, width: 260, height: 120 },
    { x: 12120, y: 470, width: 360, height: 70 },
    { x: 12620, y: 390, width: 300, height: 150 },
    { x: 13100, y: 470, width: 900, height: 70 },
    { x: 14150, y: 450, width: 280, height: 90 },
    { x: 14600, y: 390, width: 220, height: 150 },
    { x: 15020, y: 470, width: 360, height: 70 },
    { x: 15580, y: 420, width: 240, height: 120 },
    { x: 16020, y: 350, width: 220, height: 190 },
    { x: 16450, y: 470, width: 400, height: 70 },
    { x: 17100, y: 400, width: 260, height: 140 },
    { x: 17600, y: 470, width: 400, height: 70 },
  ],
  stairs: [
    { x: 1320, y: 440, width: 110, height: 20 },
    { x: 1430, y: 410, width: 110, height: 20 },
    { x: 5400, y: 440, width: 110, height: 20 },
    { x: 5510, y: 410, width: 110, height: 20 },
    { x: 7560, y: 440, width: 110, height: 20 },
    { x: 7670, y: 410, width: 110, height: 20 },
    { x: 10320, y: 430, width: 100, height: 20 },
    { x: 10420, y: 390, width: 100, height: 20 },
    { x: 10520, y: 350, width: 100, height: 20 },
    { x: 10620, y: 310, width: 100, height: 20 },
    { x: 10720, y: 270, width: 100, height: 20 },
    { x: 10820, y: 230, width: 100, height: 20 },
    { x: 10920, y: 190, width: 100, height: 20 },
    { x: 11020, y: 150, width: 100, height: 20 },
    { x: 13980, y: 430, width: 90, height: 20 },
    { x: 14070, y: 390, width: 90, height: 20 },
    { x: 14160, y: 350, width: 90, height: 20 },
    { x: 14250, y: 310, width: 90, height: 20 },
    { x: 14340, y: 270, width: 90, height: 20 },
    { x: 14430, y: 230, width: 90, height: 20 },
  ],
  hiddenPlatforms: [
    { x: 11300, y: 390, width: 110, height: 18 },
    { x: 11440, y: 330, width: 110, height: 18 },
    { x: 11580, y: 270, width: 110, height: 18 },
    { x: 11680, y: 210, width: 140, height: 18 },
    { x: 15120, y: 360, width: 100, height: 18 },
    { x: 15250, y: 300, width: 100, height: 18 },
    { x: 15380, y: 240, width: 130, height: 18 },
  ],
  movingPlatforms: [
    { x: 650, y: 420, width: 110, height: 18, startX: 650, range: 100, phase: 0 },
    { x: 2340, y: 390, width: 115, height: 18, startX: 2340, range: 130, phase: 1.4 },
    { x: 4430, y: 390, width: 120, height: 18, startX: 4430, range: 110, phase: 2.2 },
    { x: 6200, y: 340, width: 115, height: 18, startX: 6200, range: 120, phase: 0.8 },
    { x: 7550, y: 330, width: 110, height: 18, startX: 7550, range: 100, phase: 2.8 },
    { x: 13700, y: 360, width: 110, height: 18, startX: 13700, range: 150, phase: 1.2 },
    { x: 15800, y: 270, width: 110, height: 18, startX: 15800, range: 120, phase: 2.1 },
  ],
  crumblePlatforms: [
    { x: 995, y: 420, width: 105, height: 18, timer: 0, broken: false },
    { x: 3180, y: 420, width: 100, height: 18, timer: 0, broken: false },
    { x: 4880, y: 400, width: 105, height: 18, timer: 0, broken: false },
    { x: 8350, y: 330, width: 105, height: 18, timer: 0, broken: false },
  ],
  water: [
    { x: 650, y: 500, width: 110, height: 40 },
    { x: 1360, y: 500, width: 120, height: 40 },
    { x: 2330, y: 500, width: 120, height: 40 },
    { x: 3160, y: 500, width: 120, height: 40 },
    { x: 4480, y: 500, width: 100, height: 40 },
    { x: 6200, y: 500, width: 180, height: 40 },
    { x: 7600, y: 500, width: 100, height: 40 },
    { x: 8270, y: 500, width: 120, height: 40 },
    { x: 14000, y: 500, width: 150, height: 40 },
    { x: 14480, y: 500, width: 120, height: 40 },
    { x: 14900, y: 500, width: 120, height: 40 },
    { x: 15300, y: 500, width: 280, height: 40 },
    { x: 15900, y: 500, width: 120, height: 40 },
    { x: 16850, y: 500, width: 250, height: 40 },
  ],
  pendulums: [
    { anchorX: 1750, anchorY: 145, length: 155, angle: 0.65, speed: 0.035, size: 24 },
    { anchorX: 4720, anchorY: 150, length: 165, angle: 2.3, speed: 0.03, size: 26 },
    { anchorX: 7450, anchorY: 140, length: 150, angle: 0.8, speed: 0.04, size: 24 },
    { anchorX: 10080, anchorY: 145, length: 175, angle: 2.2, speed: 0.032, size: 28 },
    { anchorX: 12480, anchorY: 140, length: 160, angle: 0.5, speed: 0.038, size: 25 },
    { anchorX: 2680, anchorY: 135, length: 145, angle: 1.8, speed: 0.034, size: 23 },
    { anchorX: 5800, anchorY: 140, length: 160, angle: 2.7, speed: 0.031, size: 25 },
    { anchorX: 8800, anchorY: 145, length: 155, angle: 1.1, speed: 0.036, size: 24 },
    { anchorX: 13400, anchorY: 140, length: 165, angle: 2.6, speed: 0.033, size: 26 },
    { anchorX: 16600, anchorY: 145, length: 150, angle: 0.9, speed: 0.037, size: 24 },
  ],
  checkpoints: [
    { x: 10100, y: 420, reached: false },
  ],
  restAreas: [
    { x: 10120, y: 430, width: 130 },
  ],
  coins: [
    [300, 420], [820, 380], [1190, 430], [1560, 340], [2050, 410],
    [2550, 310], [2900, 420], [3370, 360], [3700, 280], [4160, 420],
    [4670, 370], [5160, 420], [5670, 310], [6030, 400], [6490, 250],
    [6850, 390], [7300, 420], [7790, 330], [8130, 240], [8520, 400],
    [9040, 300], [9500, 420], [9850, 420], [10200, 420],
    [10360, 390], [10460, 350], [10560, 310], [10660, 270], [10760, 230],
    [10860, 190], [10960, 150], [11340, 350], [11480, 290], [11620, 230],
    [11720, 170], [12680, 340], [12730, 340], [12780, 340], [12830, 340],
    [12880, 340],     [13200, 390], [13250, 390], [13300, 390], [13350, 390],
    [13400, 390], [13450, 390], [13500, 390],
    [14020, 390], [14110, 350], [14200, 310], [14290, 270], [14380, 230],
    [14660, 330], [14720, 330], [15160, 320], [15290, 260], [15420, 200],
    [15640, 360], [15820, 210], [15940, 210], [16080, 290], [16140, 290],
    [16540, 420], [16600, 420], [16660, 420], [16720, 420],
    [17160, 350], [17220, 350], [17700, 420], [17760, 420],
  ].map(([x, y]) => ({ x, y, collected: false })),
  items: [
    { x: 8650, y: 330, type: "armor", collected: false },
    { x: 3060, y: 390, type: "armor", collected: false },
    { x: 6920, y: 370, type: "armor", collected: false },
    { x: 11520, y: 280, type: "armor", collected: false },
    { x: 15290, y: 250, type: "armor", collected: false },
    { x: 3700, y: 230, type: "star", collected: false },
    { x: 11070, y: 105, type: "star", collected: false },
    { x: 16080, y: 220, type: "star", collected: false },
    { type: "chaser", x: 14640, y: 350, width: 36, height: 40, speed: 1.2, min: 14600, max: 14800, direction: 1 },
    { type: "divebird", x: 15880, y: 130, width: 42, height: 30, speed: 2.8, min: 15600, max: 16100, direction: 1, baseY: 130, phase: 1, dive: false },
    { type: "unstompable", x: 17180, y: 360, width: 38, height: 40, speed: 1.2, min: 17100, max: 17300, direction: 1 },
  ],
  enemies: [
    { type: "walker", x: 430, y: 430, width: 32, height: 40, speed: 1.2, min: 180, max: 600, direction: 1 },
    { type: "unstompable", x: 1910, y: 420, width: 38, height: 40, speed: 1, min: 1880, max: 2260, direction: 1 },
    { type: "flyer", x: 1150, y: 330, width: 38, height: 26, speed: 1.4, min: 1120, max: 1320, direction: 1, baseY: 330, phase: 0 },
    { type: "walker", x: 2900, y: 430, width: 32, height: 40, speed: 1.4, min: 2820, max: 3120, direction: 1 },
    { type: "chaser", x: 3370, y: 410, width: 36, height: 40, speed: 1.05, min: 3280, max: 3460, direction: 1 },
    { type: "flyer", x: 4050, y: 350, width: 38, height: 26, speed: 1.5, min: 4000, max: 4400, direction: 1, baseY: 350, phase: 2 },
    { type: "walker", x: 5180, y: 430, width: 32, height: 40, speed: 1.5, min: 5050, max: 5400, direction: 1 },
    { type: "unstompable", x: 5680, y: 380, width: 38, height: 40, speed: 1, min: 5570, max: 5780, direction: 1 },
    { type: "flyer", x: 6460, y: 300, width: 38, height: 26, speed: 1.6, min: 6400, max: 6600, direction: 1, baseY: 300, phase: 1 },
    { type: "walker", x: 7280, y: 430, width: 32, height: 40, speed: 1.6, min: 7160, max: 7550, direction: 1 },
    { type: "chaser", x: 8070, y: 360, width: 36, height: 40, speed: 1.1, min: 8040, max: 8200, direction: 1 },
    { type: "flyer", x: 9000, y: 270, width: 38, height: 26, speed: 1.7, min: 8920, max: 9150, direction: 1, baseY: 270, phase: 3 },
    { type: "walker", x: 9670, y: 430, width: 32, height: 40, speed: 1.5, min: 9400, max: 10100, direction: 1 },
    { type: "rare", x: 10820, y: 180, width: 44, height: 42, speed: 1.1, min: 10680, max: 10980, direction: 1 },
    { type: "walker", x: 11240, y: 430, width: 32, height: 40, speed: 1.8, min: 11180, max: 11480, direction: 1 },
    { type: "rare", x: 12720, y: 340, width: 44, height: 42, speed: 1.2, min: 12620, max: 12900, direction: 1 },
    { type: "divebird", x: 2220, y: 150, width: 42, height: 30, speed: 2.6, min: 2050, max: 2320, direction: 1, baseY: 150, phase: 0, dive: false },
    { type: "burrower", x: 4550, y: 430, width: 34, height: 40, speed: 1.4, min: 4500, max: 4700, direction: 1, hidden: true, timer: 40 },
    { type: "skyhunter", x: 7800, y: 120, width: 42, height: 30, speed: 1.2, min: 7700, max: 8250, direction: 1, baseY: 120 },
    { type: "shooter", x: 11850, y: 380, width: 38, height: 42, speed: 0, min: 11850, max: 11850, direction: 1, shotTimer: 80 },
  ],
  goal: { x: 17920, y: 390, width: 24, height: 80 },
};

let player;
let cameraX;
let coins;
let enemies;
let items;
let gameState;
let lastTime = 0;
let audioContext;
let bgmTimer;
let bgmOn = false;
let armored = false;
let lives;
let nextOneUp = 3;
let checkpointX = 80;
let checkpointY = 330;
let invulnerableTimer = 0;
let enemyShots = [];
let starCount = 0;
const melody = [220, 261.63, 329.63, 392, 329.63, 293.66, 246.94, 329.63];
const bassline = [110, 110, 146.83, 146.83, 98, 98, 123.47, 123.47];

function resetGame() {
  player = { x: 80, y: 330, width: 36, height: 54, vx: 0, vy: 0, grounded: false };
  cameraX = 0;
  coins = level.coins.map((coin) => ({ ...coin }));
  enemies = level.enemies.map((enemy) => ({ ...enemy }));
  items = level.items.map((item) => ({ ...item }));
  enemyShots = [];
  starCount = 0;
  level.movingPlatforms.forEach((platform) => {
    platform.x = platform.startX;
    platform.phase = platform.phase % (Math.PI * 2);
  });
  level.crumblePlatforms.forEach((platform) => {
    platform.timer = 0;
    platform.broken = false;
  });
  armored = false;
  lives = 1;
  nextOneUp = 3;
  checkpointX = 80;
  checkpointY = 330;
  level.checkpoints.forEach((checkpoint) => {
    checkpoint.reached = false;
  });
  invulnerableTimer = 0;
  gameState = "playing";
  respawnButton.classList.remove("visible");
  message.textContent = "";
  updateHud();
}

function updateHud() {
  const collected = coins.filter((coin) => coin.collected).length;
  status.textContent = `コイン: ${collected}/${coins.length}　|　星: ${starCount}/3　|　残機: ${lives}　|　${armored ? "アーマー有効（1回耐える）" : "アーマーなし"}`;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

function findRespawnPosition(x, preferredSurfaceY) {
  const platforms = [
    ...level.platforms,
    ...level.stairs,
    ...level.movingPlatforms,
    ...level.hiddenPlatforms,
    ...level.crumblePlatforms.filter((platform) => !platform.broken),
  ];
  const candidates = platforms
    .filter((platform) => x + player.width > platform.x && x < platform.x + platform.width)
    .filter((platform) => !level.water.some((water) => overlaps(
      { x, y: platform.y - player.height, width: player.width, height: player.height },
      water,
    )));
  const platform = candidates.sort(
    (a, b) => Math.abs(a.y - preferredSurfaceY) - Math.abs(b.y - preferredSurfaceY),
  )[0];
  if (!platform) return { x: Math.max(0, x), y: Math.max(0, preferredSurfaceY - player.height) };
  return {
    x: Math.max(platform.x + 6, Math.min(x, platform.x + platform.width - player.width - 6)),
    y: platform.y - player.height,
  };
}

function respawn(useCheckpoint = false) {
  if (invulnerableTimer > 0) return;
  if (armored) {
    armored = false;
    invulnerableTimer = 100;
    player.vx = 0;
    player.vy = -7;
    playTone(180, 0.16, "sawtooth");
    updateHud();
    message.textContent = "アーマーが攻撃を防いだ！";
    return;
  }
  lives -= 1;
  playTone(110, 0.16, "sawtooth");
  if (lives <= 0) {
    gameState = "gameover";
    respawnButton.classList.add("visible");
    message.textContent = "ゲームオーバー。リスタートで再挑戦！";
    updateHud();
    return;
  }
  const checkpointReached = level.checkpoints.some((checkpoint) => checkpoint.reached);
  const spawnX = checkpointReached ? checkpointX : 80;
  const spawnSurfaceY = checkpointReached ? checkpointY : 330 + player.height;
  const spawn = findRespawnPosition(spawnX, spawnSurfaceY);
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  invulnerableTimer = 150;
  enemies = level.enemies.map((enemy) => ({ ...enemy }));
  message.textContent = `ミス！残機が ${lives} になりました。`;
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
  let step = 0;
  const playNote = () => {
    if (!bgmOn) return;
    const now = audioContext.currentTime;
    const play = (frequency, duration, type, volume) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    };
    const beat = step % 16;
    const note = melody[step % melody.length];
    play(note, beat % 4 === 0 ? 0.32 : 0.2, "triangle", 0.04);
    if (beat % 2 === 0) play(bassline[Math.floor(step / 2) % bassline.length], 0.32, "sine", 0.075);
    if (beat % 4 === 0) play(55, 0.14, "sine", 0.11);
    if (beat % 4 === 2) play(82.41, 0.08, "square", 0.035);
    if (beat === 7 || beat === 15) play(note * 2, 0.1, "sawtooth", 0.018);
    step += 1;
  };
  bgmOn = true;
  playNote();
  bgmTimer = setInterval(playNote, 210);
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

function update(delta) {
  if (gameState !== "playing") return;
  const dt = Math.min(delta / 16.67, 2);
  invulnerableTimer = Math.max(0, invulnerableTimer - dt);
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has("ArrowUp") || keys.has("w") || keys.has(" ");

  player.vx = (right ? 4.5 : 0) - (left ? 4.5 : 0);
  if (jump && player.grounded) {
    player.vy = -13;
    player.grounded = false;
    playTone(390, 0.14, "triangle");
  }
  player.vy += GRAVITY * dt;
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x + player.vx * dt));
  player.y += player.vy * dt;
  player.grounded = false;

  const platforms = [
    ...level.platforms,
    ...level.stairs,
    ...level.movingPlatforms,
    ...level.hiddenPlatforms,
    ...level.crumblePlatforms.filter((platform) => !platform.broken),
  ];
  for (const platform of platforms) {
    const wasAbove = player.y + player.height - player.vy * dt <= platform.y;
    if (wasAbove && overlaps(player, platform) && player.vy >= 0) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
      if (level.crumblePlatforms.includes(platform)) {
        platform.timer += dt;
        if (platform.timer > 55) platform.broken = true;
      }
    }
  }
  level.movingPlatforms.forEach((platform) => {
    platform.phase += 0.025 * dt;
    platform.x = platform.startX + Math.sin(platform.phase) * platform.range;
  });
  if (level.water.some((water) => overlaps(player, water))) respawn(true);

  for (const coin of coins) {
    if (!coin.collected && overlaps(player, { x: coin.x - 10, y: coin.y - 10, width: 20, height: 20 })) {
      coin.collected = true;
      const collected = coins.filter((item) => item.collected).length;
      if (collected >= nextOneUp) {
        lives = Math.min(9, lives + 1);
        nextOneUp += 3;
        playTone(880, 0.3, "triangle");
        message.textContent = "コイン3枚達成！1UP！";
      }
      updateHud();
    }
  }
  for (const item of items) {
    if (!item.collected && overlaps(player, { x: item.x - 16, y: item.y - 16, width: 32, height: 32 })) {
      item.collected = true;
      if (item.type === "star") {
        starCount += 1;
        playTone(1047, 0.3, "triangle");
        message.textContent = starCount === 3
          ? "3つの大きな星をコンプリート！"
          : `大きな星を発見！ ${starCount}/3`;
      } else {
        armored = true;
        playTone(760, 0.22, "triangle");
        message.textContent = "アーマー装着！次の1回だけダメージを耐えられます。";
      }
      updateHud();
    }
  }
  for (const checkpoint of level.checkpoints) {
    if (!checkpoint.reached && player.x >= checkpoint.x) {
      checkpoint.reached = true;
      checkpointX = checkpoint.x;
      checkpointY = checkpoint.y;
      playTone(620, 0.25, "triangle");
      message.textContent = "休息地点を見つけた。ここから再開できます。";
    }
  }
  for (const pendulum of level.pendulums) {
    pendulum.angle += pendulum.speed * dt;
    const bobX = pendulum.anchorX + Math.sin(pendulum.angle) * pendulum.length;
    const bobY = pendulum.anchorY + Math.cos(pendulum.angle) * pendulum.length;
    if (invulnerableTimer <= 0 && overlaps(player, {
      x: bobX - pendulum.size,
      y: bobY - pendulum.size,
      width: pendulum.size * 2,
      height: pendulum.size * 2,
    })) {
      respawn();
      break;
    }
  }
  for (const enemy of enemies) {
    if (enemy.hidden) continue;
    if (enemy.type === "chaser") {
      enemy.direction = player.x < enemy.x ? -1 : 1;
      enemy.x += enemy.speed * enemy.direction * dt;
    } else if (enemy.type === "divebird") {
      enemy.phase += 0.05 * dt;
      if (!enemy.dive && Math.abs(player.x - enemy.x) < 230) enemy.dive = true;
      if (enemy.dive) {
        enemy.y += 6 * dt;
        enemy.x += (player.x - enemy.x) * 0.025 * dt;
        if (enemy.y > 430) {
          enemy.y = enemy.baseY;
          enemy.dive = false;
        }
      } else {
        enemy.y = enemy.baseY + Math.sin(enemy.phase) * 18;
        enemy.x += enemy.speed * enemy.direction * dt;
      }
    } else if (enemy.type === "burrower") {
      enemy.timer -= dt;
      if (enemy.timer <= 0) {
        enemy.hidden = !enemy.hidden;
        enemy.timer = enemy.hidden ? 55 : 100;
      }
      if (!enemy.hidden) enemy.x += enemy.speed * enemy.direction * dt;
    } else if (enemy.type === "skyhunter") {
      enemy.y += (player.y - enemy.y) * 0.012 * dt;
      enemy.x += (player.x - enemy.x) * 0.018 * dt;
    } else if (enemy.type === "shooter") {
      enemy.shotTimer -= dt;
      if (enemy.shotTimer <= 0 && Math.abs(player.x - enemy.x) < 560) {
        enemyShots.push({ x: enemy.x, y: enemy.y + 16, width: 12, height: 12, vx: player.x < enemy.x ? -4 : 4 });
        enemy.shotTimer = 95;
      }
    } else {
      enemy.x += enemy.speed * enemy.direction * dt;
      if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.direction *= -1;
    }
    if (enemy.type === "flyer") {
      enemy.phase += 0.07 * dt;
      enemy.y = enemy.baseY + Math.sin(enemy.phase) * 38;
    }
    if (enemy.hidden || invulnerableTimer > 0 || !overlaps(player, enemy)) continue;
    const playerBottom = player.y + player.height;
    const enemyTop = enemy.y;
    const isStomp = !["unstompable", "rare", "shooter"].includes(enemy.type) && player.vy > 0 &&
      playerBottom - player.vy * dt <= enemyTop + 8 &&
      playerBottom >= enemyTop;
    if (isStomp) {
      enemies.splice(enemies.indexOf(enemy), 1);
      player.y = enemyTop - player.height;
      player.vy = -9;
      playTone(240, 0.13, "square");
    } else {
      respawn();
      break;
    }
  }
  for (const shot of enemyShots) shot.x += shot.vx * dt;
  enemyShots = enemyShots.filter((shot) => shot.x > cameraX - 100 && shot.x < cameraX + WIDTH + 100);
  if (invulnerableTimer <= 0 && enemyShots.some((shot) => overlaps(player, shot))) respawn();
  if (player.y > HEIGHT + 80) respawn(true);
  if (overlaps(player, level.goal)) {
    gameState = "won";
    message.textContent = "クリア！すべてのコインを集めると高得点です。";
  }
  cameraX += (player.x - WIDTH * 0.35 - cameraX) * 0.1;
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, cameraX));
}

function draw() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#172554");
  sky.addColorStop(0.42, "#4c1d95");
  sky.addColorStop(0.72, "#be5b70");
  sky.addColorStop(1, "#f3b56b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.translate(-cameraX * 0.12, 0);
  ctx.fillStyle = "#ffdca8";
  ctx.shadowColor = "#ffb86b";
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(760, 150, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgb(255 233 190 / 25%)";
  for (let x = -300; x < WORLD_WIDTH + 600; x += 460) {
    ctx.beginPath();
    ctx.ellipse(x + 80, 125 + (x % 80), 105, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 150, 112 + (x % 80), 75, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#312e63";
  for (let x = -500; x < WORLD_WIDTH + 600; x += 410) {
    ctx.beginPath();
    ctx.moveTo(x, 485);
    ctx.lineTo(x + 145, 300 + (x % 70));
    ctx.lineTo(x + 275, 485);
    ctx.fill();
  }
  ctx.fillStyle = "#201b46";
  for (let x = -400; x < WORLD_WIDTH + 600; x += 230) {
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.lineTo(x + 55, 370 + (x % 45));
    ctx.lineTo(x + 115, 425);
    ctx.lineTo(x + 170, 345 + (x % 55));
    ctx.lineTo(x + 225, 500);
    ctx.fill();
  }
  ctx.fillStyle = "rgb(255 210 170 / 13%)";
  ctx.fillRect(-500, 270, WORLD_WIDTH + 1100, 165);
  ctx.restore();

  ctx.save();
  ctx.translate(-cameraX, 0);
  level.platforms.forEach((platform, index) => {
    const palettes = [
      ["#355c4a", "#243b35"], ["#59636f", "#303943"], ["#76543d", "#422f28"],
      ["#425a73", "#26384c"], ["#66594c", "#39332f"], ["#3d665f", "#244642"],
    ];
    const [top, body] = palettes[index % palettes.length];
    if (platform.hidden) {
      ctx.fillStyle = "#171923";
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.fillStyle = "rgb(15 23 42 / 80%)";
      ctx.fillRect(platform.x, platform.y, platform.width, 8);
      return;
    }
    ctx.fillStyle = top;
    ctx.fillRect(platform.x, platform.y, platform.width, 12);
    ctx.fillStyle = body;
    ctx.fillRect(platform.x, platform.y + 12, platform.width, platform.height - 12);
    ctx.fillStyle = index % 2 ? "rgb(203 213 225 / 24%)" : "rgb(253 186 116 / 22%)";
    for (let x = platform.x + 12; x < platform.x + platform.width; x += 34) {
      ctx.fillRect(x, platform.y + 17 + ((x / 17) % 10), 12 + (index % 3) * 3, 2);
    }
    ctx.fillStyle = "rgb(15 23 42 / 28%)";
    ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
  });
  for (const stair of level.stairs) {
    ctx.fillStyle = "#8b5e3c";
    ctx.fillRect(stair.x, stair.y, stair.width, stair.height);
    ctx.fillStyle = "#d6a56d";
    ctx.fillRect(stair.x, stair.y, stair.width, 5);
  }
  for (const platform of level.hiddenPlatforms) {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "rgb(148 163 184 / 35%)";
    ctx.fillRect(platform.x + 8, platform.y + 5, platform.width - 16, 3);
  }
  for (const platform of level.movingPlatforms) {
    ctx.fillStyle = "#0f766e";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#5eead4";
    ctx.fillRect(platform.x + 8, platform.y + 4, platform.width - 16, 4);
  }
  for (const platform of level.crumblePlatforms) {
    if (platform.broken) continue;
    ctx.fillStyle = platform.timer > 25 ? "#c2410c" : "#a16207";
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "#fed7aa";
    for (let x = platform.x + 10; x < platform.x + platform.width - 5; x += 22) {
      ctx.fillRect(x, platform.y + 5, 10, 3);
    }
  }
  for (const pendulum of level.pendulums) {
    const bobX = pendulum.anchorX + Math.sin(pendulum.angle) * pendulum.length;
    const bobY = pendulum.anchorY + Math.cos(pendulum.angle) * pendulum.length;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pendulum.anchorX, pendulum.anchorY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(pendulum.anchorX, pendulum.anchorY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(bobX, bobY, pendulum.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fecaca";
    ctx.beginPath();
    ctx.arc(bobX - pendulum.size / 3, bobY - pendulum.size / 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const water of level.water) {
    ctx.fillStyle = "#075985";
    ctx.fillRect(water.x, water.y, water.width, water.height);
    ctx.fillStyle = "#38bdf8";
    for (let x = water.x; x < water.x + water.width; x += 28) {
      ctx.fillRect(x + 4, water.y + 6 + ((x / 7) % 5), 16, 3);
    }
  }
  for (const area of level.restAreas) {
    ctx.fillStyle = "rgb(15 23 42 / 45%)";
    ctx.fillRect(area.x, area.y, area.width, 70);
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#fb923c";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(area.x + area.width / 2, area.y + 48);
    ctx.lineTo(area.x + area.width / 2 - 13, area.y + 65);
    ctx.lineTo(area.x + area.width / 2 + 13, area.y + 65);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(area.x + 26, area.y + 18, 8, 28);
    ctx.fillRect(area.x + area.width - 34, area.y + 18, 8, 28);
    ctx.fillStyle = "rgb(254 215 170 / 20%)";
    ctx.fillRect(area.x + 10, area.y + 8, area.width - 20, 4);
  }
  for (const checkpoint of level.checkpoints) {
    ctx.fillStyle = checkpoint.reached ? "#4ade80" : "#64748b";
    ctx.fillRect(checkpoint.x, checkpoint.y - 42, 5, 42);
    ctx.fillStyle = checkpoint.reached ? "#bbf7d0" : "#cbd5e1";
    ctx.beginPath();
    ctx.arc(checkpoint.x + 8, checkpoint.y - 38, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgb(2 6 23 / 78%)";
  ctx.beginPath();
  ctx.arc(8580, 430, 88, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#64748b";
  ctx.fillRect(8500, 425, 18, 25);
  ctx.fillRect(8750, 425, 18, 25);
  for (const coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a16207";
      ctx.stroke();
    }
  }
  for (const item of items) {
    if (item.collected) continue;
    if (item.type === "star") {
      ctx.fillStyle = "#fde047";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const radius = point % 2 === 0 ? 25 : 11;
        const angle = -Math.PI / 2 + point * Math.PI / 5;
        const x = item.x + Math.cos(angle) * radius;
        const y = item.y + Math.sin(angle) * radius;
        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff7ed";
      ctx.beginPath();
      ctx.arc(item.x - 6, item.y - 7, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#fb923c";
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 18);
      ctx.lineTo(item.x + 15, item.y - 8);
      ctx.lineTo(item.x + 11, item.y + 14);
      ctx.lineTo(item.x, item.y + 20);
      ctx.lineTo(item.x - 11, item.y + 14);
      ctx.lineTo(item.x - 15, item.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(item.x - 4, item.y - 5, 8, 12);
    }
  }
  for (const enemy of enemies) {
    const bob = Math.sin((enemy.phase || 0) * 2) * 2;
    ctx.save();
    ctx.translate(enemy.x, enemy.y + (enemy.type === "flyer" ? bob : 0));
    if (enemy.type === "divebird" || enemy.type === "skyhunter") {
      ctx.fillStyle = enemy.type === "divebird" ? "#be123c" : "#1d4ed8";
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(40, 16);
      ctx.lineTo(25, 18);
      ctx.lineTo(38, 30);
      ctx.lineTo(20, 23);
      ctx.lineTo(4, 30);
      ctx.lineTo(15, 18);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(18, 12, 5, 5);
    } else if (enemy.type === "burrower") {
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.moveTo(17, 0); ctx.lineTo(35, 14); ctx.lineTo(30, 40);
      ctx.lineTo(5, 40); ctx.lineTo(0, 14); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(9, 18, 6, 6); ctx.fillRect(21, 18, 6, 6);
    } else if (enemy.type === "shooter") {
      ctx.fillStyle = "#581c87";
      ctx.fillRect(3, 5, 32, 37);
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(10, 13, 18, 7);
      ctx.fillStyle = "#c4b5fd";
      ctx.fillRect(31, 22, 12, 7);
    } else if (enemy.type === "walker") {
      ctx.fillStyle = "#172033";
      ctx.fillRect(4, 9, 24, 26);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(1, 16, 30, 14);
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(8, 14, 5, 5);
      ctx.fillRect(19, 14, 5, 5);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(7, 31, 6, 9);
      ctx.fillRect(20, 31, 6, 9);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 9); ctx.lineTo(3, 2);
      ctx.moveTo(24, 9); ctx.lineTo(29, 2);
      ctx.stroke();
    } else if (enemy.type === "unstompable") {
      ctx.fillStyle = "#334155";
      ctx.fillRect(1, 5, enemy.width - 2, enemy.height - 5);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(5, 10, enemy.width - 10, 8);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(9, 20, 5, 5);
      ctx.fillRect(enemy.width - 14, 20, 5, 5);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, enemy.width, enemy.height);
    } else if (enemy.type === "chaser") {
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.moveTo(2, 35);
      ctx.lineTo(7, 10);
      ctx.lineTo(18, 2);
      ctx.lineTo(30, 10);
      ctx.lineTo(35, 35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(10, 14, 6, 6);
      ctx.fillRect(22, 14, 6, 6);
      ctx.fillStyle = "#fecaca";
      ctx.fillRect(11, 30, 17, 4);
    } else if (enemy.type === "rare") {
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(enemy.width / 2, enemy.height / 2, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff7ed";
      ctx.beginPath();
      ctx.arc(14, 15, 5, 0, Math.PI * 2);
      ctx.arc(30, 15, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#78350f";
      ctx.fillRect(12, 13, 4, 5);
      ctx.fillRect(28, 13, 4, 5);
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(12, 29, 20, 4);
    } else if (enemy.type === "jumper") {
      ctx.fillStyle = "#a21caf";
      ctx.beginPath();
      ctx.moveTo(1, 35);
      ctx.quadraticCurveTo(2, 8, 17, 6);
      ctx.quadraticCurveTo(32, 8, 33, 35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f0abfc";
      ctx.beginPath();
      ctx.moveTo(5, 13); ctx.lineTo(11, 1); ctx.lineTo(16, 11);
      ctx.lineTo(22, 0); ctx.lineTo(28, 14);
      ctx.fill();
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(9, 17, 5, 7);
      ctx.fillRect(21, 17, 5, 7);
      ctx.fillStyle = "#581c87";
      ctx.fillRect(11, 20, 3, 3);
      ctx.fillRect(21, 20, 3, 3);
    } else {
      ctx.fillStyle = "#172554";
      ctx.beginPath();
      ctx.moveTo(19, 3);
      ctx.quadraticCurveTo(37, 6, 36, 22);
      ctx.lineTo(29, 18);
      ctx.lineTo(24, 28);
      ctx.lineTo(17, 20);
      ctx.lineTo(10, 28);
      ctx.lineTo(5, 18);
      ctx.lineTo(0, 22);
      ctx.quadraticCurveTo(0, 6, 19, 3);
      ctx.fill();
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(12, 11, 5, 5);
      ctx.fillRect(21, 11, 5, 5);
      ctx.fillStyle = "#a5b4fc";
      ctx.fillRect(-8, 10, 8, 7);
      ctx.fillRect(36, 10, 8, 7);
    }
    for (const shot of enemyShots) {
      ctx.fillStyle = "#f97316";
      ctx.shadowColor = "#fb923c";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(shot.x + shot.width / 2, shot.y + shot.height / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
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
    ctx.fillRect(player.x + 3, player.y + 4, 30, 50);
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(player.x, player.y + 15, player.width, 31);
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(player.x + 9, player.y + 8, 18, 18);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(player.x + 22, player.y + 15, 5, 5);
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(player.x + 5, player.y, 26, 8);
    if (armored) {
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 34, 0, Math.PI * 2);
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
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w"].includes(key)) {
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
respawnButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(frame);
