const Socket = io();

let canvas;
const width = 600;
const height = 400;

let myHand = [];
let fieldCards = [];
let currentTurn = null;

function setup() {
    canvas = createCanvas(width, height);
    canvas.parent("Parent");

    Socket.on("GameInitialized", function (gameState) {
        myHand = gameState.playerHands[Socket.id];
        fieldCards = gameState.fieldCards;
        currentTurn = gameState.turn;
        drawGame();
        if (Socket.id === GameState.currentTurn) {
            console.log("あなたのターンです");
            // ターン中の操作を許可する処理
        } else {
            console.log("相手のターンです");
        }
    });
}

function draw() {
    drawGame();
}

function drawGame() {
    // 自分の手札を描画
    for (let i = 0; i < myHand.length; i++) {
        text(myHand[i], 50 + i * 100, height - 50); // 手札の表示位置
    }

    // 場札の描画
    for (const playerId in fieldCards) {
        for (let i = 0; i < fieldCards[playerId].length; i++) {
            text(fieldCards[playerId][i], 50 + i * 100, 100 + (playerId === Socket.id ? 0 : 50));
        }
    }
}

function mousePressed() {
    // カードを選んで場に置くロジックを実装
    const cardIndex = Math.floor(mouseX / 100); // クリック位置からインデックスを計算
    if (cardIndex >= 0 && cardIndex < myHand.length) {
        // ここでカードを場に置く
        Socket.emit("PlayCard", cardIndex, 0); // 一時的にインデックスを指定
    }
}

Socket.on("UpdateGameState", function (gameState) {
    myHand = gameState.playerHands[Socket.id]; // 自分の手札の更新
    fieldCards = gameState.fieldCards; // 場札の更新
    currentTurn = gameState.turn; // 現在のターンの更新
});