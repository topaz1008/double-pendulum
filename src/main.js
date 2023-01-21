// noinspection JSSuspiciousNameCombination

import { DoublePendulum } from './double-pendulum.js';
import { PlotDataScale, PlotMode, PlotLabel } from './plotter.js';
import { colors } from './color-constants.js';
import { UIControlElement } from './ui-control-element.js';
import { PlotManager } from './plot-manager.js';

// TODO: Refactor this file, its getting big.

// General constants
const VIEW_WIDTH = 1024,
    VIEW_HEIGHT = 600,
    FPS = 60,
    PI = Math.PI,
    HALF_WIDTH = VIEW_WIDTH / 2,
    HALF_HEIGHT = VIEW_HEIGHT / 2;

// Integration settings
const STEP_SIZE = 1 / 1000;

// State variables
let time = 0,
    isPaused = false;

// Create the 2 canvas elements and get the context
const context = createCanvas('mainContainer', VIEW_WIDTH, VIEW_HEIGHT);
const plotContext = createCanvas('plotContainer', VIEW_WIDTH, HALF_HEIGHT);

// UI Controls
const buttons = new UIControlElement('[role=button]');
const plotType = new UIControlElement('[role=combobox]');
const rangeSlider = new UIControlElement('input[type=range]');
rangeSlider.on('change', 'change', (e) => {
    console.log('slider changed', e.target.value);
});

buttons.on('pause', 'click', (e) => {
    const target = e.target;

    isPaused = !isPaused;
    target.innerText = (isPaused) ? 'Unpause' : 'Pause';
});
buttons.on('reset', 'click', (e) => {
    createPendulums();
    tmp.reset();
});
plotType.on('change', 'change', (e) => {
    const target = e.target;

    tmp.setActivePlotId(target.value);
});

// Pendulums
const pendulumOptions = {
    gravity: 9.81,
    origin: { x: 0, y: 0 },
    stepSize: STEP_SIZE,
    fps: FPS,
    backgroundColor: colors.background,
    l1: 1, // Length of rod 1 (top)
    m1: 1, // Mass of bob 1 (top)
    l2: 1, // Length of rod 2 (bottom)
    m2: 1  // Mass of bob 2 (bottom)
};
let pendulum1, pendulum2;

function createPendulums() {
    // Initial conditions [theta1, theta2, omega1, omega2]
    const y0_1 = [3 * PI / 4, PI, 0, 0];
    pendulum1 = new DoublePendulum(y0_1, context, Object.assign(pendulumOptions, {
        rodColor: colors.pendulum1Rod,
        bobColor: colors.pendulum1Bod,
        pathColor: colors.pendulum1Path
    }));

    // Add another pendulum to show how very small changes in the initial conditions
    // make for drastic change in behaviour in a very short time.
    // This is what makes this system chaotic.
    const EPSILON = 1 / 10000;
    const y0_2 = [(3 * PI / 4) + EPSILON, PI, 0, 0];
    pendulum2 = new DoublePendulum(y0_2, context, Object.assign(pendulumOptions, {
        rodColor: colors.pendulum2Rod,
        bobColor: colors.pendulum2Bod,
        pathColor: colors.pendulum2Path
    }));
}

// Plot settings
const plotOptions = {
    width: VIEW_WIDTH,
    height: HALF_HEIGHT,
    stepSize: STEP_SIZE,
    drawPoints: false,
    backgroundColor: colors.plotBackground,
    axisColor: colors.plotAxis,
    plotColor: colors.plotPath,
    pointColor: colors.plotPoint
};

const ID_P1_BOB1_XPOS = 0, // Pendulum 1 bob 1 x position
    ID_P2_BOB1_XPOS = 1; // Pendulum 2 bob 1 x position

const ID_P1_BOB2_XPOS = 2,
    ID_P2_BOB2_XPOS = 3;

const ID_P1_THETA1 = 4,
    ID_P1_OMEGA1 = 5;

