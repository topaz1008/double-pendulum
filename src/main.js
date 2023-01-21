import { DoublePendulum } from './double-pendulum.js';
import { Plotter, PlotDataScale, PlotMode, PlotLabel } from './plotter.js';
import { colors } from './color-constants.js';
import { UIElement } from './ui-element.js';

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
const context = createCanvas('main', VIEW_WIDTH, VIEW_HEIGHT, 'mainContainer');
const plotContext = createCanvas('plot', VIEW_WIDTH, HALF_HEIGHT, 'plotContainer');

// UI Controls
const buttons = new UIElement('[role=button]');
const plotType = new UIElement('[role=dropdown]');
buttons.on('pause', 'click', (e) => {
    const target = e.target;

    isPaused = !isPaused;
    target.innerText = (isPaused) ? 'Unpause' : 'Pause';
});
buttons.on('reset', 'click', (e) => {
    createPendulums();
    plotter.reset();
});
plotType.on('change', 'change', (e) => {
    const target = e.target;
    console.log('dropdown value', target.value);
});

// Pendulums
const pendulumOptions = {
    gravity: 9.81,
    origin: { x: 0, y: 0 },
    stepSize: STEP_SIZE,
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
    pendulum1 = new DoublePendulum(y0_1, context, FPS, Object.assign(pendulumOptions, {
        rodColor: colors.pendulum1Rod,
        bobColor: colors.pendulum1Bod,
        pathColor: colors.pendulum1Path
    }));

    // Add another pendulum to show how very small changes in the initial conditions
    // make for drastic change in behaviour in a very short time.
    // This is what makes this system chaotic.
    const EPSILON = 1 / 10000;
    const y0_2 = [(3 * PI / 4) + EPSILON, PI, 0, 0];
    pendulum2 = new DoublePendulum(y0_2, context, FPS, Object.assign(pendulumOptions, {
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

const ID_AXIS_LABELS = 0, // Axis text labels
    ID_P1_BOB1_XPOS = 1, // Pendulum 1 bob 1 x position
    ID_P2_BOB1_XPOS = 2; // Pendulum 2 bob 1 x position

const plotter = new Plotter(plotContext, plotOptions);

plotter.addLabels(ID_AXIS_LABELS, [
    new PlotLabel('x = time', 100, 50, colors.plotLabel),
    new PlotLabel('y = pendulum1 bob1 x position', 100, 90, colors.pendulum1Path),
    new PlotLabel('y = pendulum2 bob1 x position', 100, 130, colors.pendulum2Path)
]);
plotter.setDataScale(new PlotDataScale(2000, 100))
    .setPlotMode(PlotMode.NORMAL)
    .setSamplePointLimit(500)
    .setPathSimplify(2);

function plotStep(t) {
    // Step plot
    const b1 = pendulum1.position1(true),
        b2 = pendulum2.position1(true);

    // noinspection JSSuspiciousNameCombination :)
    plotter.step(ID_P1_BOB1_XPOS, t, b1.x);
    // noinspection JSSuspiciousNameCombination
    plotter.step(ID_P2_BOB1_XPOS, t, b2.x);
}

function plotDraw(t) {
    // Draw plot
    plotter.clear(t);
    plotter.drawAxis(t);
    plotter.drawLabels(ID_AXIS_LABELS, t);

    plotter.drawAll([
        colors.pendulum1Path,
        colors.pendulum2Path
    ]);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
        isPaused = !isPaused;
    }

}, false);

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

function createCanvas(id, width, height, containerId) {
    const el = document.getElementById(id);
    if (el !== null) {
        return el.getContext('2d');
    }

    // Create a new canvas element.
    const c = document.createElement('canvas'),
        ctx = c.getContext('2d');

    c.id = id;
    c.width = width;
    c.height = height;

    if (containerId !== undefined) {
        const container = document.getElementById(containerId);
        container.appendChild(c);

    } else {
        document.body.appendChild(c);
    }

    return ctx;
}
