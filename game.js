// ピースクラス
class Piece {
    constructor(type) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(SHAPES[type])); // ディープコピー
        this.color = COLORS[type];
        this.x = Math.floor(BOARD_CONFIG.COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    // ピースを描画
    draw(ctx) {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const drawX = (this.x + x) * BOARD_CONFIG.BLOCK_SIZE;
                    const drawY = (this.y + y) * BOARD_CONFIG.BLOCK_SIZE;
                    drawBlock(ctx, drawX, drawY, this.color);
                }
            });
        });
    }

    // ピースを回転
    rotate() {
        const newShape = this.shape[0].map((_, i) =>
            this.shape.map(row => row[i]).reverse()
        );
        return newShape;
    }
}

// ゲームクラス
class Game {
    constructor() {
        console.log('Game constructor開始');
        this.board = new Board();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.nextCanvas = document.getElementById('next');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        console.log('Game初期化中...');
        this.init();
        console.log('Game初期化完了');
    }

    // ゲーム初期化
    init() {
        this.nextPiece = this.createRandomPiece();
        this.spawnNewPiece();
        this.drawNextPiece();
        this.updateDisplay();
    }

    // ランダムなピースを生成
    createRandomPiece() {
        const randomType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
        return new Piece(randomType);
    }

    // 新しいピースを出現させる
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();

        // ゲームオーバー判定
        if (this.board.isCollision(this.currentPiece)) {
            this.gameOver();
        }
    }

    // 次のピースを描画
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * BOARD_CONFIG.BLOCK_SIZE) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * BOARD_CONFIG.BLOCK_SIZE) / 2;

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const drawX = offsetX + x * BOARD_CONFIG.BLOCK_SIZE;
                    const drawY = offsetY + y * BOARD_CONFIG.BLOCK_SIZE;
                    drawBlock(this.nextCtx, drawX, drawY, this.nextPiece.color);
                }
            });
        });
    }

    // ゲームループ
    update(timestamp) {
        if (!this.isPlaying || this.isPaused) return;

        const deltaTime = timestamp - this.lastDropTime;

        if (deltaTime > this.dropInterval) {
            this.moveDown();
            this.lastDropTime = timestamp;
        }

        this.draw();
    }

    // 画面を描画
    draw() {
        this.board.draw();
        if (this.currentPiece) {
            this.currentPiece.draw(this.board.ctx);
        }
    }

    // ピースを下に移動
    moveDown() {
        if (!this.board.isCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lockPiece();
        }
    }

    // ピースを固定
    lockPiece() {
        this.board.merge(this.currentPiece);
        const clearedLines = this.board.clearLines();
        
        if (clearedLines > 0) {
            this.updateScore(clearedLines);
        }
        
        this.spawnNewPiece();
    }

    // スコア更新
    updateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        this.lines += linesCleared;
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        
        this.updateDisplay();
    }

    // 表示を更新
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }

    // ゲーム開始
    start() {
        console.log('ゲーム開始が呼ばれました');
        this.isPlaying = true;
        this.isPaused = false;
        this.lastDropTime = performance.now();
        console.log('isPlaying:', this.isPlaying);
        console.log('lastDropTime:', this.lastDropTime);
        this.draw(); // 即座に描画
    }

    // ゲーム一時停止
    pause() {
        this.isPaused = !this.isPaused;
        console.log('ポーズ:', this.isPaused);
    }

    // ゲームリセット
    reset() {
        console.log('ゲームリセット');
        this.board.clear();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.isPlaying = false;
        this.isPaused = false;
        this.init();
        this.updateDisplay();
    }

    // ゲームオーバー
    gameOver() {
        this.isPlaying = false;
        alert('ゲームオーバー！\nスコア: ' + this.score + '\nライン: ' + this.lines);
        this.reset();
    }
}
