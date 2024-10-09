const Express = require("express");
const Http = require("http");
const Path = require("path");
const SocketIO = require("socket.io");

const App = Express();
const Server = Http.Server(App);
const IO = SocketIO(Server);

const Port = process.env.PORT || 3000;
const FrameRate = 60;

// �J�[�h�̒�`
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
    turn: null, // ���݂̃^�[��
    gameEnded: false,
};

// �Q�[���̏������֐�
function initializeGame() {
    GameState.deck = shuffle(GameState.deck);
    const playerIds = Object.keys(Players);

    for (const playerId of playerIds) {
        GameState.playerHands[playerId] = GameState.deck.splice(0, 5); // ��D��z��
        GameState.fieldCards[playerId] = [GameState.deck.splice(0, 3)]; // ��D��u��
    }
    GameState.turn = playerIds[0]; // �ŏ��̃^�[���̃v���C���[
}

// �V���b�t���֐�
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

IO.on("connection", function (_Socket) {
    console.log("A player connected:", _Socket.id); // �ǉ�

    Players[_Socket.id] = { id: _Socket.id, name: null };

    // �Q�[���̏�����
    if (Object.keys(Players).length === 2) {
        initializeGame();
        IO.emit("GameInitialized", GameState);
    }

    _Socket.on("Setup", function (_Name) {
        Players[_Socket.id].name = _Name;
    });

    _Socket.on("PlayCard", function (_CardIndex, _FieldIndex) {
        // �J�[�h����ɒu�����W�b�N������
        const currentPlayerId = GameState.turn;

        // �����ŃJ�[�h�̈ړ���Q�[���i�s�̃��W�b�N��ǉ�

        // ���̃^�[���̃v���C���[������
        const playerIds = Object.keys(Players);
        const nextIndex = (playerIds.indexOf(currentPlayerId) + 1) % playerIds.length;
        GameState.turn = playerIds[nextIndex];

        IO.emit("UpdateGameState", GameState); // �Q�[���̏�Ԃ��X�V
    });

    _Socket.on("disconnect", () => {
        console.log("A player disconnected:", _Socket.id);
        delete Players[_Socket.id];
        if (Object.keys(Players).length < 2) {
            GameState.gameEnded = true; // �v���C���[���������ꍇ�̓Q�[���I��
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