import { RealTimePlot } from './realtime-plot.js';

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
        const prevFillStyle = context.fillStyle;

        context.font = this.font;
        context.fillStyle = this.color.toString();
        context.fillText(this.text, this.x, this.y);

        // Restore previous color
        context.fillStyle = prevFillStyle
    }
}

/**
 * Plot mode enum.
 */
export class PlotMode {
    static NORMAL = 0;
    // noinspection JSUnusedGlobalSymbols
    static PHASE = 1;
}

/**
 * Hold default options and can be extended by the user.
 */
class PlotOptions {
    #defaultOptions = {
        width: 1024,
        height: 768 / 2,
        stepSize: 1 / 1000,
        lineWidth: 2,
        mode: PlotMode.NORMAL,
        scale: 1,
        dataScale: new PlotDataScale(),
        drawPoints: false,
        backgroundColor: 'rgb(0,0,0)',
        axisColor: 'rgb(255,255,255)',
        plotColor: 'rgb(56,229,19)',
        pointColor: 'rgb(255,255,255)'
    };

    #options = null;

    constructor(options) {
        this.#options = Object.assign(this.#defaultOptions, options || {});
    }

    get() { return this.#options; }
}

/**
 * This class handles plotting real time values for multiple 'id(s)'
 * an 'id' consists of an array, with 2 nested arrays inside it.
 * one for the x values and one for the y values.
 * This class will step all values each frame and then draw all added id(s)
 * It is a wrapper around RealTimePlot.
 */
export class Plotter {
    // Private
    #rtPlot = null;
    #values = {};
    #counts = {};
    #labels = {};
    #dataScale = null;
    #mode = PlotMode.NORMAL;
    #options = null;

    // How many sample points do we save?
    // Once 'limit' is reached the array space will be recycled
    // This could be increased/decreased depending on the width
    // of the canvas; 500 seems to work for a width of 384 (we only draw on half the canvas width)
    // so everything that is being discarded does so out of the viewport.
    // When plot mode is set to PlotMode.PHASE then more values will be required
    // to maintain a path that is long enough (since nothing leaves the viewport)
    #samplePointLimit = 500;
    #pathSimplify = 2;
    #drawCalls = 0;

    constructor(context, options) {
        this.#options = (new PlotOptions(options)).get();

        this.#dataScale = this.#options.dataScale;
        this.#rtPlot = new RealTimePlot(context, this.#options);

        this.#drawCalls = 0;
    }

    //////////////////////
    // Public methods   //
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
     * @param amount {Number}
     * @returns {Plotter}
     */
    setPathSimplify(amount) {
        if (amount > 0 && amount < 6) {
            this.#pathSimplify = amount;
        }

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
     * Toggles drawPoints option on/off.
     */
    toggleDrawPoints() {
        this.#rtPlot.toggleDrawPoints();
    }

    /**
     * Sets the plot step size
     */
    setStepSize(inverseStepSize) {
        this.#rtPlot.setStepSize(inverseStepSize);
    }

    /**
     * Add text labels for the id passed.
     *
     * @param id {String|Number}
     * @param labels {Array<PlotLabel>}
     * @returns {Plotter}
     */
    addLabels(id, labels) {
        if (this.#isUndefined(this.#labels[id])) {
            this.#labels[id] = [];
        }

        this.#labels[id] = this.#labels[id].concat(labels);

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
            this.#addId(id);
        }

        if ((this.#drawCalls % this.#pathSimplify) === 0) {
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

            this.#drawCalls = 0;
        }
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

        this.#drawCalls++;
    }

    /**
     * Draws the graphs for id(s) currently registered.
     *
     * @param colors {Array<String>}
     */
    drawAll(colors) {
        const ids = Object.keys(this.#values);
        if (ids.length === 0) return; // If nothing was added yet; bail silently
        if (colors.length < ids.length)  {
            // Only throw if we have less colors than we need.
            // If we have more than we need, just continue.
            throw new Error('Plotter->drawAll(): Not enough colors specified for the id(s).');
        }

        const sortedIds = ids.sort();

        for (let i = 0; i < sortedIds.length; i++) {
            this.#rtPlot.setPlotColor(colors[i]);

            this.draw(sortedIds[i]);

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
        this.#rtPlot.drawAxis(this.#options.width + ((time ? time : 0) * this.#dataScale.time), 300);
    }

    /**
     * Draws the text and animates it if we need to.
     *
     * @param id {String|Number}
     * @param time {Number}
     */
    drawLabels(id, time) {
        const prevFillStyle = this.#rtPlot.fillStyle;

        const labels = this.#labels[id];
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];

            this.#rtPlot.fillStyle = label.color.toString();

            if (this.#mode === PlotMode.NORMAL) {
                // Only translate x if we're in a normal plot
                // initialX-px margin from the right-align
                // time * timeScale; keep translating the x-axis as 'time' increases
                // i.e. we right align text and keep translating it as
                // the x-axis moves
                label.x = label.initialX + (time * this.#dataScale.time);
            }

            // label.y = y[i];
            label.draw(this.#rtPlot.context);
        }

        this.#rtPlot.fillStyle = prevFillStyle;
    }

    /**
     * Resets all values (deletes all current data)
     */
    reset() {
        this.#values = {};
        this.#counts = {};
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
     * Find the min and max values in an array.
     *
     * @param arr {Array<Number>}
     * @param length {Number}
     * @returns {{min: Number, max: Number}}
     */
    #findMinMax(arr, length) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        for (let i = 0; i < length; i++) {
            const value = arr[i];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        }

        return { min, max };
    }

    /**
     * Adds a new id.
     *
     * @param id {String|Number}
     */
    #addId(id) {
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

} // End class
