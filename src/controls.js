///////////////
// controls ///
///////////////
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export var controlsEnabled = false;

var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var prevTime = performance.now();

export const initControls = (scene, camera) => {
  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );
  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

  if ( havePointerLock ) {
    var element = document.body;
    var pointerlockchange = function ( event ) {
      if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
        controlsEnabled = true;
        controls.enabled = true;
        blocker.style.display = 'none';
      } else {
        controls.enabled = false;
        blocker.style.display = 'block';
        instructions.style.display = '';
      }
    };
    var pointerlockerror = function ( event ) {
      instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    instructions.addEventListener( 'click', function ( event ) {
      instructions.style.display = 'none';
      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    }, false );
  } else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }

  const controls = new PointerLockControls( camera );
  scene.add(controls.object);

  controls.moveForward = false;
  controls.moveBackward = false;
  controls.moveLeft = false;
  controls.moveRight = false;

  var onKeyDown = function ( event ) {
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
        controls.moveForward = true;
        break;
      case 37: // left
      case 65: // a
        controls.moveLeft = true; break;
      case 40: // down
      case 83: // s
        controls.moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        controls.moveRight = true;
        break;
    }
  };
  var onKeyUp = function ( event ) {
    switch( event.keyCode ) {
      case 38: // up
      case 87: // w
        controls.moveForward = false;
        break;
      case 37: // left
      case 65: // a
        controls.moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        controls.moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        controls.moveRight = false;
        break;
    }
  };
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  return controls;
};

export const animate = (controls) => {
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;
    velocity.x -= velocity.x * 5.0 * delta;
    velocity.z -= velocity.z * 5.0 * delta;
    velocity.y -= 10.8 * 100.0 * delta; // 100.0 = mass
    velocity.y = Math.max(0, velocity.y);
    direction.z = Number( controls.moveForward ) - Number( controls.moveBackward );
    direction.x = Number( controls.moveLeft ) - Number( controls.moveRight );
    direction.normalize(); // this ensures consistent movements in all directions
    if ( controls.moveForward || controls.moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( controls.moveLeft || controls.moveRight ) velocity.x -= direction.x * 400.0 * delta;
    controls.object.translateX( velocity.x * delta );
    controls.object.translateY( velocity.y * delta );
    controls.object.translateZ( velocity.z * delta );
    prevTime = time;
};
