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
            console.log("���Ȃ��̃^�[���ł�");
            // �^�[�����̑���������鏈��
        } else {
            console.log("����̃^�[���ł�");
        }
    });
}

function draw() {
    drawGame();
}

function drawGame() {
    // �����̎�D��`��
    for (let i = 0; i < myHand.length; i++) {
        text(myHand[i], 50 + i * 100, height - 50); // ��D�̕\���ʒu
    }

    // ��D�̕`��
    for (const playerId in fieldCards) {
        for (let i = 0; i < fieldCards[playerId].length; i++) {
            text(fieldCards[playerId][i], 50 + i * 100, 100 + (playerId === Socket.id ? 0 : 50));
        }
    }
}

function mousePressed() {
    // �J�[�h��I��ŏ�ɒu�����W�b�N������
    const cardIndex = Math.floor(mouseX / 100); // �N���b�N�ʒu����C���f�b�N�X���v�Z
    if (cardIndex >= 0 && cardIndex < myHand.length) {
        // �����ŃJ�[�h����ɒu��
        Socket.emit("PlayCard", cardIndex, 0); // �ꎞ�I�ɃC���f�b�N�X���w��
    }
}

Socket.on("UpdateGameState", function (gameState) {
    myHand = gameState.playerHands[Socket.id]; // �����̎�D�̍X�V
    fieldCards = gameState.fieldCards; // ��D�̍X�V
    currentTurn = gameState.turn; // ���݂̃^�[���̍X�V
});