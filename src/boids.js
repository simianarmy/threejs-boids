//import * as THREE from 'three';
import "./birdgeometry.js";

const vertexShader = require('raw-loader!glslify-loader!./shaders/bird.vs');
const fragmentShader = require('raw-loader!glslify-loader!./shaders/bird.fs');

export const initBoids = (scene) => {
    var geometry = new THREE.BirdGeometry();
    // For Vertex and Fragment
    var birdUniforms = {
        color: { value: new THREE.Color( 0xff2200 ) },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 1.0 },
        delta: { value: 0.0 }
    };
    // ShaderMaterial
    var material = new THREE.ShaderMaterial( {
        uniforms: birdUniforms,
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide
    });
    var birdMesh = new THREE.Mesh( geometry, material );
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    scene.add(birdMesh);

    return birdMesh;
};

