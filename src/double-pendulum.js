import { NDSolve } from './ndsolve.js';
import { Color } from './color.js';

// Default options
// Used if no options are passed
const DEFAULT_OPTIONS = {
    gravity: 9.81,
    origin: { x: 0, y: 0 },
    stepSize: 1 / 1000,
    l1: 1, // Length of rod 1 (top)
    m1: 1, // Mass of bob 1 (top)
    l2: 1, // Length of rod 2 (bottom)
    m2: 1, // Mass of bob 2 (bottom)
    backgroundColor: 'rgb(0,0,0)',
    rodColor: 'rgb(0,204,0)',
    bobColor: 'rgb(255,255,255)',
    pathColor: 'rgb(0,204,0)'
};

// Named constants for easier array access
const THETA_1 = 0,
    THETA_2 = 1,
    OMEGA_1 = 2,
    OMEGA_2 = 3;

export class DoublePendulum {
    static TIME_SCALE = 1 / 1.15;
    static MAX_PATH_POINTS = 150;
    static PATH_SIMPLIFY = 2;

    // Graphics scaling
    static ROD_SCALE = 125;
    static BOB_SCALE = 10;

    #timeScale;

    /**
     * A Double pendulum simulation.
     * Will step the physics simulation and render it.
     *
     * @param y0 {Array<Number>}
     * @param context {CanvasRenderingContext2D}
     * @param options {Object}
     */
    constructor(y0, context, options) {
        this.y = y0;
        this.context = context;

        options = Object.assign(DEFAULT_OPTIONS, options || {});

        this.stepSize = options.stepSize;

        const equations = this.#equations.bind(this); // Oh javascript
        this.solver = new NDSolve(this.y, equations, this.stepSize, NDSolve.METHOD_RK4);

        this.time = 0;
        this.fps = options.fps;

        this.backgroundColor = Color.fromString(options.backgroundColor);
        this.rodColor = Color.fromString(options.rodColor);
        this.bobColor = Color.fromString(options.bobColor);
        this.pathColor = Color.fromString(options.pathColor);

        this.#timeScale = options.timeScale || DoublePendulum.TIME_SCALE;

        this.timeScaleIterations = this.#calcTimeScaleIteration(this.#timeScale);

        this.gravity = options.gravity;
        this.origin = options.origin;

        this.m1 = options.m1; // Mass of bob 1
        this.l1 = options.l1; // Length of rod 1
        this.m2 = options.m2; // Mass of bob 2
        this.l2 = options.l2; // Length of rod 2

        this.theta1 = y0[THETA_1];
        this.omega1 = y0[OMEGA_1];
        this.theta2 = y0[THETA_2];
        this.omega2 = y0[OMEGA_2];

        this.path = [];

        this.drawCalls = 0;
    }

    get timeScale() {
        return this.#timeScale;
    }

    set timeScale(value) {
        this.timeScaleIterations = this.#calcTimeScaleIteration(value);
    }


    /**
     * Step the simulation.
     */
    step() {
        for (let i = 0; i < this.timeScaleIterations; i++) {
            this.solver.step(this.time);
            this.time += this.stepSize;
        }
    }

    /**
     * Draw the pendulum.
     */
    draw() {
        const bob1 = this.position1(),
            bob2 = this.position2();

        if (this.path.length >= DoublePendulum.MAX_PATH_POINTS) {
            // Remove first element
            delete this.path[0];
            this.path.shift();
        }

        if ((this.drawCalls % DoublePendulum.PATH_SIMPLIFY) === 0) {
            // Only push every PATH_SIMPLIFY points to make the path a little lower res, but longer.
            this.path.push(bob2);
            this.drawCalls = 0;
        }

        this.#drawPath();

        this.#drawRod(this.origin, bob1);
        this.#drawRod(bob1, bob2);

        this.#drawBob(this.origin, (DoublePendulum.BOB_SCALE / 1.5));
        this.#drawBob(bob1, DoublePendulum.BOB_SCALE * this.m1);
        this.#drawBob(bob2, DoublePendulum.BOB_SCALE * this.m2);

        this.drawCalls++;
    }

