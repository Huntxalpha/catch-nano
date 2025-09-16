// JavaScript for Catch Nano game

// Grab DOM elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const shareButton = document.getElementById('share-button');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('final-score');

// Game state variables
let gameActive = false;
let basket;
let items = [];
let score = 0;
let lives = 3;
let lastSpawn = 0;
let spawnInterval = 1000; // spawn every second

// Basket initialization
function initBasket() {
  return {
    width: 80,
    height: 20,
    x: (canvas.width - 80) / 2,
    y: canvas.height - 40,
    speed: 6
  };
}

// Item factory
function createItem() {
  // 20% chance for bomb, 80% for fruit
  const isBomb = Math.random() < 0.2;
  return {
    x: Math.random() * (canvas.width - 20) + 10,
    y: -20,
    size: 20,
    speed: 2 + Math.random() * 2,
    type: isBomb ? 'bomb' : 'fruit'
  };
}

// Keyboard input handling
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Pointer/mouse control for basket
function handlePointer(e) {
  if (!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  const posX = e.clientX - rect.left;
  basket.x = Math.max(0, Math.min(canvas.width - basket.width, posX - basket.width / 2));
}
canvas.addEventListener('mousemove', handlePointer);
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  handlePointer({ clientX: touch.clientX });
}, { passive: false });

// Reset game state
function resetGame() {
  score = 0;
  lives = 3;
  items = [];
  basket = initBasket();
  lastSpawn = performance.now();
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
}

// Start the game
function startGame() {
  resetGame();
  gameActive = true;
  startOverlay.style.display = 'none';
  endOverlay.style.display = 'none';
  requestAnimationFrame(gameLoop);
}

// End the game
function endGame() {
  gameActive = false;
  finalScoreDisplay.textContent = score;
  endOverlay.style.display = 'flex';
  // Build share link
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("J'ai marqué " + score + " points sur #CatchNano ! Attrape les fruits toi aussi !");
  shareButton.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

// Update and draw the basket
function updateBasket() {
  // Keyboard control
  if (keys['ArrowLeft'] || keys['Left']) {
    basket.x -= basket.speed;
  }
  if (keys['ArrowRight'] || keys['Right']) {
    basket.x += basket.speed;
  }
  // Boundaries
  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
  // Draw basket
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// Spawn items based on interval
function spawnItems(timestamp) {
  if (timestamp - lastSpawn > spawnInterval) {
    items.push(createItem());
    lastSpawn = timestamp;
  }
}

// Update and draw items
function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.y += item.speed;
    // Draw item
    if (item.type === 'fruit') {
      ctx.fillStyle = '#f1c40f';
    } else {
      ctx.fillStyle = '#e74c3c';
    }
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
    ctx.fill();
    // Collision with basket
    if (item.y + item.size / 2 >= basket.y && item.y - item.size / 2 <= basket.y + basket.height) {
      if (item.x + item.size / 2 >= basket.x && item.x - item.size / 2 <= basket.x + basket.width) {
        // Hit
        if (item.type === 'fruit') {
          score++;
        } else {
          lives--;
        }
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        items.splice(i, 1);
        continue;
      }
    }
    // Out of bounds
    if (item.y - item.size / 2 > canvas.height) {
      if (item.type === 'fruit') {
        lives--;
        livesDisplay.textContent = lives;
      }
      items.splice(i, 1);
    }
  }
}

// Main game loop
function gameLoop(timestamp) {
  if (!gameActive) return;
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Spawn items
  spawnItems(timestamp);
  // Update and draw items
  updateItems();
  // Update and draw basket
  updateBasket();
  // Check game over
  if (lives <= 0) {
    endGame();
    return;
  }
  requestAnimationFrame(gameLoop);
}

// Event listeners for buttons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
  resetGame();
  startGame();
});

// Initialize state when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  basket = initBasket();
});
