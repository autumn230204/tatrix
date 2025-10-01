// テトリスのブロック形状定義
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

// 各ブロックの色定義
const COLORS = {
    I: '#00f0f0',  // シアン
    O: '#f0f000',  // 黄色
    T: '#a000f0',  // 紫
    S: '#00f000',  // 緑
    Z: '#f00000',  // 赤
    J: '#0000f0',  // 青
    L: '#f0a000'   // オレンジ
};

// ブロックの種類リスト
const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// ゲーム盤面の設定
const BOARD_CONFIG = {
    COLS: 10,
    ROWS: 20,
    BLOCK_SIZE: 30
};

// ブロックを描画する関数
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BOARD_CONFIG.BLOCK_SIZE, BOARD_CONFIG.BLOCK_SIZE);
    
    // ブロックに立体感を追加
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, BOARD_CONFIG.BLOCK_SIZE, BOARD_CONFIG.BLOCK_SIZE);
    
    // ハイライト効果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 2, y + 2, BOARD_CONFIG.BLOCK_SIZE - 4, 6);
}

// グリッド線を描画する関数
function drawGrid(ctx, width, height) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // 縦線
    for (let x = 0; x <= width; x += BOARD_CONFIG.BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 横線
    for (let y = 0; y <= height; y += BOARD_CONFIG.BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
