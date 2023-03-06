let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

let game = {
    isRunning: false,
    brickWidth: 65,
    brickHeight: 20
};

let player = {
    width: 160,
    height: 20,
    x: canvas.width / 2
};

let ball = {
    radius: 12,
    x: canvas.width / 2,
    y: canvas.height - player.height - 12,
    startVx: 6,
    startVy: -6,
    vx: 6,
    vy: -6
};
ball.speed = Math.sqrt(ball.startVx * ball.startVx + ball.startVy * ball.startVy);

let bricks = [];
for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 7; j++) {
        bricks.push({
            x: 38 + j * (game.brickWidth + 1),
            y: 108 + i * (game.brickHeight + 1),
            hp: 3 - Math.floor(i / 2)
        });
    }
}

function update() {
    handleCollisions();
    updateBall();
    handleGameEvents();
}

function handleCollisions() {
    //left/right sides
    if (ball.x - ball.radius <= 0 && ball.vx < 0 ||
        ball.x + ball.radius >= canvas.width && ball.vx > 0) {
        ball.vx = -ball.vx;
    }

    //top side
    if (ball.y - ball.radius <= 0 && ball.vy < 0) {
        ball.vy = -ball.vy;
    }

    //player
    if (ball.y + ball.radius >= canvas.height - player.height && ball.vy > 0 && ball.x >= player.x - player.width / 2 && ball.x <= player.x + player.width / 2) {
        if (ball.x >= player.x - player.width / 2 && ball.x < player.x - (2 / 3) * player.width / 2) {
            ball.vx = -ball.speed * Math.cos(Math.PI / 6);
            ball.vy = -ball.speed * Math.sin(Math.PI / 6);
        }
        else if (ball.x >= player.x - (2 / 3) * player.width / 2 && ball.x < player.x - (1 / 3) * player.width / 2) {
            ball.vx = -ball.startVx;
            ball.vy = ball.startVy;
        }
        else if (ball.x >= player.x - (1 / 3) * player.width / 2 && ball.x <= player.x) {
            ball.vx = -ball.speed * Math.cos(Math.PI / 3);
            ball.vy = -ball.speed * Math.sin(Math.PI / 3);
        }
        else if (ball.x <= player.x + player.width / 2 && ball.x > player.x + (2 / 3) * player.width / 2) {
            ball.vx = ball.speed * Math.cos(Math.PI / 6);
            ball.vy = -ball.speed * Math.sin(Math.PI / 6);
        }
        else if (ball.x <= player.x + (2 / 3) * player.width / 2 && ball.x > player.x + (1 / 3) * player.width / 2) {
            ball.vx = ball.startVx;
            ball.vy = ball.startVy;
        }
        else if (ball.x <= player.x + (1 / 3) * player.width / 2 && ball.x > player.x) {
            ball.vx = ball.speed * Math.cos(Math.PI / 3);
            ball.vy = -ball.speed * Math.sin(Math.PI / 3);
        }
    }

    //bricks
    for (let brick of bricks) {
        let x1 = brick.x;
        let y1 = brick.y;
        let x2 = x1 + game.brickWidth;
        let y2 = y1 + game.brickHeight;

        if (ball.x >= x1 && ball.x <= x2 &&
            (ball.vy < 0 && ball.y - ball.radius <= y2 && ball.y - ball.radius >= y1 ||
                ball.vy > 0 && ball.y + ball.radius >= y1 && ball.y + ball.radius <= y2)) {
            ball.vy = -ball.vy;
            updateBrick(brick);
            break;
        }

        if (ball.y >= y1 && ball.y <= y2 &&
            (ball.vx < 0 && ball.x - ball.radius <= x2 && ball.x - ball.radius >= x1 ||
                ball.vx > 0 && ball.x + ball.radius >= x1 && ball.x + ball.radius <= x2)) {
            updateBrick(brick);
            ball.vx = -ball.vx;
            break;
        }
    }
}

function updateBrick(brick) {
    if (--brick.hp == 0) {
        bricks.splice(bricks.indexOf(brick), 1);
    }
}

function updateBall() {
    if (game.isRunning) {
        ball.x += ball.vx;
        ball.y += ball.vy;
    }
}

function handleGameEvents() {
    if (game.isRunning && ball.y > canvas.height - player.height) {
        game.isRunning = false;

        ball.x = player.x;
        ball.y = canvas.height - player.height - 12;
        ball.vx = ball.startVx;
        ball.vy = ball.startVy;
    }
}

function draw() {
    clear();
    drawPlayer();
    drawBall();
    drawBricks();
}

function drawPlayer() {
    ctx.beginPath();
    ctx.fillStyle = "lightgray";
    ctx.rect(player.x - player.width / 2, canvas.height - player.height, player.width, player.height);
    ctx.fill();
    ctx.stroke();
}

function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = "lightgray";
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawBricks() {
    for (let brick of bricks) {
        drawBrick(brick);
    }
}

function drawBrick(brick) {
    ctx.beginPath();
    ctx.fillStyle = brick.hp == 3
        ? "gray"
        : brick.hp == 2
            ? "darkgray"
            : "lightgray";
    ctx.rect(brick.x, brick.y, game.brickWidth, game.brickHeight);
    ctx.fill();
    ctx.stroke();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", e => {
    let x = e.offsetX;

    if (x < player.width / 2) {
        x = player.width / 2;
    }
    else if (x > canvas.width - player.width / 2) {
        x = canvas.width - player.width / 2;
    }

    player.x = x;

    if (!game.isRunning) {
        ball.x = x;
    }
});

canvas.addEventListener("click", e => {
    game.isRunning = true;
});

gameLoop();