import { Plot } from './plot.js';

const problems = {
    // The simplest possible problem, 1D motion at a constant velocity
    simple: {
        y: [0],
        plotMode: Plot.PLOT_MODE_NORMAL,
        f: function (t, y, dydt) {
            const v0 = 10;

            dydt[0] = v0;
        }
    },

    // Object thrown off an initial height with initial velocity
    ballistic: {
        y: [10],
        plotMode: Plot.PLOT_MODE_NORMAL,
        f: function (t, y, dydt) {
            const v0 = 10;

            dydt[0] = v0;
        }
    },

    // A variation on some ODE from Mathematica which cannot be solved analytically
    ODE1: {
        y: [10],
        plotMode: Plot.PLOT_MODE_NORMAL,
        f: function (t, y, dydt) {
            const K = 1 / 10;

            dydt[0] = K * y[0] * Math.cos(t + y[0]);
        }
    },

    // Van der Pol oscillator
    vanderpol: {
        y: [1, 0],
        plotMode: Plot.PLOT_MODE_PHASE,
        f: function (t, y, dydt) {
            const MU = 2,
                A = 1.2,
                OMEGA = 2 * Math.PI / 10;

            dydt[0] = y[1];
            dydt[1] = MU * (1 - y[0] * y[0]) * y[1] - y[0];

            //dydt[1] = MU * (1 - y[0] * y[0]) * y[1] - y[0] + A * Math.sin(t * OMEGA); // Forced
        }
    },

    // Single pendulums
    // Has several types; Comment out the ones you don't care about.
    singlependulum: {
        y: [-3 * Math.PI / 4, 0],
        plotMode: Plot.PLOT_MODE_NORMAL,
        f: function (t, y, dydt) {
            const g = 9.8,
                l = 1.2,
                DELTA = 0.05,
                A = 1.58,
                OMEGA = 1.23;

            dydt[0] = y[1];

            // Linear pendulum
            // dydt[1] = -(g / l) * y[0];

            // Non-linear pendulum
            // dydt[1] = -(g / l) * Math.sin(y[0]);

            // Non-linear damped
            dydt[1] = -DELTA * y[1] + (g / l) * Math.sin(y[0]);

            // Non-linear damped and forced
            // dydt[1] = -DELTA * y[1] + (g / l) * Math.sin(y[0]) + A * Math.cos(t * OMEGA);
        }
    },

    // Lorenz attractor
    lorenz: {
        y: [-1, 3, 4],
        plotMode: Plot.PLOT_MODE_PHASE,
        f: function (t, y, dydt) {
            const SIGMA = 10,
                RHO = 28,
                BETA = 8 / 3;

            dydt[0] = SIGMA * (y[1] - y[0]);
            dydt[1] = y[0] * (RHO - y[2]) - y[1];
            dydt[2] = y[0] * y[1] - BETA * y[2];
        }
    },

    // Rossler attractor
    rossler: {
        y: [1, 1, -1],
        plotMode: Plot.PLOT_MODE_PHASE,
        f: function (t, y, dydt) {
            const a = 0.1, // 0.1, 0.2
                b = 0.1, // 0.1, 0.2
                c = 14; // 5.7, 14

            dydt[0] = -y[1] - y[2];
            dydt[1] = y[0] + a * y[1];
            dydt[2] = b + y[2] * (y[0] - c);
        }
    }
};

export class Problem {
    static getProblem(name) {
        if (typeof problems[name] !== 'object') {
            throw new Error(`Invalid problem name ${name}`);
        }

        return problems[name];
    }
}
