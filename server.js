const Express = require("express");
const Http = require("http");
const Path = require("path");
const SocketIO = require("socket.io");

const App = Express();
const Server = Http.Server(App);
const IO = SocketIO(Server);

const Port = process.env.PORT || 3000;
const FrameRate = 60;

// カードの定義
const CARD_VALUES = [
    'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
];
const CARD_SUITS = ['S', 'C', 'D', 'H'];

function createDeck() {
    const deck = [];
    for (const suit of CARD_SUITS) {
        for (const value of CARD_VALUES) {
            deck.push(value + suit);
        }
    }
    return deck;
}

const Players = {};

const GameState = {
    deck: createDeck(),
    playerHands: {},
    fieldCards: {},
    turn: null, // 現在のターン
    gameEnded: false,
};

// ゲームの初期化関数
function initializeGame() {
    GameState.deck = shuffle(GameState.deck);
    const playerIds = Object.keys(Players);

    for (const playerId of playerIds) {
        GameState.playerHands[playerId] = GameState.deck.splice(0, 5); // 手札を配る
        GameState.fieldCards[playerId] = [GameState.deck.splice(0, 3)]; // 場札を置く
    }
    GameState.turn = playerIds[0]; // 最初のターンのプレイヤー
}

// シャッフル関数
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

IO.on("connection", function (_Socket) {
    console.log("A player connected:", _Socket.id); // 追加

    Players[_Socket.id] = { id: _Socket.id, name: null };

    // ゲームの初期化
    if (Object.keys(Players).length === 2) {
        initializeGame();
        IO.emit("GameInitialized", GameState);
    }

    _Socket.on("Setup", function (_Name) {
        Players[_Socket.id].name = _Name;
    });

    _Socket.on("PlayCard", function (_CardIndex, _FieldIndex) {
        // カードを場に置くロジックを実装
        const currentPlayerId = GameState.turn;

        // ここでカードの移動やゲーム進行のロジックを追加

        // 次のターンのプレイヤーを決定
        const playerIds = Object.keys(Players);
        const nextIndex = (playerIds.indexOf(currentPlayerId) + 1) % playerIds.length;
        GameState.turn = playerIds[nextIndex];

        IO.emit("UpdateGameState", GameState); // ゲームの状態を更新
    });

    _Socket.on("disconnect", () => {
        console.log("A player disconnected:", _Socket.id);
        delete Players[_Socket.id];
        if (Object.keys(Players).length < 2) {
            GameState.gameEnded = true; // プレイヤーが減った場合はゲーム終了
        }
    });
});

App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => {
    _Response.sendFile(Path.join(__dirname, "/public/index.html"));
});

Server.listen(Port, function () {
    console.log("Starting Server on port " + Port + ".");
});