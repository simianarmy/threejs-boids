//import * as THREE from 'three';
import skyposx1 from './images/skyposx1.png';
import skynegx1 from './images/skynegx1.png';
import skyposy1 from './images/skyposy1.png';
import skynegy1 from './images/skynegy1.png';
import skyposz1 from './images/skyposz1.png';
import skynegz1 from './images/skynegz1.png';

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
    var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyboxGeom = new THREE.BoxGeometry( 3000, 3000, 3000, 1, 1, 1 );
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    scene.add( skybox );
};

