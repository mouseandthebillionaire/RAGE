let canvas;
let w, h;
let xoff = 0;
let r = [25, 30, 40, 50, 60, 70, 80];
let c = ['#88E3B0','#87E0AE','#6FB88F','#5A9674','#46745A','#315240'];

let device;
let sketchStarted=false;
let audioContext;

// RNBO Control
let paramInteraction;
// messages FROM RNBO
let n = [];

// Snake Game
let fruit;
let snake;

// Type
let font
function preload() {
    // Load a custom font before the sketch starts
    font = loadFont('arson-pro-medium.otf');
}


function windowResized() {
    w = window.innerWidth;
    h = window.innerHeight;
    resizeCanvas(w, h);
}

function setup(){
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w,h)
    frameRate(60);
    snake = new Snake();

    // Setup RNBO
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    rnboSetup(audioContext);
}

async function rnboSetup(context){
    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    const { createDevice } = RNBO;
    await context.resume();
    const rawPatcher = await fetch('audio/stillness.export.json');
    const patcher = await rawPatcher.json();

    device = await createDevice ({context, patcher});
    device.node.connect(outputNode);

    // (Optional) Fetch the dependencies
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("audio/dependencies.json");
        dependencies = await dependenciesResponse.json();

        // Prepend the "audio" folder to any file dependencies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "audio/" + d.file }) : d);
    } catch (e) {}

    // (Optional) Load the samples
    if (dependencies.length)
        await device.loadDataBufferDependencies(dependencies);

    // Parameters
    paramInteraction = device.parametersById.get('interaction');

    // Messages
    for(let i=0; i<6; i++)
    {
        let name = 'n' + i;
        n[i] = device.parametersById.get(name);
    }
}

function draw(){

    background('rgba(0, 0, 0, 0.125)');

    if(sketchStarted == true){
        DropManager();

        // Snake
        snake.update();
        snake.show();
        if(snake.eat(fruit)){
            UpdateFruitCoordinates();
        }

        ShowFruit();
        CheckForCollision();
        // CheckForFruit();
        KeyPress();
    } else {
        ShowStartScreen();
    }
}

function ShowStartScreen(){
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(font);
    textSize(15);
    fill(255);
    text('Don\'t Snake. WASD to Move.', w/2+20, h/2-50);

    startButton = createButton('Start')
    startButton.position(w/2, h/2)
    startButton.mousePressed(StartGame);
    noLoop();
}

function StartGame(){
    resumeAudio();

    snake.setDir(1, 0);
    UpdateFruitCoordinates();

    sketchStarted = true;
    loop();
}

function ShowFruit(){
    stroke(255, 64, 32);
    strokeWeight(20);
    point(fruit.x, fruit.y);
}

function CheckForCollision(){
    // How can we wrap?
}

function CheckForFruit(){
    // is this actually better if there ISN'T any fruit!?
}

function UpdateFruitCoordinates(){
    let x = floor(random(w));
    let y = floor(random(h));
    fruit = createVector(x, y);
}

// Audio Stuff
function DropManager(){
    noStroke();
    for(let i=0; i<n.length; i++){
        if(n[i]){
            if(n[i].value == 1){
                CreateDrop(i);
            }
        }
    }
}


function KeyPress(){
    if(keyIsPressed){
        if(key == 'w' || key == 'a' || key == 's' || key == 'd') {
            if (paramInteraction) {
                paramInteraction.value = 1;
                Chaos();
            }
            switch(key){
                case 'w':
                    snake.setDir(0, -1);
                    break;
                case 'a':
                    snake.setDir(-1, 0);
                    break;
                case 's':
                    snake.setDir(0, 1);
                    break;
                case 'd':
                    snake.setDir(1, 0);
            }
        }
    } else {
        if (paramInteraction) paramInteraction.value = 0;
    }
}

function Chaos(){
    let fr = random(255);
    let fg = random(255);
    let fb = random(255);
    let sr = random(255);
    let sg = random(255);
    let sb = random(255);
    let size = random(100, h);
    let xLoc = random(w/2 - 500, w/2 + 500);
    let yLoc = random(h/2 - 300, h/2 + 300);
    fill(fr, fg, fb);
    stroke(sr, sg, sb);
    ellipse(xLoc, yLoc, size, size);
}

function resumeAudio(){
    sketchStarted = true;
    startButton.style('opacity', '0')


    if(getAudioContext().state !== 'running'){
        audioContext.resume();
    }
}

function CreateDrop(index) {
    let xLoc = random((w/2 - 200), (w/2 + 200));
    let fillCol = c[index];
    fill(fillCol);
    ellipse(xLoc, h/2, r[index]*2, r[index]*2);
}
