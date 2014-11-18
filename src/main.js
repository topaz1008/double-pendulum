(function (document) {
    'use strict';

    var VIEW_WIDTH = 1024,
        VIEW_HEIGHT = 768,
        FRAMES_PER_SECOND = 60,
        HALF_WIDTH = VIEW_WIDTH / 2,
        HALF_HEIGHT = VIEW_HEIGHT / 2;

    var canvas = document.getElementById('main'),
        context = canvas.getContext('2d');

    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;

    // Initial conditions [theta1, theta2, omega1, omega2]
    var y0 = [3 * Math.PI / 4, Math.PI, 0, 0];
    var pendulum = new Pendulum(y0, context, FRAMES_PER_SECOND);

    setInterval(update, 1000 / FRAMES_PER_SECOND);

    /**
     * Update loop
     */
    function update() {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(HALF_WIDTH, HALF_HEIGHT);
        context.clearRect(-HALF_WIDTH, -HALF_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);

        pendulum.draw();
        pendulum.step();
    }

})(document);
