export class Plot {
    static PLOT_MODE_NORMAL = 'normal';
    static PLOT_MODE_PHASE = 'phase';

    constructor(context, options) {
        this.context = context;

        this.stepSize = options.stepSize;

        this.width = options.width;
        this.halfWidth = options.width / 2;
        this.height = options.height;
        this.halfHeight = options.height / 2;

        this.centerOrigin = options.centerOrigin;
        this.drawPoints = options.drawPoints;

        this.scale = options.scale;
        this.inverseScale = 1 / options.scale;
        this.mode = options.mode;
        this.axisColor = options.axisColor;
        this.plotColor = options.plotColor;
        this.pointColor = options.pointColor;
    }

    /**
     * Set canvas transforms.
     */
    transform() {
        if (this.centerOrigin === true || this.mode === Plot.PLOT_MODE_PHASE) {
            this.context.translate(this.halfWidth, this.halfHeight);

        } else {
            // Align to left
            this.context.translate(20, this.halfHeight);
        }

        this.context.scale(this.scale, this.scale);
        this.context.clearRect(-this.width, -this.height, this.width, this.height);
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
            throw new Error('draw(): Number of x values has to match number of y values.');
        }

        this.context.lineWidth = this.inverseScale;
        this.context.strokeStyle = this.plotColor;
        this.context.beginPath();

        for (let i = 0; i < (x.length - 1); i++) {
            this.context.moveTo(x[i], -y[i]);
            this.context.lineTo(x[i + 1], -y[i + 1]);
        }

        this.context.closePath();
        this.context.stroke();

        if (this.drawPoints === true && this.stepSize >= 1 / 100) {
            this.context.fillStyle = this.pointColor;
            this.context.beginPath();

            for (let i = 0; i < x.length; i++) {
                this.context.arc(x[i], -y[i], this.inverseScale, 0, 2 * Math.PI);
                this.context.closePath();
            }

            this.context.fill();
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

        this.context.lineWidth = this.inverseScale;
        this.context.strokeStyle = this.axisColor;
        this.context.beginPath();

        this.context.moveTo(0, -Y_MAX);
        this.context.lineTo(0, Y_MAX);
        this.context.moveTo(-X_MAX, 0);
        this.context.lineTo(X_MAX, 0);

        this.context.closePath();
        this.context.stroke();
    }
}
