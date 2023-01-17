// noinspection DuplicatedCode // TODO: REMOVE

import { Color } from './color.js';

const defaultOptions = {
    width: 1024,
    height: 768 / 2,
    stepSize: 1 / 1000,
    scale: 1,
    axisColor: 'rgb(255,255,255)',
    plotColor: 'rgb(255,0,0)',
    pointColor: 'rgb(255,255,255)'
};

export class RealTimePlot {
    static PLOT_MODE_NORMAL = 0;
    static PLOT_MODE_PHASE = 1;

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
        this.halfWidth = options.width / 2;
        this.height = options.height;
        this.halfHeight = options.height / 2;

        this.centerOrigin = options.centerOrigin;
        this.drawPoints = options.drawPoints;

        this.scale = options.scale;
        this.mode = RealTimePlot.PLOT_MODE_NORMAL;
        this.axisColor = Color.fromString(options.axisColor);
        this.plotColor = Color.fromString(options.plotColor);
        this.pointColor = Color.fromString(options.pointColor);
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

        this.context.lineWidth = 3;
        this.context.strokeStyle = this.plotColor.toString();
        this.context.beginPath();

        for (let i = 0; i < (x.length - 1); i++) {
            this.context.moveTo(x[i], -y[i]);
            this.context.lineTo(x[i + 1], -y[i + 1]);
        }

        this.context.closePath();
        this.context.stroke();

        if (this.drawPoints === true /*&& this.stepSize >= 1 / 100*/) {
            this.context.fillStyle = this.pointColor.toString();
            this.context.beginPath();

            for (let i = 0; i < x.length; i++) {
                this.context.arc(x[i], -y[i], 1, 0, 2 * Math.PI);
                this.context.closePath();
            }

            this.context.fill();
        }
    }

    clear(time, timeScale) {
        this.context.fillStyle = 'rgb(62, 62, 62)';

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.scale, this.scale);

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.translate((this.width / 2) - (time * (timeScale)), this.height / 2);
    }

    /**
     * Set canvas transforms.
     */
    transform(x) {
        if (this.mode === RealTimePlot.PLOT_MODE_PHASE) {
            this.context.translate(this.halfWidth, this.halfHeight);

        } else {
            // Align to left
            this.context.translate(0, this.halfHeight);
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

        this.context.moveTo(0, -Y_MAX);
        this.context.lineTo(0, Y_MAX);
        this.context.moveTo(-X_MAX, 0);
        this.context.lineTo(X_MAX, 0);

        this.context.closePath();
        this.context.stroke();
    }
}
