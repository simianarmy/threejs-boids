# threejs-boids

[Live Demo](https://flamboyant-goldstine-9c0e1c.netlify.com/)

My attempt at GPU-rendered boids <strike>without looking at examples</strike>
using my old boids simulation code as much as possible.

Use of GPUComputationRenderer and some tricks ripped from this threejs example
https://threejs.org/examples/webgl_gpgpu_birds.html

## Concepts Demonstrated

  - Boids flocking algorithm
  - GPUComputationalRender for boids algorithms in gpu
  - Skybox for sky
  - Procedural terrain
  - Sort-of working ground collision detection for boids

## Running

> nr build && open dist/index.html

## Developing

> nr start

## TODO

  - ~~Predator (mouse)~~
  - ~~Procedural terrain~~
  - ~~Collision avoidance with terrain solids~~ (kind of)
  - Predator boid flying randomly

