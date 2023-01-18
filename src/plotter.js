import { PlotMode, RealTimePlot } from './realtime-plot.js';

// Plot settings
const DEFAULT_OPTIONS = {
    width: 1024,
    height: 768 / 2,
    stepSize: 1 / 1000,
    mode: 0, //PlotMode.NORMAL
    scale: 1,
    drawPoints: false,
    axisColor: 'rgb(0,0,0)',
    plotColor: 'rgb(56,229,19)',
    pointColor: 'rgb(0,0,0)'
};

export class PlotterConstants {
    static TIME_SCALE = 2000;
    static ARRAY_SIZE_LIMIT = 1000;
    static DATA_SCALE = 50;
}

/**
 * This class handles plotting real time values for multiple 'id(s)'
 * an 'id' consists of an array, with 2 nested arrays inside it.
 * one for the x values and one for the y values.
 * This class will step all values each frame and then draw all added id(s)
 */
export class Plotter {
    map = {};
    options;
    rtPlot;

    // Private
    #mode = PlotMode.NORMAL;

    constructor(context, options) {
        const opts = Object.assign(DEFAULT_OPTIONS, options || {});
        this.options = opts;
        this.rtPlot = new RealTimePlot(context, opts);
    }

    get mode() {
        return this.#mode;
    }

    set mode(value) {
        this.#mode = value;
    }

    add(id) {
        if (this.map[id] === undefined) {
            this.map[id] = [[], []];
        }

        return this;
    }

    step(id, t, x, y) {
        if (!this.map[id]) {
            throw new Error(`No id: ${id}`);
        }

        const idValues = this.map[id];
        for (let i = 0; i < idValues.length; i++) {
            const xValues = idValues[0];
            const yValues = idValues[1];

            this.#limitArraySize(xValues, PlotterConstants.ARRAY_SIZE_LIMIT);
            this.#limitArraySize(yValues, PlotterConstants.ARRAY_SIZE_LIMIT);

            if (this.rtPlot.mode === PlotMode.NORMAL) {
                xValues.push(t * PlotterConstants.TIME_SCALE);
                yValues.push(y * PlotterConstants.DATA_SCALE);

            } else {
                // Phase plot
                xValues.push(x * PlotterConstants.DATA_SCALE);
                yValues.push(y * PlotterConstants.DATA_SCALE);
            }
        }
    }

    draw(id, time) {
        if (!this.map[id]) {
            throw new Error(`No id: ${id}`);
        }

        const idValues = this.map[id];
        for (let i = 0; i < idValues.length; i++) {
            const xValues = idValues[0];
            const yValues = idValues[1];

            this.rtPlot.drawAxis(this.rtPlot.width + (time * PlotterConstants.TIME_SCALE), 300);
            this.rtPlot.draw(xValues, yValues);
        }
    }

    /**
     * This function will make sure 'arr.length' stays with in 'limit'.
     *
     * TODO: This implementation causes a lot of garbage to be created.
     *       it could be optimized by having a constant size array
     *       where indices are being recycled.
     *
     * @param arr {Array<Number>}
     * @param limit {Number}
     * @returns {Number}
     */
    #limitArraySize(arr, limit) {
        if (arr.length > limit) {
            arr.splice(0, Math.round(limit / 2));
        }

        return arr.length;
    }
}
