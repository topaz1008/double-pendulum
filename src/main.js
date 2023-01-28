// noinspection JSSuspiciousNameCombination :)

import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';

import { DoublePendulum } from './double-pendulum.js';
import { PlotDataScale, PlotMode, PlotLabel } from './plotter.js';
import { colors } from './color-constants.js';
import { PlotManager } from './plot-manager.js';
import { AppGUI } from './app-gui.js';
import { NDSolveMethod } from './ndsolve.js';

// TODO: Refactor this file, its getting big.

// General constants
const VIEW_WIDTH = 1024,
    VIEW_HEIGHT = 600,
    FPS = 60,
    PI = Math.PI,
    HALF_WIDTH = VIEW_WIDTH / 2,
    HALF_HEIGHT = VIEW_HEIGHT / 2;

const EPSILON = 1 / 10000;

// State and global variables
let time = 0,
    isPaused = false,
    pendulum1 = null,
    pendulum2 = null;

// ui control list
// 6. initial conditions (theta1, theta2, omega1, omega2)
// 7. pendulum params (rod1 length bob1 mass; rod2 length bob2 mass)
// 8. bottom graph type
// 9. draw sample points?

// Set up the gui
const appOptions = {
    timeScale: 1,
    gravity: 9.81,
    stepSize: 1000,
    epsilon: EPSILON,
    pendulum1: pendulum1,
    pendulum2: pendulum2,
    draw2ndPendulum: true,
    integrationMethod: NDSolveMethod.RK4,

    initialConditions: {
        theta1: 3 * PI / 4,
        theta2: PI,
        omega1: 0,
        omega2: 0,
        getArray(addEpsilon) {
            const theta1 = (addEpsilon) ? this.theta1 + EPSILON : this.theta1;
            return [theta1, this.theta2, this.omega1, this.omega2];
        }
    },

    pause: () => {
        isPaused = !isPaused;
    },
    reset: () => {
        reset();
    },
};

// Integration settings
const STEP_SIZE = 1 / 1000;

// Pendulum setting
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

// Create the 2 canvas elements and get the context
const context = createCanvas('main-container', VIEW_WIDTH, VIEW_HEIGHT);
const plotContext = createCanvas('plot-container', VIEW_WIDTH, HALF_HEIGHT);

// Create pendulums and the gui
createPendulums();
const gui = new AppGUI(GUI, {
    width: 500,
    autoPlace: false,
    injectStyles: true

}, appOptions);

gui.init();

function reset() {
    createPendulums();
    plotManager.reset();
    time = 0;
}

function createPendulums() {
    const initial1 = appOptions.initialConditions.getArray(false);
    appOptions.pendulum1 = pendulum1 = new DoublePendulum(initial1, context, Object.assign(pendulumOptions, {
        rodColor: colors.pendulum1Rod,
        bobColor: colors.pendulum1Bod,
        pathColor: colors.pendulum1Path
    }));

    // Add another pendulum to show how very small changes in the initial conditions
    // make for drastic change in behaviour in a very short time.
    // This is what makes this system chaotic.
    const initial2 = appOptions.initialConditions.getArray(true);
    appOptions.pendulum2 = pendulum2 = new DoublePendulum(initial2, context, Object.assign(pendulumOptions, {
        rodColor: colors.pendulum2Rod,
        bobColor: colors.pendulum2Bod,
        pathColor: colors.pendulum2Path
    }));
}

const ID_P1_BOB1_XPOS = 0, // Pendulum 1 bob 1 x position
    ID_P2_BOB1_XPOS = 1; // Pendulum 2 bob 1 x position

const ID_P1_BOB2_XPOS = 2,
    ID_P2_BOB2_XPOS = 3;

const ID_P1_THETA1 = 4,
    ID_P1_OMEGA1 = 5;

const plotManager = new PlotManager(plotContext, plotOptions, {
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
        dataScale: new PlotDataScale(7, 7),
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

    if (plotManager.activePlotId === 'bob1xpos') {
        plotManager.step(ID_P1_BOB1_XPOS, t, p1b1.x);
        plotManager.step(ID_P2_BOB1_XPOS, t, p2b1.x);

    } else if (plotManager.activePlotId === 'bob2xpos') {
        plotManager.step(ID_P1_BOB2_XPOS, t, p1b2.x);
        plotManager.step(ID_P2_BOB2_XPOS, t, p2b2.x);

    } else if (plotManager.activePlotId === 'theta1theta1prime') {
        plotManager.step(ID_P1_THETA1, pendulum1.theta1, pendulum1.omega1);
        // console.log(`theta1 ${pendulum1.theta1}`);
        // console.log(`omega1 ${pendulum1.omega1}`);
    }
}

function plotDraw(t) {
    // Draw plot
    plotManager.draw(t, [
        colors.pendulum1Path,
        colors.pendulum2Path
    ]);
}

// Start the app
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

    if (appOptions.draw2ndPendulum) pendulum2.draw();
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