const tmp = new PlotManager(plotContext, plotOptions, {
    bob1xpos: {
        ids: [ID_P1_BOB1_XPOS, ID_P2_BOB1_XPOS],
        dataScale: new PlotDataScale(1000, 100),
        mode: PlotMode.NORMAL,
        samplePointLimit: 500,
        pathSimplify: 2,
        labels: [
            new PlotLabel('x = time', 100, 50, colors.plotLabel),
            new PlotLabel('y = pendulum1 bob1 x position', 100, 90, colors.pendulum1Path),
            new PlotLabel('y = pendulum2 bob1 x position', 100, 130, colors.pendulum2Path)
        ]
    },
    bob2xpos: {
        ids: [ID_P1_BOB2_XPOS, ID_P2_BOB2_XPOS],
        dataScale: new PlotDataScale(1000, 50),
        mode: PlotMode.NORMAL,
        samplePointLimit: 500,
        pathSimplify: 2,
        labels: [
            new PlotLabel('x = time', 100, 50, colors.plotLabel),
            new PlotLabel('y = pendulum1 bob2 x position', 100, 90, colors.pendulum1Path),
            new PlotLabel('y = pendulum2 bob2 x position', 100, 130, colors.pendulum2Path)
        ]
    },
    theta1theta1prime: {
        ids: [ID_P1_THETA1, ID_P1_OMEGA1],
        dataScale: new PlotDataScale(10, 10),
        mode: PlotMode.PHASE,
        samplePointLimit: 1500,
        pathSimplify: 2,
        labels: [
            new PlotLabel('x = theta1', 100, 50, colors.plotLabel),
            new PlotLabel('y = omega1', 100, 90, colors.pendulum1Path)
        ]
    }
});

function plotStep(t) {
    // Step plot
    const p1b1 = pendulum1.position1(true),
        p1b2 = pendulum1.position2(true),
        p2b1 = pendulum2.position1(true),
        p2b2 = pendulum2.position2(true);

    if (tmp.activePlotId === 'bob1xpos') {
        tmp.step(ID_P1_BOB1_XPOS, t, p1b1.x);
        tmp.step(ID_P2_BOB1_XPOS, t, p2b1.x);

    } else if (tmp.activePlotId === 'bob2xpos') {
        tmp.step(ID_P1_BOB2_XPOS, t, p1b2.x);
        tmp.step(ID_P2_BOB2_XPOS, t, p2b2.x);

    } else if (tmp.activePlotId === 'theta1theta1prime') {
        tmp.step(ID_P1_THETA1, pendulum1.theta2 , pendulum1.omega2);
        // console.log(`theta1 ${pendulum1.theta2 / (4 * PI)}`);
        // console.log(`omega1 ${pendulum1.omega2}`);
    }
}

function plotDraw(t) {
    // Draw plot
    tmp.draw(t, [
        colors.pendulum1Path,
        colors.pendulum2Path
    ]);
}

createPendulums();
update();

/**
 * Main update loop
 */
function update() {
    if (!isPaused) {
        time += STEP_SIZE;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(HALF_WIDTH, HALF_HEIGHT);
    context.fillStyle = colors.background;
    context.clearRect(-HALF_WIDTH, -HALF_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);

    // Update the pendulums
    pendulum1.draw();
    if (!isPaused) pendulum1.step();

    pendulum2.draw();
    if (!isPaused) pendulum2.step();

    // Update the bottom plot
    plotDraw(time);
    if (!isPaused) plotStep(time);

    requestAnimationFrame(update);
}

function createCanvas(containerId, width, height) {
    // Create a new canvas element.
    const element = document.createElement('canvas'),
        context = element.getContext('2d');

    element.width = width;
    element.height = height;

    if (containerId !== undefined) {
        const container = document.getElementById(containerId);
        container.appendChild(element);

    } else {
        document.body.appendChild(element);
    }

    return context;
}
