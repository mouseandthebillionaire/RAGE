let canvas;
let w, h;
let font_0, font_1;
let textFile = [];
let currTextFile;

let textLine;
let interacting;

let sketchStarted=false;

// Timer
let delayTime;
let currTime;

function windowResized() {
    w = window.innerWidth;
    h = window.innerHeight;
    resizeCanvas(w, h);
}

function preload(){
    font_0 = loadFont('DepartureMono-Regular.otf');
    font_1 = loadFont('SourceCodePro-ExtraLight.ttf');
    textFile[0] = loadStrings('01.txt');
    textFile[1] = loadStrings('01_text.txt');
    textFile[2] = loadStrings('02.txt');
    textFile[3] = loadStrings('02_text.txt');
}

function setup(){
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w,h)
    background('black');
    noStroke();

    // Text
    textFont(font_1);
    textSize(32);
    textAlign(CENTER, CENTER);

    // Timer
    delayTime = 20;

    AudioSetup();
}

function keyPressed(){
    // Build in a delay
    if(currTime > delayTime && interacting) {
        textLine += 1;
        currTime = 0;
    }
    loadText(0);
}

function applyParameters() {
    // Apply the parameters
    let playSpeedAMT = map(r, 25, w/2, 0.1, 1.0);
}

function StartSketch(){
    sketchStarted = true;

    // Params
    currTime = 0;
    textLine = 0;
    currTextFile = 0;
    interacting = true;

    AudioStart();
}

function draw(){

    background('rgba(0, 0, 0, 0.125)');
    fill('white');

    if(sketchStarted == true){
        if(interacting) {
            textAlign(CENTER,CENTER);
            if (textLine < textFile[currTextFile].length) {
                // By external text file
                for (let i = 0; i < textLine + 1; i++) {
                    let yPos = (h / 2 + (30 * i)) - (20 * textLine);
                    text(textFile[currTextFile][i], w / 2, yPos);
                }
            } else {
                currTime = 0;
                interacting = false;
            }
        } else {
            textAlign(LEFT);
            for(let i=0; i < textFile[currTextFile+1].length; i++){
                let yPos = (h / 2 + (30 * i)) - (20 * textFile[currTextFile+1].length);
                text(textFile[currTextFile+1][i], w / 2, yPos);
            }
            if(keyIsPressed && currTime > delayTime){
                interacting = true;
                currTextFile += 2;
                textLine = 0;
                currTime = 0;
            }
        }
    } else {
        // START SKETCH TEXT
        text("PRESS ANY KEY", w/2, h/2);

        if(keyIsPressed && sketchStarted != true){
            StartSketch();
        }
    }

    currTime += 1;


}
