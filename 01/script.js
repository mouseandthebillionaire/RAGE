let canvas;
let w, h;
let device;
let sketchStarted=false;
let audioContext;

// RNBO Control
let parameter;

function setup(){
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w,h)
    background('white')
    fill('black')
    noStroke()

    startButton = createButton('Start')
    startButton.position(w/2, h/2)
    startButton.mousePressed(resumeAudio)
    audioContext = getAudioContext()

    rnboSetup(audioContext);
}
async function rnboSetup(context){
    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    const { createDevice } = RNBO;
    await context.resume();
    const rawPatcher = await fetch('exports/patch.export.json');
    const patcher = await rawPatcher.json();

    device = await createDevice ({context: context, patcher});

    // signal chain
    synth.connect(device.node);
    device.node.connect(outputNode);

    //parameter = device.parametersById.get('parameterName');
}

function mousePressed(){
    if(sketchStarted == true){

        fill('red');
        ellipse(mouseX, mouseY, random(200));

    }
}

function applyParameters() {
    /* Apply the parameters
    let parameterAMT = map(mouseX, 0, h, 0.0, 1.0);
    if(parameter) parameter.normalizedValue = parameterAMT;
    */
}

function resumeAudio(){
    sketchStarted = true;
    startButton.style('opacity', '0')

    if(getAudioContext().state !== 'running'){
        audioContext.resume()
    }
}

function draw(){
    background('rgba(255, 255, 255, 0.15)');


}