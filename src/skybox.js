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
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skyposx1 ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skynegx1 ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skyposy1 ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skynegy1 ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skyposz1 ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( skynegz1 ) }));

    for (var i = 0; i < 6; i++) {
        materialArray[i].side = THREE.BackSide;
    }
    var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyboxGeom = new THREE.BoxGeometry( 5000, 5000, 5000, 1, 1, 1 );
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    scene.add( skybox );
};

