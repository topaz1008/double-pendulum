import { RealTimePlot } from './realtime-plot.js';

// Plot settings
const DEFAULT_OPTIONS = {
    width: 1024,
    height: 768 / 2,
    stepSize: 1 / 1000,
    mode: RealTimePlot.PLOT_MODE_NORMAL,
    scale: 1,
    drawPoints: false,
    axisColor: 'rgb(0,0,0)',
    plotColor: 'rgb(56,229,19)',
    pointColor: 'rgb(0,0,0)'
};

/**
 * This class handles plotting real time values for multiple 'id(s)'
 * an 'id' consists of an array, with 2 nested arrays inside it.
 * one for the x values and one for the y values.
 * This class will step all values each frame and then draw all added id(s)
 */
export class Plotter {
    static TIME_SCALE = 2000;
    static ARRAY_SIZE_LIMIT = 600;
    static DATA_SCALE = 50;

    map = {};
    rtPlot;

    constructor(context) {
        this.rtPlot = new RealTimePlot(context, DEFAULT_OPTIONS);
    }

    add(id) {
        if (this.map[id] === undefined) {
            this.map[id] = [[], []];
        }
    }

    step(id, t, x, y) {
        if (!this.map[id]) {
            throw new Error(`No id: ${id}`);
        }

        const idValues = this.map[id];
        for (let i = 0; i < idValues.length; i++) {
            const xValues = idValues[0];
            const yValues = idValues[1];

            this.#limitArraySize(xValues, Plotter.ARRAY_SIZE_LIMIT);
            this.#limitArraySize(yValues, Plotter.ARRAY_SIZE_LIMIT);
            for (let j = 0; j < xValues.length; j++) {
                if (this.rtPlot.mode === RealTimePlot.PLOT_MODE_NORMAL) {
                    xValues.push(t * Plotter.TIME_SCALE);
                    xValues.push(x * Plotter.DATA_SCALE);

                } else {
                    // Phase plot
                    yValues.push(x * Plotter.DATA_SCALE);
                    yValues.push(y * Plotter.DATA_SCALE);
                }
            }
        }
    }

    draw(id, time) {
        if (!this.map[id]) {
            throw new Error(`No id: ${id}`);
        }

        const values = this.map[id];
        for (let i = 0; i < values.length; i++) {
            this.rtPlot.clear(time, Plotter.TIME_SCALE);
            this.rtPlot.drawAxis(this.rtPlot.width + (time * Plotter.TIME_SCALE), 300);
            this.rtPlot.draw(bob1X, bob1Y);
        }


        this.rtPlot.draw(bob1X, bob1Y);

        this.rtPlot.setPlotColor('rgb(21,38,218)');
        this.rtPlot.draw(bob2X, bob2Y);

        this.rtPlot.restorePlotColor();
    }

    /**
     * This function will make sure 'arr.length' stays with in 'limit'.
     * NOTE: This implementation causes a lot of garbage to be created.
     * it could be optimized by having a constant size array where indices are being recycled.
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
