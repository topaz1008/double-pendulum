import { DoublePendulum } from './double-pendulum.js';
import { RealTimePlot } from './realtime-plot.js';
import {
    mainBackgroundColor,
    pendulum1Colors,
    pendulum2Colors,
    plotBackgroundColor,
    plotTextColor,
    plotColors
} from './color-constants.js';

const VIEW_WIDTH = 1024,
    VIEW_HEIGHT = 768,
    FPS = 60;

const PI = Math.PI,
    HALF_WIDTH = VIEW_WIDTH / 2,
    HALF_HEIGHT = VIEW_HEIGHT / 2;

let time = 0,
    isPaused = false;

const context = createCanvas('main', VIEW_WIDTH, VIEW_HEIGHT);
const plotContext = createCanvas('plot', VIEW_WIDTH, HALF_HEIGHT);

// Integration settings
const STEP_SIZE = 1 / 1000;

const options = {
    gravity: 9.81,
    origin: { x: 0, y: 0 },
    stepSize: 1 / 1000,
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
    width: 1024,
    height: HALF_HEIGHT,
    stepSize: STEP_SIZE,
    mode: RealTimePlot.PLOT_MODE_NORMAL,
    scale: 1,
    centerOrigin: false,
    drawPoints: false,
    backgroundColor: plotBackgroundColor,
    axisColor: plotColors.axis,
    plotColor: plotColors.plot,
    pointColor: plotColors.point
};

// TODO: WIP; refactor this into Plotter class
const bob1X = [], bob1Y = [],
    bob2X = [], bob2Y = [];

const timeScale = 2000;
const plot = new RealTimePlot(plotContext, plotOptions);


function limitArraySize(arr, limit) {
    if (arr.length > limit) {
        arr.splice(0, Math.round(limit / 2));
    }

    return arr.length;
}

function plotStep(t) {
    // Step plot TODO: WIP
    const b1 = pendulum1.position1(true),
        // b2 = pendulum1.position2(true);
        b2 = pendulum2.position1(true);

    const arrLimit = 600;
    limitArraySize(bob1X, arrLimit);
    limitArraySize(bob1Y, arrLimit);
    limitArraySize(bob2X, arrLimit);
    limitArraySize(bob2Y, arrLimit);

    const scale = 50;
    if (plot.mode === RealTimePlot.PLOT_MODE_NORMAL) {
        bob1X.push(t * timeScale);
        bob1Y.push(b1.x * scale);

    } else {
        // Phase plot
        bob1X.push(b1.x * scale);
        bob1Y.push(b1.y * scale);
    }

    if (plot.mode === RealTimePlot.PLOT_MODE_NORMAL) {
        bob2X.push(t * timeScale);
        bob2Y.push(b2.x * scale);

    } else {
        bob2X.push(b2.x);
        bob2Y.push(b2.y * scale);
    }
}

function plotDraw() {
    // Draw plot TODO: WIP
    plot.clear(time, timeScale);
    plot.drawAxis(VIEW_WIDTH + (time * timeScale), 300);

    plotContext.font = '35px serif';
    const x = 50 + (time * timeScale);

    plotContext.fillStyle = plotTextColor;
    plotContext.fillText('x = time', x, 50);
    plotContext.fillStyle = 'rgb(0,204,0)';
    plotContext.fillText('y = pendulum1 bob1 x position', x, 100);
    plotContext.fillStyle = 'rgb(0,0,204)';
    plotContext.fillText('y = pendulum2 bob1 x position', x, 150);

    plot.draw(bob1X, bob1Y);

    plot.setPlotColor('rgb(0,0,204)');
    plot.draw(bob2X, bob2Y);

    plot.restorePlotColor();
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
