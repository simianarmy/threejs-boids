import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import RAPIER from '@dimforge/rapier3d-compat'
import GUI from 'three/addons/libs/lil-gui.module.min.js'
import { initSkybox } from './skybox.js';
import { initFloor, getHeightMap } from './floor.js';
import { initLights } from './lights.js';
import { initBoids } from './boids.js';
import { controlsEnabled,
    initControls,
    animate as controlsAnimate } from './controls.js';
import { initGPUComputeRenderer, GPUCompute } from './gpucomputer.js';
import { WORLD_WIDTH, WIDTH } from './globals.js';

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

await init();

async function init() {

  const cameraZ = 350;
  let screenCenterX, screenCenterY;
  let scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2(0x868293, 0.0007);

  ////////////
  // camera //
  ////////////
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, WORLD_WIDTH);
  camera.position.set(0, 100, cameraZ);
  //camera.up.set( 0, 1, 0);
  //camera.lookAt(scene.position);


  //////////////
  // renderer //
  //////////////
  let renderer = new THREE.WebGLRenderer( {antialias: true} );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize ( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  document.body.appendChild( renderer.domElement );

  let orbitControls = new OrbitControls( camera, renderer.domElement );
  orbitControls.enableZoom = false;
  orbitControls.enableDamping = true;
  orbitControls.target.y = 1;

  var axes = new THREE.AxesHelper(100);
  scene.add(axes);

  let controls = initControls(scene, camera);
  orbitControls.update();
  initSkybox(scene);
  initLights(scene);
  let terrain = await initFloor(scene);
  let birdMesh = initBoids(scene);
  console.log('Bird mesh', birdMesh);

  await RAPIER.init() // This line is only needed if using the compat version
  const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
  const world = new RAPIER.World(gravity)
  const dynamicBodies = []

  // Create the collider for the ground
  const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, -1, 0).setCanSleep(false))
  const floorGeo = terrain.getScene().children[0].geometry;
  const vertices = new Float32Array(floorGeo.attributes.position.array)
  let indices = new Uint32Array(floorGeo.index.array)
  const floorShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(1.1)
  world.createCollider(floorShape, floorBody)

  // Add the boids mesh to the physics world
  const birdBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0).setCanSleep(false))
  const points = new Float32Array(birdMesh.geometry.attributes.position.array)
  const birdShape = RAPIER.ColliderDesc.convexHull(points).setMass(1).setRestitution(1.1)

  world.createCollider(birdShape, birdBody)
  dynamicBodies.push([birdMesh, birdBody])

  // Ball Collider
  const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshNormalMaterial())
  sphereMesh.castShadow = true
  scene.add(sphereMesh)
  const sphereBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-2.5, 10, 0).setCanSleep(false))
  const sphereShape = RAPIER.ColliderDesc.ball(1).setMass(1).setRestitution(1.1)
  world.createCollider(sphereShape, sphereBody)
  dynamicBodies.push([sphereMesh, sphereBody])

  const icosahedronBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(2, 5, 0).setCanSleep(false))
// const points = new Float32Array(icosahedronMesh.geometry.attributes.position.array)
// const icosahedronShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc).setMass(1).setRestitution(1.1)
// world.createCollider(icosahedronShape, icosahedronBody)
// dynamicBodies.push([icosahedronMesh, icosahedronBody])
  //
  console.log(`z=${cameraZ} width=${visibleWidthAtZDepth(cameraZ, camera)} height=${visibleHeightAtZDepth(cameraZ, camera)}`);

  let { positionUniforms, velocityUniforms } = initGPUComputeRenderer(WIDTH, WIDTH, renderer);

  // We need to pass the heightmap texture to the shader for bird/ground
  // collision detection
  const heightmap = getHeightMap(scene);
  velocityUniforms.heightMap.value = heightmap;
  console.log('Heightmap value', heightmap);

  screenCenterX = window.innerWidth / 2;
  screenCenterY = window.innerHeight / 2;
  console.log('screen center x,y', screenCenterX, screenCenterY);

  velocityUniforms.seperationDistance.value = 50;
  velocityUniforms.alignmentDistance.value = 70;
  velocityUniforms.cohesionDistance.value = 46;

  let enableWind = false;
  let forceScatter = false;
  let enablePredator = false;

  const params = {
    separation: velocityUniforms.seperationDistance.value,
    alignment: velocityUniforms.alignmentDistance.value,
    cohesion: velocityUniforms.cohesionDistance.value,
    scatter: forceScatter,
    predator: enablePredator,
    wind: enableWind,
  };

  const gui = new GUI()
  const physicsFolder = gui.addFolder('Boids');
  physicsFolder.add(params, 'separation',  1., 100., 1)
    .onChange(newValue => velocityUniforms.seperationDistance.value = newValue);
  physicsFolder.add(params, 'alignment',  1., 100., .001)
    .onChange(newValue => velocityUniforms.alignmentDistance.value = newValue);
  physicsFolder.add(params, 'cohesion',  1., 100., .25)
    .onChange(newValue => velocityUniforms.cohesionDistance.value = newValue);
  physicsFolder.add(params, 'scatter')
    .onChange(newValue => {
        forceScatter = newValue;
        velocityUniforms.scatter.value = forceScatter ? -1. : 1.;
        console.log('Scatter value', velocityUniforms.scatter.value);
    });
  physicsFolder.add(params, 'predator')
    .onChange(newValue => enablePredator = newValue);
  physicsFolder.add(params, 'wind')
    .onChange(newValue => enableWind = newValue);

  let zeroVector = new THREE.Vector3(0., 0., 0.);

  let windEl = document.querySelector('#windVal');
  let predatorEl = document.querySelector('#predatorVal');

  renderer.domElement.addEventListener('mousemove', ev => {
    velocityUniforms.wind.value = enableWind ? new THREE.Vector3(ev.clientX - screenCenterX, ev.clientY - screenCenterY, 0.) : zeroVector;
    //velocityUniforms.predator.value = enablePredator ? new THREE.Vector3(0.5 * ev.clientX / screenCenterX, - 0.5 * ev.clientY / screenCenterY, 0) : zeroVector;
    velocityUniforms.predator.value = enablePredator ? new THREE.Vector3(ev.clientX - screenCenterX, ev.clientY - screenCenterY, 0) : zeroVector;
    windEl.innerHTML = `${velocityUniforms.wind.value.x}, ${velocityUniforms.wind.value.y}`;
    predatorEl.innerHTML = `${velocityUniforms.predator.value.x}, ${velocityUniforms.predator.value.y}`;
  });
  document.addEventListener( 'keydown', function(event) {
    switch (event.keyCode) {
      case 84: // t = terrain heightmap
        let img = getHeightMap(scene);
        document.body.appendChild(img);
        break;
    }
  }, false);

  window.addEventListener('resize', onWindowResize);

  const clock = new THREE.Clock()
  let delta;

  renderer.setAnimationLoop( animate );

  function onWindowResize() {
    screenCenterX = window.innerWidth / 2;
    screenCenterY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function animate() {
    if ( controlsEnabled ) {
      controlsAnimate(controls);
    }
    // Compute boids mesh positions
    GPUCompute(birdMesh.material.uniforms);

    delta = clock.getDelta()
    world.timestep = Math.min(delta, 0.1)
    world.step()

    for (let i = 0, n = dynamicBodies.length; i < n; i++) {
      dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
      dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    }
    orbitControls.update();
    render();
  }


  function render() {
    renderer.render(scene, camera);
  }
}
