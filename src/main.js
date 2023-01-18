import { DoublePendulum } from './double-pendulum.js';
import { PlotMode } from './realtime-plot.js';
import { Plotter, PlotterConstants, PlotText } from './plotter.js';
import {
    mainBackgroundColor,
    pendulum1Colors,
    pendulum2Colors,
    plotBackgroundColor,
    plotTextColor,
    plotColors
} from './color-constants.js';

// General constants
const VIEW_WIDTH = 1024,
    VIEW_HEIGHT = 768,
    FPS = 60,
    PI = Math.PI,
    HALF_WIDTH = VIEW_WIDTH / 2,
    HALF_HEIGHT = VIEW_HEIGHT / 2;

// Integration settings
const STEP_SIZE = 1 / 1000;

// State variables
let time = 0,
    isPaused = false;

const context = createCanvas('main', VIEW_WIDTH, VIEW_HEIGHT);
const plotContext = createCanvas('plot', VIEW_WIDTH, HALF_HEIGHT);

const options = {
    gravity: 9.81,
    origin: { x: 0, y: 0 },
    stepSize: STEP_SIZE,
    l1: 1, // Length of rod 1 (top)
    m1: 1, // Mass of bob 1 (top)
    l2: 1, // Length of rod 2 (bottom)
    m2: 1  // Mass of bob 2 (bottom)
};

// Initial conditions [theta1, theta2, omega1, omega2]
const y0 = [3 * PI / 4, PI, 0, 0];
const pendulum1 = new DoublePendulum(y0, context, FPS, Object.assign(options, {
    rodColor: pendulum1Colors.rod,
    bobColor: pendulum1Colors.bob,
    pathColor: pendulum1Colors.path
}));

// Add another pendulum to show how very small changes in the initial conditions
// make for drastic change in behaviour in a very short time.
// This is what makes this system chaotic.
const EPSILON = 1 / 10000;
const y0_2 = [(3 * PI / 4) + EPSILON, PI, 0, 0];
const pendulum2 = new DoublePendulum(y0_2, context, FPS, Object.assign(options, {
    rodColor: pendulum2Colors.rod,
    bobColor: pendulum2Colors.bob,
    pathColor: pendulum2Colors.path
}));

// Plot settings
const plotOptions = {
    width: VIEW_WIDTH,
    height: HALF_HEIGHT,
    stepSize: STEP_SIZE,
    mode: PlotMode.NORMAL,
    scale: 1,
    centerOrigin: false,
    drawPoints: false,
    backgroundColor: plotBackgroundColor,
    axisColor: plotColors.axis,
    plotColor: plotColors.plot,
    pointColor: plotColors.point
};

const ID_AXIS = 1,
    ID_P1 = 2,
    ID_P2 = 2;

const plotter = new Plotter(plotContext, plotOptions);
plotter.add(ID_P1).add(ID_P2);

plotter.addTextLine(ID_AXIS, new PlotText('x = time',plotTextColor))
    .addTextLine(ID_AXIS, new PlotText('y = pendulum1 bob1 x position', pendulum1Colors.path))
    .addTextLine(ID_AXIS, new PlotText('y = pendulum2 bob1 x position', pendulum2Colors.path));

function plotStep(t) {
    // Step plot
    const b1 = pendulum1.position1(true),
        b2 = pendulum2.position1(true);

    // noinspection JSSuspiciousNameCombination :)
    plotter.step(ID_P1, t, t, b1.x);
    // noinspection JSSuspiciousNameCombination
    plotter.step(ID_P2, t, t, b2.x);
}

function plotDraw() {
    // Draw plot
    plotter.rtPlot.clear(time);
    plotter.rtPlot.drawAxis(VIEW_WIDTH + (time * PlotterConstants.TIME_SCALE), 300);

    const textXposition = 50 + (time * PlotterConstants.TIME_SCALE);

    plotter.drawText(ID_AXIS, textXposition, [50, 100, 150]);

    plotter.rtPlot.setPlotColor(pendulum1Colors.path);
    plotter.draw(ID_P1, time);

    plotter.rtPlot.setPlotColor(pendulum2Colors.path);
    plotter.draw(ID_P2, time);
    plotter.rtPlot.restorePlotColor();
}

function createCanvas(id, width, height) {
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

    document.body.appendChild(c);

    return ctx;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
        isPaused = !isPaused;
    }

}, false);

requestAnimationFrame(update);

/**
 * Update loop
 */
function update() {
    if (!isPaused) {
        time += STEP_SIZE;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(HALF_WIDTH, HALF_HEIGHT);
    context.fillStyle = mainBackgroundColor;
    context.clearRect(-HALF_WIDTH, -HALF_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);
    context.fillRect(-HALF_WIDTH, -HALF_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);

    // Update the pendulums
    pendulum1.draw();
    if (!isPaused) pendulum1.step();

    pendulum2.draw();
    if (!isPaused) pendulum2.step();

    // Update the bottom plot
    plotDraw();
    if (!isPaused) plotStep(time);

    requestAnimationFrame(update);
}
