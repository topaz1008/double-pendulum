'use strict';

function Plot(x, y, options) {
    if (x.length !== y.length) {
        throw new Error('Plot(): Number of x values has to match number of y values.');
    }

    this.x = x;
    this.y = y;

//    var xMinMax = findMinMax(x),
//        yMinMax = findMinMax(y);

    this.options = {
        width: 1000,
        height: 700,
        drawPoints: true
    };
//
    var max = Math.max,
        w = this.options.width,
        h = this.options.height;
//
////    this.scale = max((xMinMax[1] - xMinMax[0]) / w, (yMinMax[1] - yMinMax[0]) / h) * max(w, h);
////    this.scaleX = (xMinMax[1] - xMinMax[0]) * w;
////    this.scaleY = (yMinMax[1] - yMinMax[0]) * h;

    this.scale = 20;

    var canvas = this.createCanvasElement(w, h, 'main');
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.transform();
    this.drawAxis();

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
}

/**
 * Find the min and max values in an array.
 *
 * @param data {Array<Number>}
 * @returns {Array<Number>}
 */
function findMinMax(data) {
    var i,
        min = Number.MAX_VALUE,
        max = Number.MIN_VALUE,
        length = data.length;

    for (i = 0; i < length; i++) {
        if (data[i] > max) {
            max = data[i];
        }
        if (data[i] < min) {
            min = data[i];
        }
    }

    return [min, max];
}

/**
 *
 * @param src {Object}
 * @param dest {Object}
 */
function extend(src, dest) {
    var i;

    for (i in src) {
        if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
        }
    }
}

/**
 *
 */
Plot.prototype.draw = function () {
    var i, length = this.x.length;

    this.context.lineWidth = 0.1;
    this.context.strokeStyle = '#ff0000';
    this.context.beginPath();

    for (i = 0; i < (length - 1); i++) {
        this.context.moveTo(this.x[i], -this.y[i]);
        this.context.lineTo(this.x[i + 1], -this.y[i + 1]);
    }

    this.context.closePath();
    this.context.stroke();

    if (this.options.drawPoints) {
        this.drawSamplePoints();
    }
};

/**
 *
 */
Plot.prototype.transform = function () {
    var width = this.options.width,
        height = this.options.height,
        halfWidth = width / 2,
        halfHeight = height / 2;

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    if (this.x[0] >= 0) {
        this.context.translate(5, halfHeight); // Align to left
    } else {
        this.context.translate(halfWidth, halfHeight); // Center the origin
    }

    this.context.scale(this.scale, this.scale);
    this.context.clearRect(-width, -height, width, height);
};

/**
 *
 */
Plot.prototype.drawSamplePoints = function () {
    var i, length = this.x.length;

    this.context.fillStyle = '#00ff00';
//    this.context.beginPath();
    for (i = 0; i < length; i++) {
        this.context.arc(this.x[i], -this.y[i], 0.1, 0, 2 * Math.PI);
        this.context.closePath();
    }

    this.context.fill();
};

/**
 *
 */
Plot.prototype.drawAxis = function () {
    var width = this.options.width,
        height = this.options.height;

    this.context.lineWidth = 0.1;
    this.context.strokeStyle = '#ffffff';

    this.context.moveTo(-width, 0);
    this.context.lineTo(width, 0);
    this.context.moveTo(0, -height);
    this.context.lineTo(0, height);

    this.context.closePath();
    this.context.stroke();
};

/**
 *
 * @param width {Number}
 * @param height {Number}
 * @param [id] {String}
 * @returns {HTMLElement}
 */
Plot.prototype.createCanvasElement = function (width, height, id) {
    var canvas = document.createElement('canvas');

    canvas.id = id || 'main';
    canvas.width = width;
    canvas.height = height;

    return canvas;
};
