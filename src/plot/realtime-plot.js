import { Color } from '../colors/color.js';
import { PlotMode } from './plotter.js';

const TWO_PI = 2 * Math.PI;

/**
 * This class handles plotting an (x, y) graph in real time.
 * once instantiated with the canvas context and the desired options
 * You can then call draw() each frame with 2 arrays
 * one for the x values and one for the y values.
 */
export class RealTimePlot {
    #stepSize;
    #width;
    #height;
    #scale;
    #lineWidth;
    #drawPoints;
    #axisColor;
    #pointColor;
    #backgroundColor;
    #plotColor;
    #prevPlotColor;
    #options = null;

    /**
     * @param context {CanvasRenderingContext2D}
     * @param options {Object}
     */
    constructor(context, options) {
        this.context = context;
        this.dataScale = options.dataScale;
        this.mode = options.mode;

        this.#options = options;

        this.#stepSize = options.stepSize;

        this.#width = options.width;
        this.#height = options.height;

        this.#drawPoints = options.drawPoints;

        this.#scale = options.scale;
        this.#lineWidth = options.lineWidth;
        this.#axisColor = Color.fromString(options.axisColor);
        this.#pointColor = Color.fromString(options.pointColor);
        this.#backgroundColor = Color.fromString(options.backgroundColor);

        this.#plotColor = Color.fromString(options.plotColor);
        this.#prevPlotColor = Color.fromString(options.plotColor);
    }

    /**
     * Draw a simple plot.
     * Flips the y values so positive is up.
     *
     * @param x {Array<Number>} x values array
     * @param xl {Number} length of x values array
     * @param y {Array<Number>} y values array
     * @param yl {Number} length of y values array
     */
    draw(x, xl, y, yl) {
        if (xl !== yl) {
            throw new Error('RealTimePlot->draw(): Number of x values has to match number of y values.');
        }

        this.context.lineWidth = this.#lineWidth;
        this.context.strokeStyle = this.#plotColor.toString();
        this.context.beginPath();

        for (let i = 0; i < (xl - 1); i++) {
            this.context.moveTo(x[i], -y[i]);
            this.context.lineTo(x[i + 1], -y[i + 1]);
        }

        this.context.closePath();
        this.context.stroke();

        // Draw a circle on the last data point.
        this.context.fillStyle = this.#pointColor.toString();
        this.context.beginPath();
        this.context.arc(x[xl - 1], -y[yl - 1], 4, 0, TWO_PI);
        this.context.closePath();
        this.context.fill();

        // Draw integration sample points?
        if (this.#drawPoints === true /*&& this.#stepSize >= 1 / 100*/) {
            this.context.fillStyle = this.#pointColor.toString();
            this.context.beginPath();
            for (let i = 0; i < xl; i++) {
                this.context.moveTo(x[i], -y[i]);
                this.context.arc(x[i], -y[i], 2, 0, TWO_PI);
            }

            this.context.closePath();
            this.context.fill();
        }
    }

    /**
     * Set the plot color
     *
     * @param colorString {String}
     */
    setPlotColor(colorString) {
        this.#prevPlotColor = this.#plotColor.clone();
        this.#plotColor = Color.fromString(colorString);
    }

    /**
     * Restores the previous color (before calling setPlotColor())
     */
    restorePlotColor() {
        this.#plotColor = this.#prevPlotColor.clone();
    }

    /**
     * Toggles drawPoints option on/off.
     */
    toggleDrawPoints() {
        this.#drawPoints = !this.#drawPoints;
    }

    /**
     * Sets the plot step size
     */
    setStepSize(inverseStepSize) {
        // Avoid divide by zero
        if (inverseStepSize > Number.EPSILON) {
            this.#stepSize = 1 / inverseStepSize;
        }
    }

    /**
     * Clears the canvas
     *
     * @param time {Number}
     */
    clear(time) {
        const prevFillStyle = this.context.fillStyle;
        this.context.fillStyle = this.#backgroundColor.toString();

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.#scale, this.#scale);

        this.context.clearRect(0, 0, this.#width, this.#height);
        // this.context.fillRect(0, 0, this.#width, this.#height);

        if (this.mode === PlotMode.NORMAL) {
            const x = (this.#width / 2) - (time * this.dataScale.time);
            this.context.translate(x, this.#height / 2);

        } else {
            // Phase space
            this.context.translate(this.#width / 2, this.#height / 2);
        }

        this.context.fillStyle = prevFillStyle;
    }

    /**
     * Draw the axis.
     *
     * @param xMax {Number=}
     * @param yMax {Number=}
     */
    drawAxis(xMax, yMax) {
        const X_MAX = xMax || 200,
            Y_MAX = yMax || 100;

        const prevStrokeStyle = this.context.strokeStyle;

        this.context.lineWidth = 1;
        this.context.strokeStyle = this.#axisColor.toString();
        this.context.beginPath();

        this.context.moveTo(0, -Y_MAX);
        this.context.lineTo(0, Y_MAX);
        this.context.moveTo(-X_MAX, 0);
        this.context.lineTo(X_MAX, 0);
        // this.context.moveTo(-X_MAX, -100);
        // this.context.lineTo(X_MAX, -100);
        // this.context.moveTo(-X_MAX, 100);
        // this.context.lineTo(X_MAX, 100);

        this.context.closePath();
        this.context.stroke();

        this.context.strokeStyle = prevStrokeStyle;
    }

    get fillStyle() {
        return this.context.fillStyle;
    }

    set fillStyle(fillStyle) {
        this.context.fillStyle = fillStyle;
    }
}
