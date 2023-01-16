double-pendulum
=====================
A double pendulum simulation in Javascript.

[Live demo](https://topaz1008.github.io/double-pendulum/pendulum.html)

The demo shows how very small changes in initial conditions can make for a very different behaviour of the system in a very short time; thus making it a chaotic system.

The demo starts with 2 pendulums using the same initial conditions, one pendulum has one of its starting values changed by EPSILON (configurable) (default is 0.0001)

even with that small of a change the different pendulums will start to diverge after about 5-7 seconds.

[Solver test](https://topaz1008.github.io/double-pendulum/solver-test.html); A graph plotter with several equations; was used in developing `NDSolve` numerical differential equations solver.
