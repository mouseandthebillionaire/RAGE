let canvas;
let w, h;
let device;
let distortionAMT, delayAMT;
let sketchStarted=false;
let audioContext;

function setup(){
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w,h)
    background('black')
    fill('red')
    noStroke()
    ellipse(100, 100, 50)

    startButton = createButton('Start')
    startButton.position(w/2, h/2)
    startButton.mousePressed(resumeAudio)
    audioContext = getAudioContext()

    synth = new p5.MonoSynth()
    synth.setADSR(10, 1, 1, 5)
    synth.amp(0.1)

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

    distortionAMT = device.parametersById.get('drive');
    delayAMT = device.parametersById.get('delayFB');
}

function mousePressed(){
    if(sketchStarted == true){
        // mouse X is 0-500(w)
        // Midi is 12-108
        let note = map(mouseX, 0, w, 12, 108);
        synth.play(midiToFreq(note), 90, 0, 0.1);

        fill('red');
        ellipse(mouseX, mouseY, random(200));


        let distortion = map(mouseY, 0, h, 0.0, 1.0);
        let delay = map(mouseX, 0, w, 0.0, 1.0);
        if(distortionAMT) distortionAMT.normalizedValue = distortion;
        if(delayAMT) delayAMT.normalizedValue = delay;
    }
}

function resumeAudio(){
    sketchStarted = true;
    startButton.style('opacity', '0')

    if(getAudioContext().state !== 'running'){
        audioContext.resume()
    }
}

function draw(){
    background('rgba(0, 0, 0, 0.05)');


}