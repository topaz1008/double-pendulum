import { NDSolveMethod } from './ndsolve.js';

const TWO_PI = 2 * Math.PI;

/**
 * A simple wrapper around lil-gui
 * just to keep all this boilerplate stuff out of the main file.
 *
 * @author Topaz Bar <topaz1008@gmail.com>
 */
export class AppGUI {
    static CONTAINER_ELEMENT_ID = 'gui-container';

    #gui = null;
    #appOptions = null;
    #solver = null;
    #pendulum1 = null;
    #pendulum2 = null;
    #plotManager = null;

    constructor(GUI, guiOptions, appOptions) {
        this.#gui = new GUI(guiOptions);
        this.#appOptions = appOptions;

        // this.#solver = appOptions?.solver;
        this.#pendulum1 = appOptions?.pendulum1;
        this.#pendulum2 = appOptions?.pendulum2;
        // this.#plotManager = appOptions?.plotManager;
    }

// ui control list
// 6. initial conditions (theta1, theta2, omega1, omega2)
// 7. pendulum params (rod1 length bob1 mass; rod2 length bob2 mass)
// 8. bottom graph type
// 9. draw sample points?
    init() {
        // Pause and reset buttons
        const flGeneral = this.#gui.addFolder('General Parameters');

        /**
         * General parameters folder
         */
        flGeneral.add(this.#appOptions, 'pause').name('Pause');
        flGeneral.add(this.#appOptions, 'reset').name('Reset');

        // Draw 2nd pendulum?
        flGeneral.add(this.#appOptions, 'draw2ndPendulum')
            .name('Draw 2nd Pendulum');

        // Time scale
        flGeneral.add(this.#appOptions, 'timeScale', 0.05, 1).step(0.01)
            .name('Time Scaling')
            .onChange(value => {
                this.#pendulum1.timeScale = this.#pendulum2.timeScale = value;
            });

        // Gravity
        flGeneral.add(this.#appOptions, 'gravity', -15, 15).step(0.5)
            .name('Gravity')
            .onChange(value => {
                this.#pendulum1.gravity = this.#pendulum2.gravity = value;
            });

        // Step size
        flGeneral.add(this.#appOptions, 'stepSize', 10, 2000).step(50)
            .name('Step Size (inverse)')
            .onChange(value => {
                if (value > Number.EPSILON) {
                    // Avoid divide by zero
                    this.#pendulum1.stepSize = this.#pendulum2.stepSize = 1 / value;
                    // TODO: change the bottom plotter step size to match the pendulums step size
                }
            });

        // Integration method
        const method = {
            'Classical Runge-Kutta (RK4)': NDSolveMethod.RK4,
            'Euler\'s Forward': NDSolveMethod.EULER_FORWARD
        };
        flGeneral.add(this.#appOptions, 'integrationMethod', method)
            .name('Integration Method')
            .onChange(value => {
                this.#pendulum1.solver.method = this.#pendulum2.solver.method = value;
            });

        /**
         * Pendulum #1 initial conditions folder
         */
        const flPendulum1Initial = this.#gui.addFolder('Pendulum 1 Initial Conditions');
        const initial = this.#appOptions.initialConditions;

        const THETA_1 = 'theta1',
            THETA_2 = 'theta2',
            OMEGA_1 = 'omega1',
            OMEGA_2 = 'omega2';

        const resetAndPause = () => {
            this.#appOptions.reset();
            this.#appOptions.pause();
        };

        const setNewValue = (name, value) => {
            // Force a reset when initial conditions change
            resetAndPause();
            this.#pendulum1[name] = value;
            this.#pendulum2[name] = value + this.#appOptions.epsilon;
            resetAndPause();
        };

        const onChange = (name) => {
            return (value) => {
                setNewValue(name, value);
            };
        };

        // Theta 1
        flPendulum1Initial.add(initial, THETA_1, 0, TWO_PI).step(Math.PI / 4)
            .name('Pendulum 1 theta 1')
            .onChange(onChange(THETA_1));

        // Theta 2
        flPendulum1Initial.add(initial, THETA_2, 0, TWO_PI).step(Math.PI / 4)
            .name('Pendulum 1 theta 2')
            .onChange(onChange(THETA_2));

        // Omega 1
        flPendulum1Initial.add(initial, OMEGA_1, -10, 10).step(0.5)
            .name('Pendulum 1 omega1')
            .onChange(onChange(OMEGA_1));

        // Omega 2
        flPendulum1Initial.add(initial, OMEGA_2, -10, 10).step(0.5)
            .name('Pendulum 1 omega2')
            .onChange(onChange(OMEGA_2));


        // this.#gui.add(this.#solver, 'viscosity', viscosities).name('Viscosity');
        //
        // this.#gui.add(this.#appOptions, 'drawVelocityField').name('Draw Velocity Field');
        //
        // this.#gui.add(this.#solver, 'resetVelocity').name('Reset Velocity');
        //

        // Attach dom element to container
        document.getElementById(AppGUI.CONTAINER_ELEMENT_ID)
            ?.appendChild(this.#gui.domElement);
    }
}
