// 盤面を管理するクラス
class Board {
    constructor() {
        this.grid = this.createEmptyBoard();
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
    }

    // 空の盤面を作成
    createEmptyBoard() {
        return Array.from({ length: BOARD_CONFIG.ROWS }, () => 
            Array(BOARD_CONFIG.COLS).fill(0)
        );
    }

    // 盤面をクリア
    clear() {
        this.grid = this.createEmptyBoard();
    }

    // 盤面を描画
    draw() {
        // 背景をクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッド線を描画
        drawGrid(this.ctx, this.canvas.width, this.canvas.height);
        
        // 固定されたブロックを描画
        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
            for (let col = 0; col < BOARD_CONFIG.COLS; col++) {
                if (this.grid[row][col]) {
                    const x = col * BOARD_CONFIG.BLOCK_SIZE;
                    const y = row * BOARD_CONFIG.BLOCK_SIZE;
                    drawBlock(this.ctx, x, y, this.grid[row][col]);
                }
            }
        }
    }

    // ブロックを盤面に固定
    merge(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0 && boardY < BOARD_CONFIG.ROWS && 
                        boardX >= 0 && boardX < BOARD_CONFIG.COLS) {
                        this.grid[boardY][boardX] = piece.color;
                    }
                }
            });
        });
    }

    // 衝突判定
    isCollision(piece, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    // 壁との衝突
                    if (newX < 0 || newX >= BOARD_CONFIG.COLS || newY >= BOARD_CONFIG.ROWS) {
                        return true;
                    }
                    
                    // 固定されたブロックとの衝突
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // ラインを消去してスコアを返す
    clearLines() {
        let linesCleared = 0;
        
        for (let row = BOARD_CONFIG.ROWS - 1; row >= 0; row--) {
            // 行が全て埋まっているかチェック
            if (this.grid[row].every(cell => cell !== 0)) {
                // 行を削除
                this.grid.splice(row, 1);
                // 上に新しい空行を追加
                this.grid.unshift(Array(BOARD_CONFIG.COLS).fill(0));
                linesCleared++;
                row++; // 同じ行を再チェック
            }
        }
        
        return linesCleared;
    }

    // ゲームオーバー判定
    isGameOver() {
        // 一番上の行にブロックがあるかチェック
        return this.grid[0].some(cell => cell !== 0);
    }

    // 盤面の状態を取得
    getGrid() {
        return this.grid;
    }
}
