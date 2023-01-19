import { PlotMode, RealTimePlot } from './realtime-plot.js';

/**
 * Various constants used in RealTimePlot and Plotter
 */
export class PlotterConstants {
    static TIME_SCALE = 2000;
    static DATA_SCALE = 50;

    // How many sample points do we save?
    // Once 'limit' is reached the array space will be recycled
    // This could be increased/decreased depending on the width
    // of the canvas; 1000 seems to work for a width of 768
    // so everything that is being discarded does so out of the viewport.
    static SAMPLE_POINTS_LIMIT = 1000;
}

/**
 * Represents a line of text with its own position and color
 */
export class PlotText {
    text;
    x; y;
    color;
    font = '35px serif';

    /**
     * @param text {String}
     * @param color {String=}
     */
    constructor(text, color) {
        this.text = text;
        this.color = color || 'rgb(255,255,255)';
        this.x = 0;
        this.y = 0;
    }

    draw(context) {
        context.font = this.font;

        const prevFillStyle = context.fillStyle;
        context.fillStyle = this.color.toString();

        context.fillText(this.text, this.x, this.y);

        // Restore previous color
        context.fillStyle = prevFillStyle
    }
}

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

/**
 * This class handles plotting real time values for multiple 'id(s)'
 * an 'id' consists of an array, with 2 nested arrays inside it.
 * one for the x values and one for the y values.
 * This class will step all values each frame and then draw all added id(s)
 * It is a wrapper around RealTimePlot
 */
export class Plotter {
    map = {};
    counts = {};
    textLines = {};
    options;
    rtPlot;

    // Private
    #mode = PlotMode.NORMAL;

    constructor(context, options) {
        const opts = Object.assign(DEFAULT_OPTIONS, options || {});
        this.options = opts;
        this.rtPlot = new RealTimePlot(context, opts);
    }

    /**
     * Register a new id
     *
     * @param id {String|Number}
     * @returns {Plotter}
     */
    registerId(id) {
        if (this.#isUndefined(this.map[id])) {
            // Use constant size arrays for efficiency
            this.map[id] = [
                new Array(PlotterConstants.SAMPLE_POINTS_LIMIT), // xValues
                new Array(PlotterConstants.SAMPLE_POINTS_LIMIT)  // yValues
            ];
        }
        if (this.#isUndefined(this.counts[id])) {
            // Since we use constant size arrays we need
            // to keep track of how many values we actually hold for each array.
            // This will be used to index the next element in its place
            this.counts[id] = { x: 0, y: 0 };
        }

        return this;
    }

    /**
     * Add a text line for the id passed
     *
     * @param id {String|Number}
     * @param plotText {PlotText}
     * @returns {Plotter}
     */
    addTextLine(id, plotText) {
        if (this.#isUndefined(this.textLines[id])) {
            this.textLines[id] = [];
        }

        this.textLines[id].push(plotText);

        return this;
    }

    /**
     * Step the values
     *
     * @param id {String|Number}
     * @param t {Number}
     * @param x {Number}
     * @param y {Number}
     */
    step(id, t, x, y) {
        if (this.#isUndefined(this.map[id]) || this.#isUndefined(this.counts[id])) {
            throw new Error(`Plotter->step() -No id: ${id}`);
        }

        const idValues = this.map[id];
        const counts = this.counts[id];
        for (let i = 0; i < idValues.length; i++) {
            const xValues = idValues[0];
            const yValues = idValues[1];

            this.#shiftArray(id, [xValues, yValues]);

            // console.log(counts.x, counts.y);
            if (this.rtPlot.mode === PlotMode.NORMAL) {
                xValues[counts.x] = t * PlotterConstants.TIME_SCALE;
                yValues[counts.y] = y * PlotterConstants.DATA_SCALE;

            } else {
                // Phase plot
                xValues[counts.x] = x * PlotterConstants.DATA_SCALE;
                yValues[counts.y] = y * PlotterConstants.DATA_SCALE;
            }

            // We just added a value to both array so update counts
            counts.x++;
            counts.y++;
        }
    }

    /**
     * Draws the graph
     *
     * @param id {String|Number}
     * @param time {Number}
     */
    draw(id, time) {
        if (this.#isUndefined(this.map[id]) || this.#isUndefined(this.counts[id])) {
            throw new Error(`Plotter->draw() - No id: ${id}`);
        }

        const idValues = this.map[id];
        const counts = this.counts[id];
        for (let i = 0; i < idValues.length; i++) {
            const xValues = idValues[0];
            const yValues = idValues[1];

            this.rtPlot.drawAxis(this.rtPlot.width + (time * PlotterConstants.TIME_SCALE), 300);
            this.rtPlot.draw(xValues, counts.x, yValues, counts.y);
        }
    }

    /**
     * Draws the text and animates it if we need to
     *
     * @param id {String|Number}
     * @param time {Number}
     * @param x {Number} Animatable
     * @param y {Array<Number>} Array of constant y values for each line
     */
    drawText(id, time, x, y) {
        const fillStyle = this.rtPlot.context.fillStyle;

        const lines = this.textLines[id];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            this.rtPlot.context.fillStyle = line.color.toString();

            if (this.rtPlot.mode === PlotMode.NORMAL) {
                // Only translate x if we're in a normal plot
                // 50; 50px margin from the right-align
                // time * timeScale; keep translating the x-axis as 'time' increases
                // i.e. we right align text and keep translating it as
                // the x-axis moves
                line.x = 50 + (time * PlotterConstants.TIME_SCALE);

            } else {
                line.x = x;
            }

            line.y = y[i];
            line.draw(this.rtPlot.context);
        }

        this.rtPlot.context.fillStyle = fillStyle;
    }

    /**
     * This function will shift all values in the arrays one index backwards.
     * Making sure to update the counts of actual values in the array.
     *
     * @param id {String}
     * @param xyValues {Array<Array<Number>>}
     */
    #shiftArray(id, xyValues) {
        const counts = this.counts[id];
        if (counts.x > PlotterConstants.SAMPLE_POINTS_LIMIT) {
            const xValues = xyValues[0];
            for (let i = 0; i < (counts.x - 1); i++) {
                xValues[i] = xValues[i + 1];
            }

            counts.x--;
        }

        if (counts.y > PlotterConstants.SAMPLE_POINTS_LIMIT) {
            const yValues = xyValues[1];
            for (let i = 0; i < (counts.y - 1); i++) {
                yValues[i] = yValues[i + 1];
            }

            counts.y--;
        }
    }

    /**
     * Checks if 'value' is 'undefined'
     *
     * @param value {*}
     * @returns {Boolean}
     */
    #isUndefined(value) {
        return (value === undefined);
    }
}
