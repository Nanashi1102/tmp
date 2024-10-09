const Socket = io();

let Canvas_Sketch;
const Width_Sketch = 600;
const Height_Sketch = 600;

const Keys = ["w", "s", "d", "a"];
const Movement = {};

function setup() {
    Canvas_Sketch = createCanvas(Width_Sketch, Height_Sketch);
    Canvas_Sketch.parent("Parent");

    background(225);

    Socket.on("connect", function () {
        Socket.emit("Setup", prompt("Please enter your name."), Math.random() * Width_Sketch, Math.random() * Height_Sketch);
    });
}
function draw() {
}
function keyPressed() {
    if (Keys.includes(key)) {
        Movement[key] = true;

        Socket.emit("Movement", Movement);
    }
}
function keyReleased() {
    if (Keys.includes(key)) {
        Movement[key] = false;

        Socket.emit("Movement", Movement);
    }
}

Socket.on("Draw", function (_Players) {
    background(225);

    for (const i in _Players) {
        text(_Players[i].Name + "#" + _Players[i].ID, _Players[i].PosX + 15, _Players[i].PosY - 15);
        ellipse(_Players[i].PosX, _Players[i].PosY, 30, 30);
    }
});