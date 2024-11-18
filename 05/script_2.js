let canvas;
let w, h, ellipseX;
let xoff = 0;
let r = 25;
let device;
let sketchStarted = false;
let audioContext;

// RNBO Control
let paramDrive, paramPlaySpeed, paramLoop, paramDelay;

// Enhanced Calibration Variables
let gazeX, gazeY;
let calibrationPoints = [];
let currentCalibrationIndex = 0;
let calibrated = false;
let calibrationData = [];
let calibrationAccuracy = [];
let clickTimeout;
let showingPoint = false;
let pointTimer = 0;
const POINTS_PER_CALIBRATION = 9;
const SAMPLES_PER_POINT = 30;
const CALIBRATION_POINT_LOOK_TIME = 1000; // Time to look at each point in ms
let currentSamples = [];
let startButton, recalibrateButton;

// Add this at the start of your script.js
function waitForWebGazer() {
    return new Promise((resolve, reject) => {
        const checkWebGazer = () => {
            if (typeof webgazer !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkWebGazer, 100);
            }
        };
        checkWebGazer();
    });
}

// Then modify your setup function:
async function setup() {
    console.log("Waiting for WebGazer to load...");
    await waitForWebGazer();
    console.log("WebGazer loaded successfully");

    console.log("Setting up application...");
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = createCanvas(w, h);
    background('white');
    fill('black');
    noStroke();

    // Initialize WebGazer with higher precision settings
    console.log("Initializing WebGazer...");
    webgazer.setRegression('ridge')
        .setTracker('TFFacemesh')
        .setGazeListener((data, elapsedTime) => {
            if (data) {
                gazeX = data.x;
                gazeY = data.y;
                if (showingPoint && !calibrated) {
                    collectCalibrationSample();
                }
            }
        }).begin()
        .then(() => {
            console.log("WebGazer initialized successfully");
            // Start calibration after WebGazer is ready
            setTimeout(startCalibration, 2500); // Give WebGazer time to fully initialize
        })
        .catch(error => {
            console.error("Error initializing WebGazer:", error);
        });

    // Create 9-point calibration grid
    console.log("Creating calibration grid...");
    const margin = Math.min(w, h) * 0.2;
    const stepX = (w - 2 * margin) / 2;
    const stepY = (h - 2 * margin) / 2;

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            calibrationPoints.push(createVector(
                margin + x * stepX,
                margin + y * stepY
            ));
        }
    }
    console.log(`Created ${calibrationPoints.length} calibration points`);

    // Create UI buttons
    createCalibrationUI();

    // Audio setup
    console.log("Setting up audio context...");
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    rnboSetup(audioContext);
}

function createCalibrationUI() {
    console.log("Creating UI elements...");
    startButton = createButton('Start Experience');
    startButton.position(w/2 - 60, h/2);
    startButton.mousePressed(resumeAudio);
    startButton.hide();

    recalibrateButton = createButton('Recalibrate');
    recalibrateButton.position(20, 20);
    recalibrateButton.mousePressed(startCalibration);
    recalibrateButton.hide();
}

async function rnboSetup(context) {
    console.log("Setting up RNBO...");
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
    } catch (e) {
        console.log("No dependencies found or error loading dependencies:", e);
    }

    if (dependencies.length) {
        await device.loadDataBufferDependencies(dependencies);
    }

    // Set parameters
    paramDrive = device.parametersById.get('drive');
    paramPlaySpeed = device.parametersById.get('playSpeed');
    paramLoop = device.parametersById.get('chimeLoop');
    paramDelay = device.parametersById.get('delayFB');
    console.log("RNBO setup complete");
}

function startCalibration() {
    console.log("Starting calibration...");
    calibrated = false;
    currentCalibrationIndex = 0;
    calibrationData = [];
    calibrationAccuracy = [];
    currentSamples = [];
    sketchStarted = false;
    showNextCalibrationPoint();
}

function showNextCalibrationPoint() {
    console.log(`Showing calibration point ${currentCalibrationIndex + 1}/${calibrationPoints.length}`);
    if (currentCalibrationIndex >= calibrationPoints.length) {
        finishCalibration();
        return;
    }

    showingPoint = true;
    pointTimer = millis();
    currentSamples = [];
}

