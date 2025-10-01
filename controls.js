// キーボード操作を管理するクラス
class Controls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.setupKeyboardControls();
        this.setupButtonControls();
    }

    // キーボード操作の設定
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.game.isPlaying || this.game.isPaused) return;

            // 同じキーの連続入力を防ぐ
            if (this.keys[e.code]) return;
            this.keys[e.code] = true;

            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveDown();
                    break;
                case 'ArrowUp':
                case 'Space':
                    e.preventDefault();
                    this.rotate();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // ボタン操作の設定
    setupButtonControls() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        startBtn.addEventListener('click', () => {
            if (!this.game.isPlaying) {
                this.game.reset();
                this.game.start();
                startBtn.textContent = 'リスタート';
            } else {
                this.game.reset();
                this.game.start();
            }
        });

        pauseBtn.addEventListener('click', () => {
            if (this.game.isPlaying) {
                this.game.pause();
                pauseBtn.textContent = this.game.isPaused ? '再開' : 'ポーズ';
            }
        });
    }

    // 左に移動
    moveLeft() {
        if (!this.game.board.isCollision(this.game.currentPiece, -1, 0)) {
            this.game.currentPiece.x--;
            this.game.draw();
        }
    }

    // 右に移動
    moveRight() {
        if (!this.game.board.isCollision(this.game.currentPiece, 1, 0)) {
            this.game.currentPiece.x++;
            this.game.draw();
        }
    }

    // 下に移動（高速落下）
    moveDown() {
        if (!this.game.board.isCollision(this.game.currentPiece, 0, 1)) {
            this.game.currentPiece.y++;
            this.game.draw();
            // スコアに少し加算
            this.game.score += 1;
            this.game.updateDisplay();
        }
    }

    // 回転
    rotate() {
        const rotatedShape = this.game.currentPiece.rotate();
        const originalShape = this.game.currentPiece.shape;
        
        // 回転後の形状を一時的に設定
        this.game.currentPiece.shape = rotatedShape;
        
        // 壁蹴り（Wall Kick）の実装
        let kicked = false;
        const kicks = [0, 1, -1, 2, -2];
        
        for (let kick of kicks) {
            if (!this.game.board.isCollision(this.game.currentPiece, kick, 0)) {
                this.game.currentPiece.x += kick;
                kicked = true;
                break;
            }
        }
        
        // 回転できない場合は元に戻す
        if (!kicked) {
            this.game.currentPiece.shape = originalShape;
        }
        
        this.game.draw();
    }

    // タッチ操作の設定（モバイル対応）
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.game.isPlaying || this.game.isPaused) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // スワイプの方向を判定
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 横スワイプ
                if (diffX > 30) {
                    this.moveRight();
                } else if (diffX < -30) {
                    this.moveLeft();
                }
            } else {
                // 縦スワイプ
                if (diffY > 30) {
                    this.moveDown();
                } else if (diffY < -30) {
                    this.rotate();
                }
            }
        });
    }
}
