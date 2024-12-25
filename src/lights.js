import * as THREE from 'three';

export const initLights = (scene) => {
  let skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
  skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
  // TODO: Shadows
  //skyLight.castShadow = true;
  scene.add(skyLight);

  const ambientLight = new THREE.AmbientLight( 0xbbbbbb );
  scene.add( ambientLight );
  // What is this for?
  //let light = new THREE.DirectionalLight(0xc3eaff, 0.75);
  //light.position.set(-1, -0.5, -1);
  //scene.add(light);
};
