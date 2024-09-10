let canvas;
let w, h;
let font_0, font_1;
let textFile = [];
let currTextFile;

let textLine;
let interacting;

let device;
let sketchStarted=false;
let audioContext;

// Timer
let delayTime;
let currTime;

// RNBO Control
let paramInteraction;
// messages FROM RNBO
let n = [];

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
    textLine = 0;
    currTextFile = 0;
    interacting = true;

    // Timer
    currTime = 0;
    delayTime = 20;

    startButton = createButton('Start')
    startButton.position(w/2, h/2)
    startButton.mousePressed(StartSketch);

    //audioContext = new (window.AudioContext || window.webkitAudioContext)();
    //rnboSetup(audioContext);
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

function keyPressed(){
    // Build in a delay
    if(currTime > delayTime) {
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
    startButton.style('opacity', '0')

    // Start the Audio
    //if(getAudioContext().state !== 'running'){
    //    audioContext.resume();
    //}
}

function draw(){

    background('rgba(0, 0, 0, 0.125)');
    fill('white');

    if(sketchStarted == true){
        if(interacting) {
            if (textLine < textFile[currTextFile].length) {
                // By external text file
                for (let i = 0; i < textLine + 1; i++) {
                    let yPos = (h / 2 + (30 * i)) - (20 * textLine);
                    text(textFile[currTextFile][i], w / 2, yPos);
                }
            } else {
                interacting == false;
            }
        } else {
            textAlign(LEFT);
            for(let i=0; i < textFile[currTextFile+1].length; i++){
                let yPos = (h / 2 + (30 * i)) - (20 * textFile[currTextFile+1].length);
                text(textFile[currTextFile+1][i], w / 2, yPos);
            }
        }
    }
    currTime += 1;


}
