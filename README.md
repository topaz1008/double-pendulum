double-pendulum
=====================
A double pendulum simulation in Javascript.

[Live demo](https://topaz1008.github.io/double-pendulum/pendulum.html); You can pause/unpause the simulation using the `P` key.

The demo shows how very small changes in initial conditions can make for a very different behaviour of the system in a very short time; thus making it a chaotic system.

The demo starts with 2 pendulums using the same initial conditions, one pendulum has one of its starting values changed by EPSILON (configurable) (default is 0.0001)

even with that small of a change the different pendulums will start to diverge after about 5-7 seconds.

[Solver test](https://topaz1008.github.io/double-pendulum/solver-test.html); A graph plotter with several equations; was used in developing `NDSolve` numerical differential equations solver.

More information about the math and equations of motion can be found on [Wikipedia](http://en.wikipedia.org/wiki/Double_pendulum) and [Wolfram science world](http://scienceworld.wolfram.com/physics/DoublePendulum.html).

## NDSolve class

A simple numerical differential equations solver. the solver integrates in real time.

Supports the [Euler forward](https://en.wikipedia.org/wiki/Euler_method) method, and the classical [Runge-Kutta](https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods) method (RK4).

Euler's method is a very simple and fast method to numerically solve an ODE. The downside is that it is not very accurate and requires using a very small step size.

Runge-Kutta on the other hand is much more involved, but its very fast and very accurate.


## TODO
* Allow switching graph types on-the-fly
* ...
