import * as THREE from 'three';
import BirdGeometry from "./birdgeometry.js";
import vertexShader from "./shaders/bird.vs";
import fragmentShader from "./shaders/bird.fs";

//const vertexShader = require('raw-loader!glslify-loader!./shaders/bird.vs');
//const fragmentShader = require('raw-loader!glslify-loader!./shaders/bird.fs');

export const initBoids = (scene) => {
    var geometry = new BirdGeometry();
    // For Vertex and Fragment
    var birdUniforms = {
        color: { type: "c", value: new THREE.Color( 0xff2200 ) },
        texturePosition: { type: "t", value: null },
        textureVelocity: { type: "t", value: null },
        time: { type: "f", value: 1.0 },
        delta: { type: "f", value: 0.0 }
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

