import { PlotMode, RealTimePlot } from './realtime-plot.js';

/**
 * This class holds scales for the x, y and t values.
 */
export class PlotDataScale {
    /**
     * @param xScale {Number=} The amount to scale the x values by
     * @param yScale {Number=} The amount to scale the y values by
     * @param timeScale {Number=} If not specified xScale will be used
     */
    constructor(xScale, yScale, timeScale) {
        this.x = xScale || 2000;
        this.y = yScale || 100;
        this.time = timeScale || this.x;
    }
}

/**
 * Represents a plot label with a line of text and its own position and color.
 */
export class PlotLabel {
    text;
    x; y;
    initialX; initialY;
    color;
    font = '30px serif';

    /**
     * @param text {String}
     * @param x {Number=}
     * @param y {Number=}
     * @param color {String=}
     */
    constructor(text, x, y, color) {
        this.text = text;
        this.color = color || 'rgb(255,255,255)';
        this.initialX = this.x = x || 0;
        this.initialY = this.y = y || 0;
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
 * It is a wrapper around RealTimePlot.
 */
export class Plotter {
    options = null;

    // Private
    #rtPlot = null;
    #values = {};
    #counts = {};
    #plotLabels = {};
    #dataScale = null;
    #mode = PlotMode.NORMAL;

    // How many sample points do we save?
    // Once 'limit' is reached the array space will be recycled
    // This could be increased/decreased depending on the width
    // of the canvas; 500 seems to work for a width of 384 (we only draw on have the canvas)
    // so everything that is being discarded does so out of the viewport.
    // When plot mode is set to PlotMode.PHASE then more values will be required
    // to maintain a path that is long enough (since nothing leaves the viewport)
    #samplePointLimit = 500;

    constructor(context, options) {
        const opts = Object.assign(DEFAULT_OPTIONS, options || {});
        this.options = opts;
        this.#dataScale = new PlotDataScale();
        this.#rtPlot = new RealTimePlot(context, opts);
    }

    //////////////////////
    // Public methods  //
    //////////////////////

    /**
     * @param s {PlotDataScale}
     * @returns {Plotter}
     */
    setDataScale(s) {
        this.#dataScale = this.#rtPlot.dataScale = s;

        return this;
    }

    /**
     * @param limit {Number}
     * @returns {Plotter}
     */
    setSamplePointLimit(limit) {
        this.#samplePointLimit = limit;

        return this;
    }

    /**
     * @param mode {PlotMode|Number}
     * @returns {Plotter}
     */
    setPlotMode(mode) {
        this.#mode = this.#rtPlot.mode = mode;

        return this;
    }

    /**
     * Add a text line for the id passed.
     *
     * @param id {String|Number}
     * @param plotText {PlotLabel}
     * @returns {Plotter}
     */
    addLabel(id, plotText) {
        if (this.#isUndefined(this.#plotLabels[id])) {
            this.#plotLabels[id] = [];
        }

        this.#plotLabels[id].push(plotText);

        return this;
    }

    /**
     * Step the values.
     *
     * @param id {String|Number}
     * @param x {Number}
     * @param y {Number}
     */
    step(id, x, y) {
        if (!this.#hasId(id)) {
            this.#registerId(id);
        }

        const idValues = this.#values[id];
        const counts = this.#counts[id];
        const xValues = idValues[0];
        const yValues = idValues[1];

        this.#shiftArray(id, [xValues, yValues]);

        if (this.#mode === PlotMode.NORMAL) {
            xValues[counts.x] = x * this.#dataScale.time;

        } else {
            // Phase space plot
            xValues[counts.x] = x * this.#dataScale.x;
        }

        yValues[counts.y] = y * this.#dataScale.y;

        // We just added a value to both array so update counts
        counts.x++;
        counts.y++;
    }

    /**
     * Draws the graph.
     *
     * @param id {String|Number}
     */
    draw(id) {
        if (this.#isUndefined(this.#values[id]) || this.#isUndefined(this.#counts[id])) {
            throw new Error(`Plotter->draw(): No id: ${id}; step() must be called before draw()`);
        }

        const idValues = this.#values[id];
        const counts = this.#counts[id];
        const xValues = idValues[0];
        const yValues = idValues[1];

        this.#rtPlot.draw(xValues, counts.x, yValues, counts.y);
    }

    /**
     * Draws the graphs for id(s) currently registered.
     *
     * @param colors {Array<String>}
     */
    drawAll(colors) {
        let i = 0;
        for (const id in this.#values) {
            this.#rtPlot.setPlotColor(colors[i++]);
            this.draw(id);

            this.#rtPlot.restorePlotColor();
        }
    }

    /**
     * Clears the canvas.
     *
     * @param time {Number}
     */
    clear(time) {
        this.#rtPlot.clear(time);
    }

    /**
     * Draws the axis.
     *
     * @param time {Number=}
     */
    drawAxis(time) {
        this.#rtPlot.drawAxis(this.#rtPlot.width + ((time ? time : 0) * this.#dataScale.time), 300);
    }

    /**
     * Draws the text and animates it if we need to.
     *
     * @param id {String|Number}
     * @param time {Number}
     */
    drawLabels(id, time) {
        const prevFillStyle = this.#rtPlot.context.fillStyle;

        const labels = this.#plotLabels[id];
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];

            this.#rtPlot.context.fillStyle = label.color.toString();

            if (this.#mode === PlotMode.NORMAL) {
                // Only translate x if we're in a normal plot
                // 100; 100px margin from the right-align
                // time * timeScale; keep translating the x-axis as 'time' increases
                // i.e. we right align text and keep translating it as
                // the x-axis moves
                label.x = label.initialX + (time * this.#dataScale.time);

            } else {
                // Phase space
                //label.x = x;
                // TODO: implement
                console.log('// TODO: implement');
            }

            // label.y = y[i];
            label.draw(this.#rtPlot.context);
        }

        this.#rtPlot.context.fillStyle = prevFillStyle;
    }

    //////////////////////
    // Private methods  //
    //////////////////////

    /**
     * This function will shift all values in the arrays one index backwards.
     * Making sure to update the counts of actual values in the array.
     *
     * @param id {String}
     * @param xyValues {Array<Array<Number>>}
     */
    #shiftArray(id, xyValues) {
        const counts = this.#counts[id];
        if (counts.x >= this.#samplePointLimit) {
            const xValues = xyValues[0];
            for (let i = 0; i < (counts.x - 1); i++) {
                xValues[i] = xValues[i + 1];
            }

            counts.x--;
        }

        if (counts.y >= this.#samplePointLimit) {
            const yValues = xyValues[1];
            for (let i = 0; i < (counts.y - 1); i++) {
                yValues[i] = yValues[i + 1];
            }

            counts.y--;
        }
    }

    /**
     * Register a new id.
     *
     * @param id {String|Number}
     * @returns {Plotter}
     */
    #registerId(id) {
        if (this.#isUndefined(this.#values[id])) {
            // Use constant size arrays for efficiency
            this.#values[id] = [
                new Array(this.#samplePointLimit), // xValues
                new Array(this.#samplePointLimit)  // yValues
            ];
        }
        if (this.#isUndefined(this.#counts[id])) {
            // Since we use constant size arrays we need
            // to keep track of how many values we actually hold for each array.
            // This will be used to index the next element in its place
            this.#counts[id] = { x: 0, y: 0 };
        }

        return this;
    }

    /**
     * @param id {String|Number}
     * @returns {Boolean}
     */
    #hasId(id) {
        return (this.#isUndefined(this.#values[id]) === false);
    }

    /**
     * Checks if 'value' is 'undefined'.
     *
     * @param value {*}
     * @returns {Boolean}
     */
    #isUndefined(value) {
        return (value === undefined);
    }
}
