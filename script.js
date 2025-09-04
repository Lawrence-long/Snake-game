// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let newDirection = 'right';
let gameSpeed = 5;
let gameInterval;
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gridSize = 20;
let gridWidth, gridHeight;

// 霓虹色调配置
const colors = {
    snakeHead: '#00f3ff',
    snakeBody: '#0099ff',
    food: '#ff0055',
    gridLines: 'rgba(0, 243, 255, 0.1)'
};

// DOM 元素
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const gameOverScreen = document.getElementById('game-over');

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化蛇
    initSnake();
    
    // 生成食物
    generateFood();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 渲染游戏
    render();
}

// 调整画布大小
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // 计算网格尺寸
    gridWidth = Math.floor(canvas.width / gridSize);
    gridHeight = Math.floor(canvas.height / gridSize);
    
    // 如果游戏正在运行，重新渲染
    if (gameRunning && !gamePaused) {
        render();
    }
}

// 初始化蛇
function initSnake() {
    // 蛇初始位置在画布中央
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    
    // 创建蛇身体 (3个单位长)
    snake = [
        {x: centerX, y: centerY},
        {x: centerX - 1, y: centerY},
        {x: centerX - 2, y: centerY}
    ];
    
    // 重置方向
    direction = 'right';
    newDirection = 'right';
}

// 生成食物
function generateFood() {
    // 随机位置
    let foodX, foodY;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        foodX = Math.floor(Math.random() * gridWidth);
        foodY = Math.floor(Math.random() * gridHeight);
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = {x: foodX, y: foodY};
}

// 设置事件监听器
function setupEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 速度控制
    speedSlider.addEventListener('input', updateSpeed);
    
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);
    
    // 移动端触摸控制
    let touchStartX, touchStartY;
    
    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', function(e) {
        if (!touchStartX || !touchStartY) return;
        
        let touchEndX = e.touches[0].clientX;
        let touchEndY = e.touches[0].clientY;
        
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        // 确定滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0 && direction !== 'left') {
                newDirection = 'right';
            } else if (dx < 0 && direction !== 'right') {
                newDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (dy > 0 && direction !== 'up') {
                newDirection = 'down';
            } else if (dy < 0 && direction !== 'down') {
                newDirection = 'up';
            }
        }
        
        touchStartX = null;
        touchStartY = null;
        e.preventDefault();
    }, false);
}

// 处理键盘按键
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') newDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') newDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') newDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') newDirection = 'right';
            break;
        case ' ':
            // 空格键暂停/继续
            togglePause();
            break;
    }
}

// 更新游戏速度
function updateSpeed() {
    gameSpeed = parseInt(speedSlider.value);
    speedValue.textContent = gameSpeed;
    
    // 如果游戏正在运行，重新设置间隔
    if (gameRunning && !gamePaused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / (gameSpeed + 5));
    }
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameInterval = setInterval(gameLoop, 1000 / (gameSpeed + 5));
        startBtn.textContent = '重新开始';
        gameOverScreen.classList.add('hidden');
    } else {
        restartGame();
    }
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    if (gamePaused) {
        // 继续游戏
        gamePaused = false;
        gameInterval = setInterval(gameLoop, 1000 / (gameSpeed + 5));
        pauseBtn.textContent = '暂停';
    } else {
        // 暂停游戏
        gamePaused = true;
        clearInterval(gameInterval);
        pauseBtn.textContent = '继续';
        
        // 显示暂停状态
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00f3ff';
        ctx.font = '30px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('已暂停', canvas.width / 2, canvas.height / 2);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.strokeText('已暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    clearInterval(gameInterval);
    score = 0;
    scoreElement.textContent = '0';
    initSnake();
    generateFood();
    gameOverScreen.classList.add('hidden');
    
    // 重新开始
    gameRunning = true;
    gamePaused = false;
    gameInterval = setInterval(gameLoop, 1000 / (gameSpeed + 5));
    pauseBtn.textContent = '暂停';
}

// 游戏主循环
function gameLoop() {
    // 更新游戏状态
    update();
    
    // 渲染游戏
    render();
}

