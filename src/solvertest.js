(function (document) {
    'use strict';

    var VIEW_WIDTH = 1024,
        VIEW_HEIGHT = 768,
        HALF_WIDTH = VIEW_WIDTH / 2,
        HALF_HEIGHT = VIEW_HEIGHT / 2;

    var canvas = document.getElementById('main'),
        context = canvas.getContext('2d');

    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;

    // Integration settings
    var STEP_SIZE = 1 / 100,
        T_START = 0,
        T_END = 75;

    // Plot settings
    var SCALE = 15,
        INVERSE_SCALE = 1 / SCALE,
        CENTER_ORIGIN = true,
        DRAW_POINTS = false,
        AXIS_COLOR = '#ffffff',
        PLOT_COLOR = '#ff0000',
        POINT_COLOR = '#00ff00';

    var y;

    // Test Problems
    /** The simplest possible problem, 1D motion at a constant velocity */
//    y = [0];
//    var V0 = 10;
//
//    var f = function (t, y, dydt) {
//        dydt[0] = V0;
//    };

    /** Object thrown off an initial height with initial velocity */
//    y = [10];
//    var g = 9.8;
//    var V0 = 10; // Positive is thrown up
//
//    var f = function (t, y, dydt) {
//        dydt[0] = -g * t + V0;
//    };

    /** A variation on some ODE from Mathematica which cannot be solved analytically */
//    y = [10];
//    var K = 1 / 10;
//
//    var f = function (t, y, dydt) {
//        dydt[0] = K * y[0] * Math.cos(t + y[0]);
//    };

    /** Van der Pol oscillator */
//    y = [1, 0];
//    var MU = 2,// 8.53
//        A = 1.2,
//        OMEGA = 2 * Math.PI / 10;
//
//    var f = function (t, y, dydt) {
//        dydt[0] = y[1];
//        dydt[1] = MU * (1 - y[0] * y[0]) * y[1] - y[0];
////        dydt[1] = MU * (1 - y[0] * y[0]) * y[1] - y[0] + A * Math.sin(t * OMEGA); // Forced
//    };

    /** Single pendulums */
//    y = [-3 * Math.PI / 4, 0];
//    var g = 9.8,
//        l = 3.5,
//        DELTA = 0.05,
//        A = 1.58,
//        OMEGA = 1.23;
//
//    var f = function (t, y, dydt) {
//        dydt[0] = y[1];
////        dydt[1] = -(g / l) * y[0]; // Linear
////        dydt[1] = -(g / l) * Math.sin(y[0]); // Non linear
//        dydt[1] = -DELTA * y[1] + (g / l) * Math.sin(y[0]); // Non linear damped
////        dydt[1] = -DELTA * y[1] + (g / l) * Math.sin(y[0]) + A * Math.cos(t * OMEGA); // Non linear damped and forced
//    };

    /** Lorenz attractor */
    y = [-1, 3, 4];
    var SIGMA = 10,
        RHO = 28,
        BETA = 8 / 3;

    var f = function (t, y, dydt) {
        dydt[0] = SIGMA * (y[1] - y[0]);
        dydt[1] = y[0] * (RHO - y[2]) - y[1];
        dydt[2] = y[0] * y[1] - BETA * y[2];
    };

    /** Rossler attractor */
//    y = [1, 1, -1];
//    var a = 0.1, // 0.1, 0.2
//        b = 0.1, // 0.1, 0.2
//        c = 14; // 5.7, 14
//
//    var f = function (t, y, dydt) {
//        dydt[0] = -y[1] - y[2];
//        dydt[1] = y[0] + a * y[1];
//        dydt[2] = b + y[2] * (y[0] - c);
//    };

//    var problem = new Problem('simple');

    // Solve
//    var solver = new NDSolve(problem.initial, problem.f, STEP_SIZE);
    var solver = new NDSolve(y, f, STEP_SIZE);

    var t,
        xValues = [],
        yValues = [],
        output = [];

    for (t = T_START; t < T_END; t += STEP_SIZE) {
        // Normal plot
//        xValues.push(t);
//        yValues.push(y[0]);
//        yValues.push(y[1]);
//        yValues.push(y[2]);

        // Phase plot
        xValues.push(y[0]);
        yValues.push(y[1]);

        //output.push(y.slice(0)); // Copy array, not reference
        solver.rk4Step(t);

        // Simple test for numerical instability, NaN !== NaN
        if (y[0] !== y[0] || isNaN(y[0])) {
            alert('Integration blew up at t = ' + t + '; use a smaller step size.');
            console.error('y[t] values', y);
            throw new Error('Got NaN at t = ' + t);
        }
    }

    // Plot
    transform(CENTER_ORIGIN);
    drawAxis(200, 200);
    plot(xValues, yValues, DRAW_POINTS);

    /**
     * Set canvas transforms.
     *
     * @param [centerOrigin] {Boolean}
     */
    function transform(centerOrigin) {
//        context.setTransform(1, 0, 0, 1, 0, 0);

        if (centerOrigin === true) {
            context.translate(HALF_WIDTH, HALF_HEIGHT); // Center the origin
        } else {
            context.translate(20, HALF_HEIGHT); // Align to left
        }

        context.scale(SCALE, SCALE);
        context.clearRect(-VIEW_WIDTH, -VIEW_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);
    }

    /**
     * Draw a simple plot.
     * Flips the y values so positive is up.
     *
     * @param x {Array<Number>}
     * @param y {Array<Number>}
     * @param [drawPoints] {Boolean}
     */
    function plot(x, y, drawPoints) {
        var i, length = x.length;

        if (x.length !== y.length) {
            throw new Error('plot(): Number of x values has to match number of y values.');
        }

        context.lineWidth = INVERSE_SCALE;
        context.strokeStyle = PLOT_COLOR;
        context.beginPath();

        for (i = 0; i < (length - 1); i++) {
            context.moveTo(x[i], -y[i]);
            context.lineTo(x[i + 1], -y[i + 1]);
        }

        context.closePath();
        context.stroke();

        if (drawPoints === true && STEP_SIZE >= 1 / 100) {
            context.fillStyle = POINT_COLOR;
            context.beginPath();
            for (i = 0; i < length; i++) {
                context.arc(x[i], -y[i], INVERSE_SCALE, 0, 2 * Math.PI);
                context.closePath();
            }

            context.fill();
        }
    }

    /**
     * Draw the axis.
     *
     * @param [xMax] {Number}
     * @param [yMax] {Number}
     */
    function drawAxis(xMax, yMax) {
        var X_MAX = xMax || 200,
            Y_MAX = yMax || 100;

        context.lineWidth = INVERSE_SCALE;
        context.strokeStyle = AXIS_COLOR;
        context.beginPath();

        context.moveTo(0, -Y_MAX);
        context.lineTo(0, Y_MAX);
        context.moveTo(-X_MAX, 0);
        context.lineTo(X_MAX, 0);

        context.closePath();
        context.stroke();
    }

})(document);
