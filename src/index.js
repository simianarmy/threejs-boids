//import * as THREE from 'three';
import { initSkybox } from './skybox.js';
import { initFloor } from './floor.js';
import { initBoids } from './boids.js';
import { controlsEnabled,
    initControls,
    animate as controlsAnimate } from './controls.js';
import { initGPUComputeRenderer, GPUCompute } from './gpucomputer.js';
import { WORLD_WIDTH, WIDTH } from './globals.js';

var scene, camera, renderer, controls, raycaster, birdMesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    ////////////
    // camera //
    ////////////
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, WORLD_WIDTH);
    camera.position.set(0, 100, 350);
    //camera.up.set( 0, 1, 0);
    //camera.lookAt(scene.position);

    //////////////
    // renderer //
    //////////////
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize ( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var axes = new THREE.AxisHelper(100);
    //scene.add(axes);

    ////////////////
    // raycaster //
    ////////////////
    //raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    controls = initControls(scene, camera);
    //initSkybox(scene);
    initFloor(scene);
    birdMesh = initBoids(scene);

    let { positionUniforms, velocityUniforms } = initGPUComputeRenderer(WIDTH, WIDTH, renderer);

    document.querySelector('#separation').addEventListener('change', ev => {
      //console.log('separation change', ev.target.value);
      velocityUniforms.seperationDistance.value = Number(ev.target.value);
      console.log('new separation distance', velocityUniforms.seperationDistance.value);
    });
    document.querySelector('#alignment').addEventListener('change', ev => {
      //console.log('separation change', ev.target.value);
      velocityUniforms.alignmentDistance.value = Number(ev.target.value);
      console.log('new alignment distance', velocityUniforms.alignmentDistance.value);
    });
    document.querySelector('#cohesion').addEventListener('change', ev => {
      //console.log('separation change', ev.target.value);
      velocityUniforms.cohesionDistance.value = Number(ev.target.value);
      console.log('new cohesion distance', velocityUniforms.cohesionDistance.value);
    });

  velocityUniforms.wind.value = new THREE.Vector3(0.2, 0.1, 0);
}

function animate() {
    requestAnimationFrame( animate );

    if ( controlsEnabled ) {
        controlsAnimate(controls);
    }
    GPUCompute(birdMesh.material.uniforms);
    render();
}

function render() {
    renderer.render(scene, camera);
}
