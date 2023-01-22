import { Plotter } from './plotter.js';

export class PlotManager {
    #plotter = null;
    #options = null;
    #context = null;
    #labels = {};
    #plots = {};
    #activePlotId = null;

    constructor(context, plotOptions, plots) {
        this.#labels = {};
        this.#context = context;
        this.#options = plotOptions;
        this.#plots = plots;
        this.#plotter = new Plotter(context, plotOptions);

        const ids = Object.keys(plots);
        this.#activePlotId = ids[0];

        const plot = plots[this.#activePlotId];
        this.setPlotLabels(this.#activePlotId, plot.labels);
        this.setPlotOptions(plot);
    }

    /**
     *
     * @returns {String|Number}
     */
    get activePlotId() {
        return this.#activePlotId;
    }

    setActivePlotId(activePlotId) {
        if (this.#plots[activePlotId] === undefined) {
            throw new Error(`No plot with id: "${activePlotId}"`);
        }

        this.#plotter = new Plotter(this.#context, this.#options);

        const plot = this.#plots[activePlotId];
        this.setPlotLabels(activePlotId, plot.labels);
        this.setPlotOptions(plot);

        console.log(`active plot id ${activePlotId}`, plot);

        this.#activePlotId = activePlotId;
    }

    setPlotOptions(plot) {
        this.#plotter.setDataScale(plot.dataScale)
            .setPlotMode(plot.mode)
            .setSamplePointLimit(plot.samplePointLimit)
            .setPathSimplify(plot.pathSimplify);
    }

    setPlotLabels(id, labels) {
        this.#plotter.addLabels(id, labels);
    }

    step(id, x, y) {
        this.#plotter.step(id, x, y);
    }

    draw(time, colors) {
        this.#plotter.clear(time);
        this.#plotter.drawAxis(time);
        this.#plotter.drawAll(colors);
        this.#plotter.drawLabels(this.#activePlotId, time);
    }

    reset() {
        this.#plotter.reset();
    }

    toggleDrawPoints() {
        this.#plotter.toggleDrawPoints();
    }

}
