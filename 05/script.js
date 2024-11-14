let canvas;
let w, h, ellipseX;
let xoff = 0;
let r = 25;
let device;
let sketchStarted = false;
let audioContext;

// RNBO Control
let paramDrive, paramPlaySpeed, paramLoop, paramDelay;

// Calibration Variables
let gazeX, gazeY; // Store current gaze coordinates
let calibrationPoints = []; // Array to hold calibration points
let currentCalibrationIndex = 0;
let calibrated = false;
let calibrationData = []; // Store gaze data at each calibration point

function setup() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w, h);
    background('white');
    fill('black');
    noStroke();

    // Start WebGazer for gaze tracking
    webgazer.setGazeListener((data, elapsedTime) => {
        if (data) {
            gazeX = data.x;
            gazeY = data.y;
        }
    }).begin();

    // Create Calibration Points
    calibrationPoints = [
        createVector(width * 0.2, height * 0.2),
        createVector(width * 0.8, height * 0.2),
        createVector(width * 0.5, height * 0.5),
        createVector(width * 0.2, height * 0.8),
        createVector(width * 0.8, height * 0.8)
    ];

    // Create Start Button (hidden during calibration)
    startButton = createButton('Start');
    startButton.position(w / 2, h / 2);
    startButton.mousePressed(resumeAudio);
    startButton.hide(); // Initially hide the button

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // RNBO setup
    rnboSetup(audioContext);
}

async function rnboSetup(context) {
    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    const { createDevice } = RNBO;
    await context.resume();
    const rawPatcher = await fetch('audio/patch.export.json');
    const patcher = await rawPatcher.json();

    device = await createDevice({ context, patcher });
    device.node.connect(outputNode);

    // Load dependencies if available
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("audio/dependencies.json");
        dependencies = await dependenciesResponse.json();
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "audio/" + d.file }) : d);
    } catch (e) {}

    if (dependencies.length) {
        await device.loadDataBufferDependencies(dependencies);
    }

    // Set parameters
    paramDrive = device.parametersById.get('drive');
    paramPlaySpeed = device.parametersById.get('playSpeed');
    paramLoop = device.parametersById.get('chimeLoop');
    paramDelay = device.parametersById.get('delayFB');
}

// Function to start the sketch after calibration
function resumeAudio() {
    sketchStarted = true;
    startButton.style('opacity', '0');
    startButton.hide();

    if (getAudioContext().state !== 'running') {
        audioContext.resume();
    }
}

function applyParameters() {
    let playSpeedAMT = map(r, 25, w / 2, 1.0, 0.0);
    let driveAMT = map(r, 25, w / 2, 0.0, 1.0);
    let loopAMT = map(r, 25, w / 2, 3000, 100);
    let delayAMT = map(ellipseX, 0, w, 0, 90);
    if (paramPlaySpeed) paramPlaySpeed.normalizedValue = playSpeedAMT;
    if (paramDrive) paramDrive.normalizedValue = driveAMT;
    if (paramLoop) paramLoop.normalizedValue = loopAMT;
    if (paramDelay) paramDelay.normalizedValue = delayAMT;
}

function mousePressed() {}

function draw() {
    background('rgba(255, 255, 255, 0.5)');

    if (!calibrated) {
        // Show calibration instructions and points
        textAlign(CENTER);
        textSize(24);
        fill(0);
        text("Look at each point and click to calibrate", width / 2, 40);

        let point = calibrationPoints[currentCalibrationIndex];
        fill(0, 100, 250);
        ellipse(point.x, point.y, 20, 20); // Draw current calibration point
    } else {
        // When calibrated, treat gaze as mouse position
        mouseX = gazeX;
        mouseY = gazeY;

        if (sketchStarted) {
            let x = map(noise(xoff), 0, 1, 0, width);
            xoff += 0.001;
            ellipse(x, h / 2, r * 2, r * 2);
            ellipseX = x;

            // Check for MouseOver
            var d = dist(mouseX, mouseY, x, h / 2);
            if (d < r) {
                r += .1;
            } else {
                if (r > 25) {
                    r -= 1;
                }
            }
            applyParameters();
        }
    }
}

function mousePressed() {
    // During calibration, record gaze data on each click
    if (!calibrated && currentCalibrationIndex < calibrationPoints.length) {
        if (gazeX !== undefined && gazeY !== undefined) {
            calibrationData.push({
                expected: calibrationPoints[currentCalibrationIndex],
                actual: createVector(gazeX, gazeY)
            });
        }

        // Move to the next calibration point
        currentCalibrationIndex++;

        // Check if calibration is complete
        if (currentCalibrationIndex >= calibrationPoints.length) {
            calibrated = true;
            startButton.show(); // Show the start button
        }
    }
}