// 更新游戏状态
function update() {
    // 更新方向
    direction = newDirection;
    
    // 移动蛇
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向更新头部位置
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 处理穿墙
    if (head.x < 0) {
        head.x = gridWidth - 1;
    } else if (head.x >= gridWidth) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = gridHeight - 1;
    } else if (head.y >= gridHeight) {
        head.y = 0;
    }
    
    // 检查自身碰撞
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // 将新头部添加到蛇身体
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += gameSpeed;
        scoreElement.textContent = score;
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 渲染游戏
function render() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = colors.gridLines;
    ctx.lineWidth = 0.5;
    
    // 垂直线
    for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, canvas.height);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(canvas.width, y * gridSize);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        
        // 渐变颜色效果
        const alpha = 1 - (i / snake.length) * 0.6;
        
        ctx.fillStyle = colors.snakeBody;
        ctx.shadowColor = colors.snakeBody;
        ctx.shadowBlur = 10 * alpha;
        
        // 如果是蛇尾（最后一节），绘制成尖尾形状
        if (i === snake.length - 1) {
            const tailX = segment.x * gridSize;
            const tailY = segment.y * gridSize;
            const prevSegment = snake[snake.length - 2];
            
            // 确定蛇尾的方向（基于前一节的位置）
            let tailDirection;
            if (prevSegment.x < segment.x) tailDirection = 'right';
            else if (prevSegment.x > segment.x) tailDirection = 'left';
            else if (prevSegment.y < segment.y) tailDirection = 'down';
            else tailDirection = 'up';
            
            // 绘制尖尾
            ctx.beginPath();
            
            switch(tailDirection) {
                case 'up': // 尾巴朝上
                    ctx.moveTo(tailX + gridSize / 2, tailY);
                    ctx.lineTo(tailX, tailY + gridSize / 2);
                    ctx.lineTo(tailX + gridSize, tailY + gridSize / 2);
                    break;
                case 'down': // 尾巴朝下
                    ctx.moveTo(tailX + gridSize / 2, tailY + gridSize);
                    ctx.lineTo(tailX, tailY + gridSize / 2);
                    ctx.lineTo(tailX + gridSize, tailY + gridSize / 2);
                    break;
                case 'left': // 尾巴朝左
                    ctx.moveTo(tailX, tailY + gridSize / 2);
                    ctx.lineTo(tailX + gridSize / 2, tailY);
                    ctx.lineTo(tailX + gridSize / 2, tailY + gridSize);
                    break;
                case 'right': // 尾巴朝右
                    ctx.moveTo(tailX + gridSize, tailY + gridSize / 2);
                    ctx.lineTo(tailX + gridSize / 2, tailY);
                    ctx.lineTo(tailX + gridSize / 2, tailY + gridSize);
                    break;
            }
            
            ctx.closePath();
            ctx.fill();
        } else {
            // 蛇身部分使用圆角矩形
            roundRect(
                segment.x * gridSize + 1, 
                segment.y * gridSize + 1, 
                gridSize - 2, 
                gridSize - 2, 
                5
            );
        }
    }
    
    // 绘制蛇头
    const head = snake[0];
    ctx.fillStyle = colors.snakeHead;
    ctx.shadowColor = colors.snakeHead;
    ctx.shadowBlur = 15;
    
    // 获取蛇头的位置和大小
    const headX = head.x * gridSize;
    const headY = head.y * gridSize;
    
    // 根据方向绘制三角形蛇头
    ctx.beginPath();
    
    switch(direction) {
        case 'up':
            // 三角形蛇头朝上
            ctx.moveTo(headX + gridSize / 2, headY); // 顶点
            ctx.lineTo(headX, headY + gridSize); // 左下角
            ctx.lineTo(headX + gridSize, headY + gridSize); // 右下角
            break;
        case 'down':
            // 三角形蛇头朝下
            ctx.moveTo(headX + gridSize / 2, headY + gridSize); // 底部顶点
            ctx.lineTo(headX, headY); // 左上角
            ctx.lineTo(headX + gridSize, headY); // 右上角
            break;
        case 'left':
            // 三角形蛇头朝左
            ctx.moveTo(headX, headY + gridSize / 2); // 左侧顶点
            ctx.lineTo(headX + gridSize, headY); // 右上角
            ctx.lineTo(headX + gridSize, headY + gridSize); // 右下角
            break;
        case 'right':
            // 三角形蛇头朝右
            ctx.moveTo(headX + gridSize, headY + gridSize / 2); // 右侧顶点
            ctx.lineTo(headX, headY); // 左上角
            ctx.lineTo(headX, headY + gridSize); // 左下角
            break;
    }
    
    ctx.closePath();
    ctx.fill();
    
    // 绘制蛇的眼睛
    ctx.fillStyle = '#FF0000'; // 红色眼睛
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FF0000';
    
    // 根据方向绘制眼睛
    const eyeSize = gridSize / 6;
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    
    switch(direction) {
        case 'up':
            leftEyeX = headX + gridSize / 4;
            leftEyeY = headY + gridSize / 3;
            rightEyeX = headX + gridSize * 3/4 - eyeSize;
            rightEyeY = headY + gridSize / 3;
            break;
        case 'down':
            leftEyeX = headX + gridSize / 4;
            leftEyeY = headY + gridSize * 2/3 - eyeSize;
            rightEyeX = headX + gridSize * 3/4 - eyeSize;
            rightEyeY = headY + gridSize * 2/3 - eyeSize;
            break;
        case 'left':
            leftEyeX = headX + gridSize / 3;
            leftEyeY = headY + gridSize / 4;
            rightEyeX = headX + gridSize / 3;
            rightEyeY = headY + gridSize * 3/4 - eyeSize;
            break;
        case 'right':
            leftEyeX = headX + gridSize * 2/3 - eyeSize;
            leftEyeY = headY + gridSize / 4;
            rightEyeX = headX + gridSize * 2/3 - eyeSize;
            rightEyeY = headY + gridSize * 3/4 - eyeSize;
            break;
    }
    
    // 绘制圆形眼睛
    ctx.beginPath();
    ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制蛇信子
    ctx.strokeStyle = '#FF3333';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    
    switch(direction) {
        case 'up':
            // 向上的蛇头，信子在底部
            ctx.beginPath();
            ctx.moveTo(headX + gridSize / 2, headY + gridSize);
            ctx.lineTo(headX + gridSize / 2 - gridSize / 6, headY + gridSize + gridSize / 4);
            ctx.moveTo(headX + gridSize / 2, headY + gridSize);
            ctx.lineTo(headX + gridSize / 2 + gridSize / 6, headY + gridSize + gridSize / 4);
            ctx.stroke();
            break;
        case 'down':
            // 向下的蛇头，信子在顶部
            ctx.beginPath();
            ctx.moveTo(headX + gridSize / 2, headY);
            ctx.lineTo(headX + gridSize / 2 - gridSize / 6, headY - gridSize / 4);
            ctx.moveTo(headX + gridSize / 2, headY);
            ctx.lineTo(headX + gridSize / 2 + gridSize / 6, headY - gridSize / 4);
            ctx.stroke();
            break;
        case 'left':
            // 向左的蛇头，信子在右侧
            ctx.beginPath();
            ctx.moveTo(headX, headY + gridSize / 2);
            ctx.lineTo(headX - gridSize / 4, headY + gridSize / 2 - gridSize / 6);
            ctx.moveTo(headX, headY + gridSize / 2);
            ctx.lineTo(headX - gridSize / 4, headY + gridSize / 2 + gridSize / 6);
            ctx.stroke();
            break;
        case 'right':
            // 向右的蛇头，信子在左侧
            ctx.beginPath();
            ctx.moveTo(headX + gridSize, headY + gridSize / 2);
            ctx.lineTo(headX + gridSize + gridSize / 4, headY + gridSize / 2 - gridSize / 6);
            ctx.moveTo(headX + gridSize, headY + gridSize / 2);
            ctx.lineTo(headX + gridSize + gridSize / 4, headY + gridSize / 2 + gridSize / 6);
            ctx.stroke();
            break;
    }
}

