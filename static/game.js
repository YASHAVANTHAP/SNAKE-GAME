document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const difficultyScreen = document.getElementById('difficultyScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const playAgainButton = document.getElementById('playAgainButton');
    const finalScore = document.getElementById('finalScore');
    const highestScore = document.getElementById('highestScore');
    const difficultyButtons = document.querySelectorAll('.difficulty-button');

    const gridSize = 20;
    const canvasSize = canvas.width;

    let snake, direction, food, score, highScore, gameSpeed;

    fetch('/get_high_score')
        .then(response => response.json())
        .then(data => {
            highScore = data.score;
            showDifficultyScreen();
        });

    difficultyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            gameSpeed = parseInt(event.target.dataset.speed);
            initGame();
        });
    });

    function showDifficultyScreen() {
        difficultyScreen.style.display = 'block';
    }

    function initGame() {
        difficultyScreen.style.display = 'none';
        snake = [
            { x: gridSize * 5, y: gridSize * 5 },
            { x: gridSize * 4, y: gridSize * 5 },
            { x: gridSize * 3, y: gridSize * 5 },
        ];
        direction = 'RIGHT';
        food = { x: gridSize * 10, y: gridSize * 10 };
        score = 0;

        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block';
        gameLoop();
    }

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'DOWN') direction = 'UP';
                break;
            case 'ArrowDown':
                if (direction !== 'UP') direction = 'DOWN';
                break;
            case 'ArrowLeft':
                if (direction !== 'RIGHT') direction = 'LEFT';
                break;
            case 'ArrowRight':
                if (direction !== 'LEFT') direction = 'RIGHT';
                break;
        }
    });

    playAgainButton.addEventListener('click', () => {
        showDifficultyScreen();
    });

    function gameLoop() {
        if (update()) {
            draw();
            setTimeout(gameLoop, gameSpeed);
        } else {
            endGame();
        }
    }

    function update() {
        const head = { ...snake[0] };

        switch (direction) {
            case 'UP':
                head.y -= gridSize;
                break;
            case 'DOWN':
                head.y += gridSize;
                break;
            case 'LEFT':
                head.x -= gridSize;
                break;
            case 'RIGHT':
                head.x += gridSize;
                break;
        }

        if (head.x === food.x && head.y === food.y) {
            food = {
                x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
            };
            score += 10;
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            submitScore(score);
            return false;
        }

        snake.unshift(head);
        return true;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the food
        ctx.fillStyle = 'red';
        drawCircle(ctx, food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2);

        // Draw the snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#76FF03'; // Head of the snake in a different color
            drawRoundedRect(ctx, segment.x, segment.y, gridSize, gridSize, 5);
            ctx.strokeStyle = '#388E3C';
            ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
        });
    }

    function drawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawRoundedRect(ctx, x, y, width, height, radius) {
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
        ctx.fill();
    }

    function submitScore(score) {
        fetch('/submit_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: score }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetch('/get_high_score')
                    .then(response => response.json())
                    .then(data => {
                        highScore = data.score;
                        finalScore.innerText = `Your Score: ${score}`;
                        highestScore.innerText = `High Score: ${highScore}`;
                    });
            }
        });
    }

    function endGame() {
        canvas.style.display = 'none';
        gameOverScreen.style.display = 'block';
    }
});