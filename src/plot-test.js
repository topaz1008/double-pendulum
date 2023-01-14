(function (document) {
    'use strict';

    var STEP_SIZE = 1 / 3,
        T_START = 0,
        T_END = 50;

    var t,
        x = [],
        y = [];

    var f = function (x) {
        return 3 * Math.cos(x) + 2 * Math.sin(3 * x);
    };

    for (t = T_START; t < T_END; t += STEP_SIZE) {
        x.push(t);
        y.push(f(t));
    }

    var options = {
        width: 1000,
        height: 700,
        drawPoints: true
    };

    var plot = new Plot(x, y, options);

    plot.draw();

})(document);
