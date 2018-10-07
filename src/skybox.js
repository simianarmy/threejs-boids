//import * as THREE from 'three';
import skyposx1 from './images/sky/skyposx1.png';
import skynegx1 from './images/sky/skynegx1.png';
import skyposy1 from './images/sky/skyposy1.png';
import skynegy1 from './images/sky/skynegy1.png';
import skyposz1 from './images/sky/skyposz1.png';
import skynegz1 from './images/sky/skynegz1.png';

////////////
// skybox //
////////////
export const initSkybox = (scene) => {
  var materialArray = [];
  let loader = new THREE.TextureLoader();
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skyposx1 ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skynegx1 ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skyposy1 ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skynegy1 ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skyposz1 ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: loader.load( skynegz1 ) }));

  for (var i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
  }
  let material = new THREE.MeshFaceMaterial( materialArray );

  // couldnt get CubeTextureLoader to look right
  /*
  let loader = new THREE.CubeTextureLoader();
  //loader.setPath( 'images/sky/' );

  // TODO: Finish this shit!
  let textureCube = loader.load( [
        skyposx1, skynegx1,
        skyposy1, skynegy1,
        skyposz1, skynegz1
  ] );
  let material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, side: THREE.BackSide } );
  */

  let skyboxGeom = new THREE.BoxGeometry( 3000, 3000, 3000, 1, 1, 1 );
  let skybox = new THREE.Mesh( skyboxGeom, material );

  scene.add( skybox );
};

