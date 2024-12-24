/**
 * All things GPUComputationRenderer here for my education
 */
import * as THREE from 'three';
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { BOUNDS, BOUNDS_HALF } from './globals.js';
import velocityFragmentShader from './shaders/boid_velocity.fs';
import positionFragmentShader from './shaders/boid_position.fs';

var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var last = performance.now();

//const velocityFragmentShader = require('raw-loader!glslify-loader!./shaders/boid_velocity.fs');
//const positionFragmentShader = require('raw-loader!glslify-loader!./shaders/boid_position.fs');

export const initGPUComputeRenderer = (width, height, renderFn) => {
  gpuCompute = new GPUComputationRenderer( width, height, renderFn)

  // Create initial state float textures
  var dtPosition = gpuCompute.createTexture();
  var dtVelocity = gpuCompute.createTexture();
  // and fill in here the texture data...
  fillPositionTexture( dtPosition );
  fillVelocityTexture( dtVelocity );

  // Add texture variables
  velocityVariable = gpuCompute.addVariable( "textureVelocity", velocityFragmentShader, dtVelocity );
  positionVariable = gpuCompute.addVariable( "texturePosition", positionFragmentShader, dtPosition );

  // Add variable dependencies
  gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
  gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

  // Add custom uniforms
  positionUniforms = positionVariable.material.uniforms;
  velocityUniforms = velocityVariable.material.uniforms;

  positionUniforms.time = { type: "f", value: 0.0 };
  positionUniforms.delta = { type: "f", value: 0.0 };
  velocityUniforms.time = { type: "f", value: 1.0 };
  velocityUniforms.delta = { type: "f", value: 0.0 };
  velocityUniforms.testing = { type: "f", value: 1.0 };
  velocityUniforms.seperationDistance = { type: "f", value: 1.0 };
  velocityUniforms.alignmentDistance = { type: "f", value: 1.0 };
  velocityUniforms.cohesionDistance = { type: "f", value: 1.0 };
  velocityUniforms.freedomFactor = { type: "f", value: 1.0 };
  velocityUniforms.wind = { type: "v3v", value: new THREE.Vector3(1, 0, 0) };
  velocityUniforms.predator = { type: "v3v", value: new THREE.Vector3(1, 0, 0) };
  velocityUniforms.scatter = { type: "f", value: 1.0 };
  velocityUniforms.heightMap = { type: "uTex", value: new THREE.Texture() };
  velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

  // ???
  velocityVariable.wrapS = THREE.RepeatWrapping;
  velocityVariable.wrapT = THREE.RepeatWrapping;
  positionVariable.wrapS = THREE.RepeatWrapping;
  positionVariable.wrapT = THREE.RepeatWrapping;

  // Check for completeness
  var error = gpuCompute.init();
  if ( error !== null ) {
    console.error( error );
  }

  return { positionUniforms, velocityUniforms };
};

export const GPUCompute = (birdUniforms) => {
    var now = performance.now();
    var delta = (now - last) / 1000;

    if (delta > 1) delta = 1; // safety cap on large deltas
    last = now;

    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    birdUniforms.time.value = now;
    birdUniforms.delta.value = delta;

    //velocityUniforms.predator.value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );

    gpuCompute.compute();

    birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
    birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
};

function fillPositionTexture(texture) {
    // Assuming this is standard code for initializing textures...
    var theArray = texture.image.data;

    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
        var x = Math.random() * BOUNDS - BOUNDS_HALF;
        var y = Math.random() * BOUNDS - BOUNDS_HALF;
        var z = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[ k + 0 ] = x;
        theArray[ k + 1 ] = y;
        theArray[ k + 2 ] = z;
        theArray[ k + 3 ] = 1;
    }
}

function fillVelocityTexture(texture) {
    // Assuming this is standard code for initializing textures...
    var theArray = texture.image.data;

    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;

        theArray[ k + 0 ] = x * 10;
        theArray[ k + 1 ] = y * 10;
        theArray[ k + 2 ] = z * 10;
        theArray[ k + 3 ] = 1;
    }
}

