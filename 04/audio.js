let device;
let audioContext;

// RNBO Control
let paramInteraction;
// messages FROM RNBO
let n = [];

function AudioSetup(){
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    rnboSetup(audioContext);
}

async function rnboSetup(context){
    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    const { createDevice } = RNBO;
    await context.resume();
    print("yes");
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

function AudioStart(){
    // Start the Audio
    if(getAudioContext().state !== 'running'){
        audioContext.resume();
    }
}