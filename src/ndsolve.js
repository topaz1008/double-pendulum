export class NDSolve {

    /**
     * A simple numerical differential equations solver.
     *
     * Supports the classical Runge-Kutta method (RK4).
     * and Euler's forward method.
     *
     * @param y0 {Array<Number>}
     * @param f {Function}
     * @param stepSize {Number}
     */
    constructor(y0, f, stepSize) {
        this.yOut = y0;
        this.f = f;
        this.dimension = y0.length;
        this.stepSize = stepSize;

        // Temp storage
        this.dydt = new Array(this.dimension);
        this.yt = new Array(this.dimension);
        this.dyt = new Array(this.dimension);
        this.dyMid = new Array(this.dimension);
    }

    /**
     * RK4 step.
     *
     * @param t {Number}
     * @returns {Array<Number>}
     */
    rk4Step(t) {
        const halfStep = this.stepSize / 2,
            sixthStep = this.stepSize / 6,
            tHalf = t + halfStep;

        // k1
        this.f(t, this.yOut, this.dydt);
        for (let i = 0; i < this.dimension; i++) {
            this.yt[i] = this.yOut[i] + halfStep * this.dydt[i];
        }

        // k2
        this.f(tHalf, this.yt, this.dyt);
        for (let i = 0; i < this.dimension; i++) {
            this.yt[i] = this.yOut[i] + halfStep * this.dyt[i];
        }

        // k3
        this.f(tHalf, this.yt, this.dyMid);
        for (let i = 0; i < this.dimension; i++) {
            this.yt[i] = this.yOut[i] + this.stepSize * this.dyMid[i];
            this.dyMid[i] += this.dyt[i];
        }

        // k4
        this.f(t + this.stepSize, this.yt, this.dyt);
        for (let i = 0; i < this.dimension; i++) {
            this.yOut[i] = this.yOut[i] + sixthStep * (this.dydt[i] + this.dyt[i] + 2 * this.dyMid[i]);
        }

        return this.yOut;
    }

    /**
     * Euler step.
     * Only practical for very small step sizes and simple problems.
     * Or ones where accuracy is not an issue.
     *
     * @param t {Number}
     * @returns {Array<Number>}
     */
    eulerStep(t) {
        this.f(t, this.yOut, this.dydt);
        for (let i = 0; i < this.dimension; i++) {
            this.yOut[i] = this.yOut[i] + this.stepSize * this.dydt[i];
        }

        return this.yOut;
    }
}
