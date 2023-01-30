import { Problem } from './problem.js';
import { NDSolve, NDSolveMethod } from '../src/ndsolve.js';
import { Plot } from './plot.js';

const VIEW_WIDTH = 1024,
    VIEW_HEIGHT = 768;

// Integration settings
const STEP_SIZE = 1 / 100,
    T_START = 0,
    T_END = 100;

// Plot settings
const plotOptions = {
    width: 1024,
    height: 768,
    stepSize: STEP_SIZE,
    mode: Plot.PLOT_MODE_PHASE,
    scale: 15,
    centerOrigin: false,
    drawPoints: false,
    axisColor: '#ffffff',
    plotColor: '#d92525',
    pointColor: '#00ff00'
};

let problem = Problem.getProblem('lorenz');
let plot;

doPlot(problem);

function doPlot(problem, mode) {
    // Save a copy of the initial conditions
    const initial = problem.y.slice(0);

    const y = problem.y;
    const context = createCanvas();

    // Solve and plot the results
    const solver = new NDSolve(y, problem.f, STEP_SIZE, NDSolveMethod.METHOD_RK4);
    plot = new Plot(context, plotOptions);

    plot.mode = mode || problem.plotMode;

    const xValues = [],
        yValues = [];

    for (let t = T_START; t < T_END; t += STEP_SIZE) {
        if (plot.mode === Plot.PLOT_MODE_NORMAL) {
            // Normal plot
            xValues.push(t);
            yValues.push(y[0]);

        } else {
            // Phase plot
            xValues.push(y[0]);
            yValues.push(y[1]);
        }

        solver.step(t);

        // Simple test for numerical instability, NaN !== NaN
        if (y[0] !== y[0] || isNaN(y[0])) {
            alert('Integration blew up at t = ' + t + '; use a smaller step size.');
            throw new Error('Got NaN at t = ' + t);
        }
    }

    // Plot
    plot.transform();
    plot.drawAxis(200, 200);
    plot.draw(xValues, yValues);

    // Restore initial conditions
    problem.y = initial;
}

function createCanvas() {
    const c = document.getElementsByTagName('canvas');
    if (c.length > 0) {
        // Remove the canvas that is already in the dom first.
        document.body.removeChild(c[0]);
    }

    // Create a new canvas element.
    const canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;

    document.body.appendChild(canvas);

    return context;
}


window.changeProblem = function (e) {
    const target = e.target;
    problem = Problem.getProblem(target.value);

    doPlot(problem);
};

window.togglePlotMode = function (e) {
    if (plot.mode === Plot.PLOT_MODE_PHASE) {
        plot.mode = Plot.PLOT_MODE_NORMAL;

    } else {
        plot.mode = Plot.PLOT_MODE_PHASE;
    }

    doPlot(problem, plot.mode);
};
