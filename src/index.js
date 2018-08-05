//import * as THREE from 'three';
import { initSkybox } from './skybox.js';
import { initFloor } from './floor.js';
import { initBoids } from './boids.js';
import { controlsEnabled,
    initControls,
    animate as controlsAnimate } from './controls.js';
import { initGPUComputeRenderer, GPUCompute } from './gpucomputer.js';
import { WORLD_WIDTH, WIDTH } from './globals.js';

let scene, camera, renderer, controls, raycaster, birdMesh;
let screenCenterX, screenCenterY;

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

function onWindowResize() {
  screenCenterX = window.innerWidth / 2;
  screenCenterY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

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
  initSkybox(scene);
  initFloor(scene);
  birdMesh = initBoids(scene);

  console.log(`z=${cameraZ} width=${visibleWidthAtZDepth(cameraZ, camera)} height=${visibleHeightAtZDepth(cameraZ, camera)}`);

  let { positionUniforms, velocityUniforms } = initGPUComputeRenderer(WIDTH, WIDTH, renderer);

  screenCenterX = window.innerWidth / 2;
  screenCenterY = window.innerHeight / 2;
  console.log('screen center x,y', screenCenterX, screenCenterY);

  const onControlInput = (ev) => {
    //console.log('separation change', ev.target.value);
    velocityUniforms.seperationDistance.value = Number(document.querySelector('#separation').value);
    console.log('new separation distance', velocityUniforms.seperationDistance.value);
    velocityUniforms.alignmentDistance.value = Number(document.querySelector('#alignment').value);
    console.log('new alignment distance', velocityUniforms.alignmentDistance.value);
    velocityUniforms.cohesionDistance.value = Number(document.querySelector('#cohesion').value);
    console.log('new cohesion distance', velocityUniforms.cohesionDistance.value);
  };
  document.querySelector('#separation').addEventListener('change', onControlInput);
  document.querySelector('#alignment').addEventListener('change', onControlInput);
  document.querySelector('#cohesion').addEventListener('change', onControlInput);

  let enableWind = false;
  let forceScatter = false;

  let windEl = document.querySelector('#windVal');
  renderer.domElement.addEventListener('mousemove', ev => {
    velocityUniforms.wind.value = enableWind ? new THREE.Vector3(ev.clientX - screenCenterX, ev.clientY - screenCenterY, 0.) : new THREE.Vector3(0., 0., 0.);
    windEl.innerHTML = `${velocityUniforms.wind.value.x}, ${velocityUniforms.wind.value.y}`;
  });
  document.addEventListener( 'keydown', function(event) {
    switch (event.keyCode) {
      case 87: // w
        enableWind = !enableWind;
        break;
      case 83: // s
        forceScatter = !forceScatter;
        velocityUniforms.scatter.value = forceScatter ? -1. : 1.;
        console.log('Scatter value', velocityUniforms.scatter.value);
        break;
    }
  }, false);

  window.addEventListener('resize', onWindowResize);

  onControlInput();
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
