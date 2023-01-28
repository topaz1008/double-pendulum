import { NDSolveMethod } from './ndsolve.js';

const TO_RADIANS = Math.PI / 180;

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

    /**
     * @type {null|DoublePendulum}
     */
    #pendulum1 = null;

    /**
     * @type {null|DoublePendulum}
     */
    #pendulum2 = null;

    /**
     * @type {null|PlotManager}
     */
    #plotManager = null;

    constructor(GUI, guiOptions, appOptions) {
        this.#gui = new GUI(guiOptions);
        this.#appOptions = appOptions;

        this.#pendulum1 = appOptions?.pendulum1;
        this.#pendulum2 = appOptions?.pendulum2;
        this.#plotManager = appOptions?.plotManager;
    }

    init() {
        /**
         * General parameters folder
         */
        const flGeneral = this.#gui.addFolder('General Parameters');
        this.#initGeneralParameters(flGeneral);

        /**
         * Pendulums (both) initial conditions folder
         */
        this.#initPendulumParameters();

        /**
         * Bottom plot type
         */
        const flBottomPlot = this.#gui.addFolder('Bottom Plot');
        this.#initBottomPlotControls(flBottomPlot)

        /**
         * Colors
         */
        const flColors = this.#gui.addFolder('Colors (WIP) NOT WORKING');
        // TODO: colors; make colors changeable on-the-fly (needs some refactoring)
        const colors = {
            'Pendulum 1 Color': '#ff0000',
            'Pendulum 2 Color': '#00ff00',
            'Bobs Color': '#0000ff'
        };
        flColors.addColor(colors, 'Pendulum 1 Color');
        flColors.addColor(colors, 'Pendulum 2 Color');
        flColors.addColor(colors, 'Bobs Color');

        // Attach dom element to container
        const containerElement = document.getElementById(AppGUI.CONTAINER_ELEMENT_ID);
        containerElement?.appendChild(this.#gui.domElement);
    }

    #initGeneralParameters(folder) {
        folder.add(this.#appOptions, 'pause').name('Pause/Un-pause');
        folder.add(this.#appOptions, 'reset').name('Reset');

        // Draw 2nd pendulum?
        folder.add(this.#appOptions, 'draw2ndPendulum')
            .name('Draw 2nd Pendulum');

        // Time scale
        folder.add(this.#appOptions, 'timeScale', 0.05, 2).step(0.01)
            .name('Time Scaling')
            .onChange(value => {
                this.#pendulum1.timeScale = this.#pendulum2.timeScale = value;
                console.log('timescale', value);
            });

        // Gravity
        folder.add(this.#appOptions, 'gravity', -15, 15).step(0.5)
            .name('Gravity')
            .onChange(value => {
                this.#pendulum1.gravity = this.#pendulum2.gravity = value;
            });

        // Step size
        folder.add(this.#appOptions, 'stepSize', 10, 2000).step(50)
            .name('Step Size (inverse)')
            .onChange(value => {
                this.#pendulum1.stepSize = this.#pendulum2.stepSize = value;
                this.#plotManager.setStepSize(value);
            });

        // Integration method
        const method = {
            'Classical Runge-Kutta (RK4)': NDSolveMethod.RK4,
            'Euler\'s Forward': NDSolveMethod.EULER_FORWARD
        };
        folder.add(this.#appOptions, 'integrationMethod', method)
            .name('Integration Method')
            .onChange(value => {
                this.#pendulum1.solver.method = this.#pendulum2.solver.method = value;
            });
    }

    #initPendulumParameters() {
        const flPendulum1Initial = this.#gui.addFolder('Initial Conditions');
        const initial = this.#appOptions.initialConditions;

        const THETA_1 = 'theta1',
            THETA_2 = 'theta2',
            OMEGA_1 = 'omega1',
            OMEGA_2 = 'omega2';

        // Helper functions
        const resetAndTogglePause = () => {
            this.#appOptions.pause();
            this.#appOptions.reset();
        };
        const togglePause = () => {
            this.#appOptions.pause();
        };

        // Sets a new values on both pendulums
        // Second pendulum gets EPSILON added
        const setNewAngle = (name, angle) => {
            // Force a reset
            resetAndTogglePause();
            const radians = angle * TO_RADIANS;

            this.#pendulum1[name] = radians;
            if (name === 'theta1') {
                // Only add epsilon to ONE parameter, in this case, theta1
                this.#pendulum2[name] = radians + this.#appOptions.epsilon;

            } else {
                this.#pendulum2[name] = radians;
            }

            resetAndTogglePause();
        };

        const setNewValue = (name, value) => {
            // Force a reset
            resetAndTogglePause();
            this.#pendulum1[name] = value;
            this.#pendulum2[name] = value;

            resetAndTogglePause();
        };

        // Theta 1
        flPendulum1Initial.add(initial, THETA_1, 0, 360).step(45)
            .name('&theta; 1 (rod 1 angle)')
            .onChange(value => {
                setNewAngle(THETA_1, value);
            });

        // Theta 2
        flPendulum1Initial.add(initial, THETA_2, 0, 360).step(45)
            .name('&theta; 2 (rod 2 angle)')
            .onChange(value => {
                setNewAngle(THETA_2, value);
            });

        // Omega 1
        flPendulum1Initial.add(initial, OMEGA_1, -10, 10).step(0.5)
            .name('&omega; 1 (rod 1 velocity)')
            .onChange(value => {
                setNewValue(OMEGA_1, value);
            });

        // Omega 2
        flPendulum1Initial.add(initial, OMEGA_2, -10, 10).step(0.5)
            .name('&omega; 2 (rod 2 velocity)')
            .onChange(value => {
                setNewValue(OMEGA_2, value);
            });

        /**
         * Pendulums (both) parameters
         */
        const L1 = 'l1',
            M1 = 'm1',
            L2 = 'l2',
            M2 = 'm2';

        const flParameters = this.#gui.addFolder('Pendulums parameters');

        // Rod 1 length
        flParameters.add(this.#appOptions, L1, 0.25, 2).step(0.25)
            .name('Rod 1 Length')
            .onChange(value => {
                setNewValue(L1, value);
            });

        // Bob 1 mass
        flParameters.add(this.#appOptions, M1, 0.25, 2).step(0.25)
            .name('Bob 1 Mass')
            .onChange(value => {
                setNewValue(M1, value);
            });

        // Rod 2 length
        flParameters.add(this.#appOptions, L2, 0.25, 2).step(0.25)
            .name('Rod 2 Length')
            .onChange(value => {
                setNewValue(L2, value);
            });

        // Bob 2 mass
        flParameters.add(this.#appOptions, M2, 0.25, 2).step(0.25)
            .name('Bob 2 Mass')
            .onChange(value => {
                setNewValue(M2, value);
            });
    }

    #initBottomPlotControls(folder) {
        // Draw integration sample points?
        folder.add(this.#appOptions, 'drawPoints')
            .name('Draw integration sample points?')
            .onChange(value => {
                this.#plotManager.toggleDrawPoints();

                const stepSize = 1 / this.#appOptions.stepSize;
                this.#plotManager.setStepSize(stepSize);
            });

        // Plot Type
        const plotType = {
            'Bob 1 X Positions': 'bob1xpos',
            'Bob 2 X Positions': 'bob2xpos',
            '&theta; vs. &theta;\'': 'theta1theta1prime'
        };
        folder.add(this.#appOptions, 'plotType', plotType)
            .name('Bottom Plot Type')
            .onChange(value => {
                console.log('type change', value);
                this.#plotManager.setActivePlotId(value);
            });
    }
}
