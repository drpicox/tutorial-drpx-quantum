QuantumJS tutorial
==================


This repo contains a small tutorial about QuantumJS.

QuantumJS is a proof of concept about how to compute
derived values under demand to boost AngularJS performance
without adding watchers or events. It is also taked into
account that user should be not aware of unregistering things
(specially event handlers).

The idea is the following: 
- each object has a timestamp, 
- each time that a object is changed timestamp is increased,
- objects can be "entangled" (no reversible), so changes in the former affects to the timestamp of the latter
- costly computations are cached and performed only when timestamp changes

There are also many examples of the progression, with multiple
alternatives so also ways of programming can be compared in 
performances. For example, _quantum-closure_ (the most elegant
API) is the slowest implementation of the concept, and
_todo-quantum-light_ is the fastest implementation 
("faster" than plain objects, _todo-ng_).

See index.html to start.