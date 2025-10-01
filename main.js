// ゲーム全体を初期化して起動するメインファイル

let game;
let controls;
let animationId;

// デバッグ用：画面にメッセージを表示
function showDebug(msg) {
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;z-index:9999;max-width:300px;';
    debugDiv.textContent = msg;
    document.body.appendChild(debugDiv);
}

// ページ読み込み完了時に実行
window.addEventListener('DOMContentLoaded', () => {
    showDebug('ページ読み込み完了');
    
    // すべての必要な要素が存在するか確認
    const tetrisCanvas = document.getElementById('tetris');
    const nextCanvas = document.getElementById('next');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!tetrisCanvas) showDebug('エラー: tetrisキャンバスが見つかりません');
    if (!nextCanvas) showDebug('エラー: nextキャンバスが見つかりません');
    if (!startBtn) showDebug('エラー: スタートボタンが見つかりません');
    if (!pauseBtn) showDebug('エラー: ポーズボタンが見つかりません');
    
    if (!tetrisCanvas || !nextCanvas || !startBtn || !pauseBtn) {
        return;
    }
    
    init();
});

// ゲームの初期化
function init() {
    console.log('初期化開始...');
    
    try {
        // ゲームインスタンスを作成
        game = new Game();
        console.log('Game作成成功:', game);
        
        // コントロールを設定
        controls = new Controls(game);
        console.log('Controls作成成功:', controls);
        
        // タッチ操作も有効化（モバイル対応）
        controls.setupTouchControls();
        
        // 初期画面を描画
        game.draw();
        
        // ゲームループを開始
        gameLoop();
        
        console.log('テトリスゲームが初期化されました！');
        console.log('スペースキーまたはスタートボタンを押してゲームを開始してください。');
    } catch (error) {
        console.error('初期化エラー:', error);
    }
}

// メインゲームループ
function gameLoop(timestamp = 0) {
    // ゲームの状態を更新
    if (game) {
        game.update(timestamp);
    }
    
    // 次のフレームをリクエスト
    animationId = requestAnimationFrame(gameLoop);
}

// ゲームを停止
function stopGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// ウィンドウのリサイズに対応
window.addEventListener('resize', () => {
    if (game) {
        game.draw();
    }
});

// ページを離れる前の確認（ゲーム中の場合）
window.addEventListener('beforeunload', (e) => {
    if (game && game.isPlaying && !game.isPaused) {
        e.preventDefault();
        e.returnValue = 'ゲーム中です。本当にページを離れますか？';
        return e.returnValue;
    }
});

// デバッグ用：コンソールからゲームにアクセスできるようにする
window.tetrisGame = {
    game: () => game,
    controls: () => controls,
    restart: () => {
        if (game) {
            game.reset();
            game.start();
        }
    },
    pause: () => {
        if (game) {
            game.pause();
        }
    },
    test: () => {
        console.log('Game:', game);
        console.log('Controls:', controls);
        console.log('isPlaying:', game ? game.isPlaying : 'undefined');
    }
};
