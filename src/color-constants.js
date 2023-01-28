/**
 * Color definitions constants used throughout the app.
 */
export const colors = {
    // Main pendulum simulation colors
    background: 'rgb(255,0,0)',

    // Pendulum 1
    pendulum1Rod: 'rgb(0,0,255)',
    pendulum1Bod: 'rgb(255,255,255)',
    pendulum1Path: 'rgb(0,0,255)',

    // Pendulum 2
    pendulum2Rod: 'rgb(0,255,0)',
    pendulum2Bod: 'rgb(255,255,255)',
    pendulum2Path: 'rgb(0,255,0)',

    // Bottom plot colors
    plotBackground: 'rgb(0,0,0)',
    plotLabel: 'rgb(255,255,255)',
    plotAxis: 'rgb(255,255,255)',
    plotPoint: 'rgb(255,255,255)',

    // Default if none is dynamically set
    // If drawing more than one graph at the same time
    // we would probably want them in different colors
    plotPath: 'rgb(255,0,0)'
};
