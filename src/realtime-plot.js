// noinspection DuplicatedCode // TODO: REMOVE

import { Color } from './color.js';
import { PlotterConstants } from './plotter.js';

const defaultOptions = {
    width: 1024,
    height: 768 / 2,
    stepSize: 1 / 1000,
    scale: 1,
    backgroundColor: 'rgb(62,62,62)',
    axisColor: 'rgb(255,255,255)',
    plotColor: 'rgb(255,0,0)',
    pointColor: 'rgb(255,255,255)'
};

export class PlotMode {
    static NORMAL = 0;
    static PHASE = 1;
}

/**
 * This class handles plotting an (x, y) graph in real time.
 * one instantiated with the canvas context and the desired options
 * You can then call draw() each frame with 2 arrays
 * one for the x values and one for the y values.
 */
export class RealTimePlot {
    /**
     *
     * @param context {CanvasRenderingContext2D}
     * @param options {Object}
     */
    constructor(context, options) {
        this.context = context;

        options = Object.assign(defaultOptions, options || {});

        this.stepSize = options.stepSize;

        this.width = options.width;
        this.height = options.height;

        this.centerOrigin = options.centerOrigin;
        this.drawPoints = options.drawPoints;

        this.scale = options.scale;
        this.mode = options.mode || PlotMode.NORMAL;
        this.axisColor = Color.fromString(options.axisColor);
        this.pointColor = Color.fromString(options.pointColor);
        this.backgroundColor = Color.fromString(options.backgroundColor);

        this.plotColor = Color.fromString(options.plotColor);
        this.oldPlotColor = Color.fromString(options.plotColor);
    }

    /**
     * Draw a simple plot.
     * Flips the y values so positive is up.
     *
     * @param x {Array<Number>}
     * @param y {Array<Number>}
     */
    draw(x, y) {
        if (x.length !== y.length) {
            throw new Error('RealTimePlot->draw(): Number of x values has to match number of y values.');
        }

        const prevOperation = this.context.globalCompositeOperation;
        // this.context.globalCompositeOperation = 'screen';

        this.context.lineWidth = 2;
        this.context.strokeStyle = this.plotColor.toString();
        this.context.beginPath();

        for (let i = 0; i < (x.length - 1); i++) {
            this.context.moveTo(x[i], -y[i]);
            this.context.lineTo(x[i + 1], -y[i + 1]);
        }

        this.context.closePath();
        this.context.stroke();

        // Draw integration sample points?
        if (this.drawPoints === true /*&& this.stepSize >= 1 / 100*/) {
            this.context.fillStyle = this.pointColor.toString();
            this.context.beginPath();

            for (let i = 0; i < x.length; i++) {
                this.context.arc(x[i], -y[i], 1, 0, 2 * Math.PI);
                this.context.closePath();
            }

            this.context.fill();
        }

        // Restore previous operation
        this.context.globalCompositeOperation = prevOperation;
    }

    setPlotColor(colorString) {
        this.oldPlotColor = this.plotColor.clone();
        this.plotColor = Color.fromString(colorString);
    }

    restorePlotColor() {
        this.plotColor = this.oldPlotColor.clone();
    }

    clear(time) {
        this.context.fillStyle = this.backgroundColor.toString();

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.scale, this.scale);

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillRect(0, 0, this.width, this.height);

        if (this.mode === PlotMode.NORMAL) {
            this.context.translate((this.width / 2) - (time * PlotterConstants.TIME_SCALE), this.height / 2);

        } else {
            this.translate();
        }
    }

    /**
     * Set canvas transforms.
     */
    translate() {
        if (this.mode === PlotMode.PHASE) {
            this.context.translate(this.width / 2, this.height / 2);
        }
    }

    /**
     * Draw the axis.
     *
     * @param [xMax] {Number}
     * @param [yMax] {Number}
     */
    drawAxis(xMax, yMax) {
        const X_MAX = xMax || 200,
            Y_MAX = yMax || 100;

        this.context.lineWidth = 1;
        this.context.strokeStyle = this.axisColor.toString();
        this.context.beginPath();

        // this.context.moveTo(0, -Y_MAX);
        // this.context.lineTo(0, Y_MAX);
        this.context.moveTo(-X_MAX, 0);
        this.context.lineTo(X_MAX, 0);
        // this.context.moveTo(-X_MAX, -100);
        // this.context.lineTo(X_MAX, -100);
        // this.context.moveTo(-X_MAX, 100);
        // this.context.lineTo(X_MAX, 100);

        this.context.closePath();
        this.context.stroke();
    }
}
