var scene, camera, renderer, controls, raycaster;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
var birdUniforms;

import skyposx1 from './images/skyposx1.png';
import skynegx1 from './images/skynegx1.png';
import skyposy1 from './images/skyposy1.png';
import skynegy1 from './images/skynegy1.png';
import skyposz1 from './images/skyposz1.png';
import skynegz1 from './images/skynegz1.png';

console.log('skyposx1 filename = ', skyposx1);

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
init();
animate();

function init() {

    function initBirds() {
        var geometry = new THREE.BirdGeometry();
        // For Vertex and Fragment
        birdUniforms = {
            color: { value: new THREE.Color( 0xff2200 ) },
            texturePosition: { value: null },
            textureVelocity: { value: null },
            time: { value: 1.0 },
            delta: { value: 0.0 }
        };
        // ShaderMaterial
        var material = new THREE.ShaderMaterial( {
            uniforms:       birdUniforms,
            vertexShader:   document.getElementById( 'birdVS' ).textContent,
            fragmentShader: document.getElementById( 'birdFS' ).textContent,
            side: THREE.DoubleSide
        });
        var birdMesh = new THREE.Mesh( geometry, material );
        birdMesh.rotation.y = Math.PI / 2;
        birdMesh.matrixAutoUpdate = false;
        birdMesh.updateMatrix();
        scene.add(birdMesh);
    }

    scene = new THREE.Scene();

    ////////////
    // camera //
    ////////////
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    //camera.position.set(0, 100, 200);
    //camera.up.set( 0, 1, 0);
    //camera.lookAt(scene.position);

    //////////////
    // renderer //
    //////////////
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize ( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //var axes = new THREE.AxisHelper(100);
    //scene.add(axes);

    ////////////////
    // raycaster //
    ////////////////
    //raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    ////////////
    // cool floor  //
    ////////////
    var floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );
    for ( var i = 0, l = floorGeometry.vertices.length; i < l; i ++ ) {
        var vertex = floorGeometry.vertices[ i ];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
    }
    for ( var i = 0, l = floorGeometry.faces.length; i < l; i ++ ) {
        var face = floorGeometry.faces[ i ];
        face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    }
    var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
    var floor = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floor );

    ////////////
    // skybox //
    ////////////
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

    //initBirds();

    ///////////////
    // controls ///
    ///////////////
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
}

function animate() {
    requestAnimationFrame( animate );

    if ( controlsEnabled ) {
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 10.8 * 100.0 * delta; // 100.0 = mass
        velocity.y = Math.max(0, velocity.y);
        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveLeft ) - Number( moveRight );
        direction.normalize(); // this ensures consistent movements in all directions
        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        prevTime = time;
    }
    render();
}

function render() {
    renderer.render(scene, camera);
    }
