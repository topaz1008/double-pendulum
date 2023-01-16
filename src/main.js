import { DoublePendulum } from './double-pendulum.js';

(function (document) {
    const VIEW_WIDTH = 1024,
        VIEW_HEIGHT = 768,
        FPS = 60;

    const canvas = document.getElementById('main'),
        context = canvas.getContext('2d');

    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;

    const PI = Math.PI,
        HALF_WIDTH = VIEW_WIDTH / 2,
        HALF_HEIGHT = VIEW_HEIGHT / 2;

    // Initial conditions [theta1, theta2, omega1, omega2]
    const y0 = [3 * PI / 4, PI, 0, 0];
    const pendulum1 = new DoublePendulum(y0, context, FPS, {
        rodColor: 'rgb(255,0,0)',
        bobColor: 'rgb(154,103,21)',
        pathColor: 'rgb(154,103,21)'
    });

    // Add another pendulum to show how very small changes in the initial conditions
    // make for drastic change in behaviour in a very short time.
    // This is what makes this system chaotic.
    const EPSILON = 1 / 10000;
    const y0_2 = [(3 * PI / 4) + EPSILON, PI, 0, 0];
    const pendulum2 = new DoublePendulum(y0_2, context, FPS, {
        rodColor: 'rgb(0,78,253)',
        bobColor: 'rgb(255,255,255)',
        pathColor: 'rgb(255,255,255)'
    });

    requestAnimationFrame(update);

    /**
     * Update loop
     */
    function update() {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(HALF_WIDTH, HALF_HEIGHT);
        context.clearRect(-HALF_WIDTH, -HALF_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT);

        pendulum1.draw();
        pendulum1.step();

        pendulum2.draw();
        pendulum2.step();

        requestAnimationFrame(update);
    }

})(document);
