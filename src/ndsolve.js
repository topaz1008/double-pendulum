export class NDSolve {
    static METHOD_EULER_FORWARD = 0;
    static METHOD_EULER_GENERALIZED = 1;
    static METHOD_RK4 = 2;

    /**
     * A simple numerical differential equations solver.
     *
     * Supports the classical Runge-Kutta method (RK4).
     * and Euler's forward method.
     *
     * @param y0 {Array<Number>}
     * @param f {Function}
     * @param stepSize {Number}
     * @param method {Number=}
     */
    constructor(y0, f, stepSize, method) {
        this.yOut = y0;
        this.f = f;
        this.dimension = y0.length;
        this.stepSize = stepSize;
        this.method = method || NDSolve.METHOD_RK4;

        // Temp storage
        this.dydt = new Array(this.dimension);
        this.yt = new Array(this.dimension);
        this.dyt = new Array(this.dimension);
        this.dyMid = new Array(this.dimension);
    }

    step(t) {
        switch (this.method) {
            case NDSolve.METHOD_EULER_FORWARD: return this.#eulerForwardStep(t);
            case NDSolve.METHOD_EULER_GENERALIZED: return this.#eulerGeneralizedStep(t);

            case NDSolve.METHOD_RK4:
            default: return this.#rk4Step(t);
        }
    }

    /**
     * RK4 step.
     *
     * @param t {Number}
     * @returns {Array<Number>}
     */
    #rk4Step(t) {
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
     * Euler forward step.
     * Only practical for very small step sizes and simple problems.
     * Or ones where accuracy is not an issue.
     *
     * @param t {Number}
     * @returns {Array<Number>}
     */
    #eulerForwardStep(t) {
        this.f(t, this.yOut, this.dydt);
        for (let i = 0; i < this.dimension; i++) {
            this.yOut[i] = this.yOut[i] + this.stepSize * this.dydt[i];
        }

        return this.yOut;
    }

    /**
     * Euler generalized step.
     * Better than Euler forward, but not as good as RK4.
     *
     * @param t {Number}
     * @returns {Array<Number>}
     */
    #eulerGeneralizedStep(t) {
        // TODO: implement euler generalized method
        return this.#eulerForwardStep(t);
    }
}
