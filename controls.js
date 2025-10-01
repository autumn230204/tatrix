// キーボード操作を管理するクラス
class Controls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyTimers = {};
        this.DAS = 110; // Delayed Auto Shift: 110ms
        this.ARR = 0; // Auto Repeat Rate: 0ms（瞬時に移動）
        this.setupKeyboardControls();
        this.setupButtonControls();
    }

    // キーボード操作の設定
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // スペースキーでゲーム開始/リスタート
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.game.isPlaying) {
                    this.game.reset();
                    this.game.start();
                    document.getElementById('startBtn').textContent = 'リスタート';
                } else {
                    this.game.reset();
                    this.game.start();
                }
                return;
            }

            if (!this.game.isPlaying || this.game.isPaused) return;

            // 最初の入力
            if (!this.keys[e.code]) {
                this.keys[e.code] = true;
                this.keyTimers[e.code] = Date.now();

                switch(e.code) {
                    case 'KeyA': // 左移動
                        e.preventDefault();
                        this.moveLeft();
                        this.startAutoRepeat(e.code, () => this.moveLeft());
                        break;
                    case 'KeyD': // 右移動
                        e.preventDefault();
                        this.moveRight();
                        this.startAutoRepeat(e.code, () => this.moveRight());
                        break;
                    case 'KeyK': // 高速落下
                        e.preventDefault();
                        this.moveDown();
                        this.startAutoRepeat(e.code, () => this.moveDown());
                        break;
                    case 'KeyI': // ハードドロップ
                        e.preventDefault();
                        this.hardDrop();
                        break;
                    case 'KeyJ': // 左回転（反時計回り）
                        e.preventDefault();
                        this.rotateLeft();
                        break;
                    case 'KeyL': // 右回転（時計回り）
                        e.preventDefault();
                        this.rotateRight();
                        break;
                    case 'KeyW': // 180度回転
                        e.preventDefault();
                        this.rotate180();
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (this.keyTimers[e.code]) {
                clearTimeout(this.keyTimers[e.code]);
                delete this.keyTimers[e.code];
            }
        });
    }

    // DAS機能：キー長押しで自動リピート
    startAutoRepeat(keyCode, action) {
        setTimeout(() => {
            if (this.keys[keyCode]) {
                const repeatAction = () => {
                    if (this.keys[keyCode]) {
                        action();
                        if (this.ARR === 0) {
                            // ARR=0の場合、壁まで瞬時に移動
                            setTimeout(repeatAction, 0);
                        } else {
                            setTimeout(repeatAction, this.ARR);
                        }
                    }
                };
                repeatAction();
            }
        }, this.DAS);
    }

    // ボタン操作の設定
    setupButtonControls() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        if (startBtn) {
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
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.game.isPlaying) {
                    this.game.pause();
                    pauseBtn.textContent = this.game.isPaused ? '再開' : 'ポーズ';
                }
            });
        }
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

    // ハードドロップ（一気に下まで落とす）
    hardDrop() {
        let dropDistance = 0;
        while (!this.game.board.isCollision(this.game.currentPiece, 0, 1)) {
            this.game.currentPiece.y++;
            dropDistance++;
        }
        // ハードドロップのスコア加算（距離×2）
        this.game.score += dropDistance * 2;
        this.game.updateDisplay();
        this.game.lockPiece();
        this.game.draw();
    }

    // 右回転（時計回り）
    rotateRight() {
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

    // 左回転（反時計回り）
    rotateLeft() {
        // 3回右回転 = 左回転
        for (let i = 0; i < 3; i++) {
            const rotatedShape = this.game.currentPiece.rotate();
            this.game.currentPiece.shape = rotatedShape;
        }
        
        // 壁蹴りチェック
        const kicks = [0, 1, -1, 2, -2];
        let kicked = false;
        
        for (let kick of kicks) {
            if (!this.game.board.isCollision(this.game.currentPiece, kick, 0)) {
                this.game.currentPiece.x += kick;
                kicked = true;
                break;
            }
        }
        
        // 回転できない場合は元に戻す（右回転1回）
        if (!kicked) {
            const rotatedShape = this.game.currentPiece.rotate();
            this.game.currentPiece.shape = rotatedShape;
        }
        
        this.game.draw();
    }

    // 180度回転
    rotate180() {
        // 2回右回転 = 180度回転
        for (let i = 0; i < 2; i++) {
            const rotatedShape = this.game.currentPiece.rotate();
            this.game.currentPiece.shape = rotatedShape;
        }
        
        // 壁蹴りチェック
        const kicks = [0, 1, -1, 2, -2];
        let kicked = false;
        
        for (let kick of kicks) {
            if (!this.game.board.isCollision(this.game.currentPiece, kick, 0)) {
                this.game.currentPiece.x += kick;
                kicked = true;
                break;
            }
        }
        
        // 回転できない場合は元に戻す（180度回転）
        if (!kicked) {
            for (let i = 0; i < 2; i++) {
                const rotatedShape = this.game.currentPiece.rotate();
                this.game.currentPiece.shape = rotatedShape;
            }
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
                    this.hardDrop();
                } else if (diffY < -30) {
                    this.rotateRight();
                }
            }
        });
    }
}