function collectCalibrationSample() {
    if (currentSamples.length < SAMPLES_PER_POINT &&
        millis() - pointTimer < CALIBRATION_POINT_LOOK_TIME) {
        currentSamples.push(createVector(gazeX, gazeY));
    } else if (currentSamples.length >= SAMPLES_PER_POINT) {
        console.log(`Collected ${currentSamples.length} samples for point ${currentCalibrationIndex + 1}`);
        // Calculate average gaze position for this point
        let avgX = 0, avgY = 0;
        currentSamples.forEach(sample => {
            avgX += sample.x;
            avgY += sample.y;
        });
        avgX /= currentSamples.length;
        avgY /= currentSamples.length;

        // Store calibration data
        calibrationData.push({
            expected: calibrationPoints[currentCalibrationIndex],
            actual: createVector(avgX, avgY)
        });

        // Calculate accuracy for this point
        const accuracy = calculatePointAccuracy(
            calibrationPoints[currentCalibrationIndex],
            createVector(avgX, avgY)
        );
        calibrationAccuracy.push(accuracy);
        console.log(`Point accuracy: ${accuracy.toFixed(2)}`);

        // Move to next point
        showingPoint = false;
        currentCalibrationIndex++;
        setTimeout(showNextCalibrationPoint, 500);
    }
}

function calculatePointAccuracy(expected, actual) {
    const distance = dist(expected.x, expected.y, actual.x, actual.y);
    const maxAllowedError = Math.min(w, h) * 0.1; // 10% of screen size
    return Math.max(0, 1 - (distance / maxAllowedError));
}

function finishCalibration() {
    console.log("Finishing calibration...");
    const averageAccuracy = calibrationAccuracy.reduce((a, b) => a + b) / calibrationAccuracy.length;
    console.log(`Average calibration accuracy: ${averageAccuracy.toFixed(2)}`);

    if (averageAccuracy > 0.6) { // Threshold for acceptable calibration
        console.log("Calibration successful");
        calibrated = true;
        startButton.show();
        recalibrateButton.show();
    } else {
        console.log("Calibration failed - restarting");
        // Poor calibration, restart
        setTimeout(() => {
            alert("Calibration accuracy too low. Please try again.");
            startCalibration();
        }, 500);
    }
}

function resumeAudio() {
    console.log("Starting audio experience");
    sketchStarted = true;
    startButton.style('opacity', '0');
    startButton.hide();

    if (audioContext.state !== 'running') {
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

function draw() {
    background('rgba(255, 255, 255, 0.5)');

    if (!calibrated) {
        // Draw calibration UI
        textAlign(CENTER);
        textSize(24);
        fill(0);
        text("Follow the point with your eyes", width/2, 40);
        text("WebGazer is initializing...", width/2, height/2);

        if (showingPoint && currentCalibrationIndex < calibrationPoints.length) {
            const point = calibrationPoints[currentCalibrationIndex];

            // Animated point
            const progress = (millis() - pointTimer) / CALIBRATION_POINT_LOOK_TIME;
            const size = map(sin(progress * PI * 2), -1, 1, 15, 25);

            fill(0, 100, 250);
            ellipse(point.x, point.y, size, size);

            // Progress indicator
            noFill();
            stroke(0, 100, 250, 100);
            arc(point.x, point.y, 40, 40, 0, progress * TWO_PI);
            noStroke();
        }
    } else if (sketchStarted) {
        // Main RNBO experience
        let x = map(noise(xoff), 0, 1, 0, width);
        xoff += 0.001;
        ellipse(x, h/2, r * 2, r * 2);
        ellipseX = x;

        // Use gaze position instead of mouse
        var d = dist(gazeX, gazeY, x, h/2);
        if (d < r) {
            r += 0.1;
        } else if (r > 25) {
            r -= 1;
        }

        applyParameters();
    }

    // Debug: show current gaze point
    if (gazeX && gazeY) {
        fill(255, 0, 0, 100);
        ellipse(gazeX, gazeY, 10, 10);
    }
}