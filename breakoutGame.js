const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let rightPressed = false;
let leftPressed = false;
let score = 0;

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 2,
  dy: -2,
  radius: 10,
};

const balls = [
  {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2,
    radius: 10,
  },
];

const paddle = {
  height: 10,
  width: 75,
  x: (canvas.width - 75) / 2,
  speed: 7,
};

const bricks = {
  rowCount: 3,
  columnCount: 6,
  width: 75,
  height: 20,
  padding: 10,
  offsetTop: 30,
  offsetLeft: 30,
  colors: ["#80CBC4"],
};

const brickRowCount = 3;
const brickColumnCount = 6;

const powerUpTypes = ["multiball", "speedboost"];
function spawnPowerUp(x, y) {
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  powerUps.push({ x, y, dy: 2, width: 20, height: 20, type });
}

// パワーアップアイテムの効果を適用する関数
function applyPowerUp(powerUp) {
  if (powerUp.type === "multiball") {
    addBall();
  } else if (powerUp.type === "speedboost") {
    paddle.speed *= 2;
    setTimeout(() => {
      paddle.speed /= 2;
    }, 5000);
  }
}

let timeLeft = 60;

// タイムリミットを描画する関数
function drawTimeLeft() {
  ctx.font = "16px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.fillText("Time Left: " + timeLeft, canvas.width - 150, 20);
}

function checkGameOver() {
  if (timeLeft <= 0) {
    alert("GAME OVER: Time Up!");
    resetGame();
  }
}
function checkGameClear() {
  if (score === brickRowCount * brickColumnCount) {
    alert("GAME CLEAR: You broke all the bricks!");
    resetGame();
  }
}

let brickArray = [];

for (let r = 0; r < bricks.rowCount; r++) {
  brickArray[r] = [];
  for (let c = 0; c < bricks.columnCount; c++) {
    brickArray[r][c] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function drawScore() {
  ctx.font = "16px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawBall() {
  balls.forEach((ball) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      ball.x,
      ball.y,
      0,
      ball.x,
      ball.y,
      ball.radius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "#80CBC4"); // ブロックの色と同じにする
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}

function addBall() {
  balls.push({
    x: paddle.x + paddle.width / 2,
    y: canvas.height - 30,
    dx: 2 * (Math.random() > 0.5 ? 1 : -1),
    dy: -2,
    radius: 10,
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBricks() {
  for (let r = 0; r < bricks.rowCount; r++) {
    for (let c = 0; c < bricks.columnCount; c++) {
      const b = brickArray[r][c];
      if (b.status === 1) {
        const brickX = c * (bricks.width + bricks.padding) + bricks.offsetLeft;
        const brickY = r * (bricks.height + bricks.padding) + bricks.offsetTop;
        b.x = brickX;
        b.y = brickY;
        roundRect(ctx, brickX, brickY, bricks.width, bricks.height, 5);
        const gradient = ctx.createLinearGradient(
          brickX,
          brickY,
          brickX,
          brickY + bricks.height
        );
        gradient.addColorStop(0, bricks.colors[0]); // 一色に統一
        gradient.addColorStop(1, "#000");
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
  }
}

function drawPaddle() {
  roundRect(
    ctx,
    paddle.x,
    canvas.height - paddle.height,
    paddle.width,
    paddle.height,
    5
  );
  const gradient = ctx.createLinearGradient(
    paddle.x,
    canvas.height - paddle.height,
    paddle.x,
    canvas.height
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#80CBC4"); // ブロックの色と同じにする
  ctx.fillStyle = gradient;
  ctx.fill();
}

function collisionDetection() {
  balls.forEach((ball) => {
    for (let r = 0; r < bricks.rowCount; r++) {
      for (let c = 0; c < bricks.columnCount; c++) {
        const b = brickArray[r][c];
        if (b.status === 1) {
          if (
            ball.x > b.x &&
            ball.x < b.x + bricks.width &&
            ball.y > b.y &&
            ball.y < b.y + bricks.height
          ) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++; // スコアを増やす
            paddle.speed *= 1.01; // パドルの速度を徐々に上げる

            // パワーアップアイテムを追加する確率 (この場合、20%)
            if (Math.random() < 0.2) {
              spawnPowerUp(b.x, b.y);
            }
          }
        }
      }
    }
  });
}

function gameOver() {
  ctx.font = "24px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.fillText("Game Over", canvas.width / 2 - 60, canvas.height / 2);
}

function gameClear() {
  ctx.font = "24px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.fillText("You Win!", canvas.width / 2 - 40, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore(); // スコアを描画
  drawPowerUps(); // パワーアップアイテムを描画
  drawTimeLeft(); // タイムリミットを描画
  collisionDetection();
  collisionDetectionPowerUps(); // パワーアップアイテムの衝突検出を行う
  moveBall(); // ボールの座標を更新する

  checkGameClear(); // ゲームクリアをチェックする

  if (
    ball.x + ball.dx < ball.radius ||
    ball.x + ball.dx > canvas.width - ball.radius
  ) {
    ball.dx = -ball.dx;
  }

  if (ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > canvas.height - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.dy = -ball.dy;
    } else {
      gameOver();
      return;
    }
  }

  let allBricksDestroyed = true;
  for (let r = 0; r < bricks.rowCount; r++) {
    for (let c = 0; c < bricks.columnCount; c++) {
      allBricksDestroyed = allBricksDestroyed && brickArray[r][c].status === 0;
    }
  }

  if (allBricksDestroyed) {
    gameClear();
    return;
  }

  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += 7;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= 7;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  requestAnimationFrame(draw);
}

const powerUps = [];
const interval = setInterval(function () {
  timeLeft--;
  checkGameOver();
}, 1000);

function spawnPowerUp(x, y) {
  powerUps.push({ x, y, dy: 2, width: 20, height: 20 });
}
function moveBall() {
  balls.forEach((ball) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // ボールが左右の壁に衝突した場合
    if (
      ball.x + ball.dx > canvas.width - ball.radius ||
      ball.x + ball.dx < ball.radius
    ) {
      ball.dx = -ball.dx;
    }

    // ボールが上の壁に衝突した場合
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      // ボールがパドルに当たった場合
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
      } else {
        // ボールが下の壁に衝突した場合
        clearInterval(interval);
        alert("GAME OVER");
        document.location.reload();
      }
    }
  });
}

function resetGame() {
  clearInterval(interval);
  initBricks();
  balls = [
    {
      x: canvas.width / 2,
      y: canvas.height - 30,
      dx: 2,
      dy: -2,
      radius: 10,
    },
  ];
  paddle.x = (canvas.width - paddle.width) / 2;
  score = 0;
  timeLeft = 60;
  powerUps = [];
  requestAnimationFrame(draw);
}

function drawPowerUps() {
  powerUps.forEach((powerUp, index) => {
    roundRect(ctx, powerUp.x, powerUp.y, powerUp.width, powerUp.height, 5);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    powerUp.y += powerUp.dy;
    if (powerUp.y > canvas.height) {
      powerUps.splice(index, 1);
    }
  });
}

function collisionDetectionPowerUps() {
  powerUps.forEach((powerUp, index) => {
    if (
      powerUp.y + powerUp.height > canvas.height - paddle.height &&
      powerUp.x + powerUp.width > paddle.x &&
      powerUp.x < paddle.x + paddle.width
    ) {
      paddle.width += 20;
      powerUps.splice(index, 1);
    }
  });
}

draw();