    /**
     * Draw a single rod from p0 to p1.
     *
     * @param p0 {Object}
     * @param p1 {Object}
     * @private
     */
    #drawRod(p0, p1) {
        this.context.lineWidth = 4;
        this.context.strokeStyle = this.rodColor.toString();
        this.context.beginPath();
        this.context.moveTo(p0.x, p0.y);
        this.context.lineTo(p1.x, p1.y);
        this.context.closePath();
        this.context.stroke();
    }

    /**
     * Draw a single bob.
     *
     * @param p0 {Object}
     * @param radius {Number}
     * @private
     */
    #drawBob(p0, radius) {
        this.context.lineWidth = 2;
        this.context.fillStyle = this.bobColor.toString();
        this.context.beginPath();
        this.context.arc(p0.x, p0.y, radius, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
    }

    /**
     * Draw the trace path.
     *
     * @private
     */
    #drawPath() {
        const pathLength = this.path.length;

        this.context.lineWidth = 2;

        for (let i = 0; i < (pathLength - 1); i++) {
            const p0 = this.path[i];
            const p1 = this.path[i + 1];

            const t = 1 - (i / pathLength);
            const c = this.pathColor.interpolate(t, this.backgroundColor);

            this.context.strokeStyle = c.toString();
            this.context.beginPath();

            this.context.moveTo(p0.x, p0.y);
            this.context.lineTo(p1.x, p1.y);
            // this.context.closePath();
            this.context.stroke();
        }
    }

    /**
     * Get the first bob's current position in cartesian coordinates.
     *
     * @param raw {Boolean=}
     * @returns {Object}
     */
    position1(raw) {
        const scale = ((raw === true) ? this.l1 : this.l1 * DoublePendulum.ROD_SCALE);

        return {
            x: scale * Math.sin(this.y[THETA_1]),
            y: scale * Math.cos(this.y[THETA_1])
        };
    }

    /**
     * Get the second bob's current position in cartesian coordinates.
     *
     * @param raw {Boolean=}
     * @returns {Object}
     */
    position2(raw) {
        const l1Scale = ((raw === true) ? this.l1 : this.l1 * DoublePendulum.ROD_SCALE);
        const l2Scale = ((raw === true) ? this.l2 : this.l2 * DoublePendulum.ROD_SCALE);

        return {
            x: l1Scale * Math.sin(this.y[THETA_1]) + l2Scale * Math.sin(this.y[THETA_2]),
            y: l1Scale * Math.cos(this.y[THETA_1]) + l2Scale * Math.cos(this.y[THETA_2])
        };
    }

    /**
     * How many integration steps to take in one call to step() (one frame).
     * Since the solver integrates in real-time and uses a fixed step size.
     * The speed of the simulation is tied to that step size.
     * this factor allows a control over time scaling according to the fps and an arbitrary timescale constant.
     *
     * @param timeScale {Number}
     * @returns {Number}
     */
    #calcTimeScaleIteration(timeScale) {
        return Math.round((1 / this.stepSize) / this.fps * timeScale);
    }

    /**
     * The differential equations of motion for a double pendulum system.
     *
     * @link http://scienceworld.wolfram.com/physics/DoublePendulum.html
     * @link http://en.wikipedia.org/wiki/Double_pendulum
     *
     * @param t {Number}
     * @param y {Array<Number>}
     * @param dydt {Array<Number>}
     * @private
     */
    #equations(t, y, dydt) {
        const m1 = this.m1, m2 = this.m2,
            l1 = this.l1, l2 = this.l2,
            g = this.gravity;

        const dTheta = y[THETA_2] - y[THETA_1]; // The change in angle

        const sinTheta1 = Math.sin(y[THETA_1]),
            sinTheta2 = Math.sin(y[THETA_2]),
            sinDtheta = Math.sin(dTheta),
            cosDtheta = Math.cos(dTheta);

        const M = m1 + m2; // Total mass of the system

        this.theta1 = y[THETA_1];
        this.theta2 = y[THETA_2];

        this.omega1 = dydt[THETA_1] = y[OMEGA_1]; // dTheta1/dt = omega1 by definition

        let denominator = l1 * (M - m2 * cosDtheta * cosDtheta);

        dydt[OMEGA_1] = (l1 * m2 * y[OMEGA_1] * y[OMEGA_1] * sinDtheta * cosDtheta +
            l2 * m2 * y[OMEGA_2] * y[OMEGA_2] * sinDtheta -
            g * M * sinTheta1 +
            g * m2 * sinTheta2 * cosDtheta) / denominator;

        this.omega2 = dydt[THETA_2] = y[OMEGA_2]; // dTheta2/dt = omega2 by definition

        denominator *= l2 / l1; // Scale by the ratio of rod's length

        dydt[OMEGA_2] = -((l1 * M * y[OMEGA_1] * y[OMEGA_1] * sinDtheta +
            l2 * m2 * y[OMEGA_2] * y[OMEGA_2] * sinDtheta * cosDtheta -
            g * M * sinTheta1 * cosDtheta +
            g * M * sinTheta2) / denominator);
    }
}
