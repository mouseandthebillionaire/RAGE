let canvas;
let w, h, ellipseX;
let xoff = 0;
let r = 25;
let device;
let sketchStarted=false;
let audioContext;

// RNBO Control
let paramDrive, paramPlaySpeed, paramLoop, paramDelay;

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
    fill('white');
    noStroke();

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
    const rawPatcher = await fetch('audio/patch.export.json');
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
    paramDrive = device.parametersById.get('drive');
    paramPlaySpeed = device.parametersById.get('playSpeed');
    paramLoop = device.parametersById.get('chimeLoop');
    paramDelay = device.parametersById.get('delayFB');
}

function mousePressed(){

}

function applyParameters() {
    // Apply the parameters
    // this version flips version 1 so it goes from detuned/distorted to natural
    let playSpeedAMT = map(r, 25, w/2, 0.1, 1.0);
    let driveAMT = map(r, 25, w/2, 1.0, 0.0);
    // these stay the same
    let loopAMT =  map(r, 25, w/2, 3000, 100);
    let delayAMT = map(ellipseX, 0, w, 0, 90);
    if(paramPlaySpeed) paramPlaySpeed.normalizedValue = playSpeedAMT;
    if(paramDrive) paramDrive.normalizedValue = driveAMT;
    if(paramLoop) paramLoop.normalizedValue = loopAMT;
    if(paramDelay) paramDelay.normalizedValue = delayAMT;
}

function resumeAudio(){
    sketchStarted = true;
    startButton.style('opacity', '0')


    if(getAudioContext().state !== 'running'){
        audioContext.resume();
    }

}

function draw(){
    background('rgba(0, 0, 0, 0.5)');
    if(sketchStarted == true){
        let x = map(noise(xoff), 0, 1, 0, width);
        xoff += 0.001;
        ellipse(x, h/2, r*2, r*2);
        ellipseX = x;

        // Check for MouseOver
        var d = dist(mouseX, mouseY, x, h/2);
        if(d < r){
            r += .1;
        } else {
            if(r > 25) {
                r -= 1;
            }
        }
        applyParameters();
    }


}