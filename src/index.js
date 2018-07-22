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

// Helpers to get scene bounds
const visibleHeightAtZDepth = ( depth, camera ) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if ( depth < cameraOffset ) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
};

const visibleWidthAtZDepth = ( depth, camera ) => {
  const height = visibleHeightAtZDepth( depth, camera );
  return height * camera.aspect;
};

init();
animate();

function init() {

  const cameraZ = 350;

  scene = new THREE.Scene();

  ////////////
  // camera //
  ////////////
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, WORLD_WIDTH);
  camera.position.set(0, 100, cameraZ);
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

  console.log(`z=${cameraZ} width=${visibleWidthAtZDepth(cameraZ, camera)} height=${visibleHeightAtZDepth(cameraZ, camera)}`);

  let { positionUniforms, velocityUniforms } = initGPUComputeRenderer(WIDTH, WIDTH, renderer);
  let screenCenterX = renderer.domElement.width / 2;
  let screenCenterY = renderer.domElement.height / 2;

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
  document.querySelector('#scatter').addEventListener('click', ev => {
    velocityUniforms.scatter.value = ev.target.checked ? -1. : 1.;
  });
  renderer.domElement.addEventListener('mousemove', ev => {
    console.log('mouse moved', ev.clientX, ev.clientY);
    velocityUniforms.wind.value = new THREE.Vector3(ev.clientX - screenCenterX, ev.clientY - screenCenterY, 0.);
  });

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