// 绘制食物（老鼠）
function drawFood() {
    // 获取食物位置
    const mouseX = food.x * gridSize;
    const mouseY = food.y * gridSize;
    
    // 脉动效果
    const time = new Date().getTime();
    const pulseFactor = 1 + 0.05 * Math.sin(time / 300);
    
    // 老鼠身体颜色
    ctx.fillStyle = '#888888'; // 灰色老鼠身体
    ctx.shadowColor = colors.food;
    ctx.shadowBlur = 10;
    
    // 绘制老鼠身体（椭圆形）
    ctx.beginPath();
    ctx.ellipse(
        mouseX + gridSize / 2,
        mouseY + gridSize / 2,
        gridSize / 2 * pulseFactor,
        gridSize / 3 * pulseFactor,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制老鼠头部（圆形）
    ctx.beginPath();
    ctx.arc(
        mouseX + gridSize * 0.7,
        mouseY + gridSize / 2,
        gridSize / 4 * pulseFactor,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制老鼠耳朵
    ctx.beginPath();
    ctx.arc(
        mouseX + gridSize * 0.7,
        mouseY + gridSize / 3,
        gridSize / 6 * pulseFactor,
        0,
        Math.PI * 2
    );
    ctx.arc(
        mouseX + gridSize * 0.7,
        mouseY + gridSize * 2/3,
        gridSize / 6 * pulseFactor,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制老鼠眼睛
    ctx.fillStyle = '#FF0000'; // 红色眼睛
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(
        mouseX + gridSize * 0.8,
        mouseY + gridSize * 0.4,
        gridSize / 10,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制老鼠尾巴
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    
    // 尾巴是一条曲线
    ctx.beginPath();
    ctx.moveTo(mouseX + gridSize * 0.3, mouseY + gridSize / 2);
    
    // 尾巴摆动效果
    const tailWag = Math.sin(time / 200) * 0.2;
    ctx.quadraticCurveTo(
        mouseX, mouseY + gridSize * (0.5 + tailWag),
        mouseX - gridSize * 0.3, mouseY + gridSize * (0.5 + tailWag * 2)
    );
    ctx.stroke();
}

// 绘制圆角矩形
function roundRect(x, y, width, height, radius) {
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

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);