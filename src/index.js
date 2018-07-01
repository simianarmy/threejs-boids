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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, WORLD_WIDTH);
    camera.position.set(0, 0, 350);
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
    initSkybox(scene);
    //initFloor(scene);
    birdMesh = initBoids(scene);

    initGPUComputeRenderer(WIDTH, WIDTH, renderer);
}

function animate() {
    requestAnimationFrame( animate );

    if ( controlsEnabled ) {
        controlsAnimate(controls);
    }
    render();
}

function render() {
    let birdUniforms = birdMesh.material.uniforms;

    GPUCompute(birdUniforms);

    renderer.render(scene, camera);
}