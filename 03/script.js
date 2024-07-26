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

function windowResized() {
    w = window.innerWidth;
    h = window.innerHeight;
    resizeCanvas(w, h);
}

function setup(){
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w,h)
    background('black');
    noStroke();
    frameRate(15);

    startButton = createButton('Start')
    startButton.position(w/2, h/2)
    startButton.mousePressed(resumeAudio);
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

function KeyPress(){
    if(keyIsPressed){
        if(key == 'w' || key == 'a' || key == 's' || key == 'd') {
            if (paramInteraction) {
                paramInteraction.value = 1;
                Chaos();
            }
        }
    } else {
        if (paramInteraction) paramInteraction.value = 0;
    }
}

function Chaos(){
    let r = random(255);
    let g = random(255);
    let b = random(255);
    let size = random(100, h);
    let xLoc = random(w/2 - 500, w/2 + 500);
    let yLoc = random(h/2 - 300, h/2 + 300);
    fill(r, g, b);
    ellipse(xLoc, yLoc, size, size);
}

function applyParameters() {
    // Apply the parameters
    let playSpeedAMT = map(r, 25, w/2, 0.1, 1.0);
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
    fill(c[index]);
    ellipse(xLoc, h/2, r[index]*2, r[index]*2);
}

function draw(){



    background('rgba(0, 0, 0, 0.125)');
    if(sketchStarted == true){
        for(let i=0; i<n.length; i++){
            if(n[i]){
                if(n[i].value == 1){
                    CreateDrop(i);
                }
            }
        }
        KeyPress();
    }


}