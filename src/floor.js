////////////
// cool floor  //
////////////
import { WORLD_WIDTH } from './globals.js';
import 'three.terrain.js';

export const initFloor = (scene) => {

  var xS = 63, yS = 63;
  var terrainScene = THREE.Terrain({
    easing: THREE.Terrain.Linear,
    frequency: 2.5,
    heightmap: THREE.Terrain.DiamondSquare,
    material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
    maxHeight: 100,
    minHeight: -100,
    steps: 1,
    useBufferGeometry: false,
    xSegments: xS,
    xSize: 1024,
    ySegments: yS,
    ySize: 1024,
  });
  // Assuming you already have your global scene, add the terrain to it
  scene.add(terrainScene);

  /*
   * Triangle-y floor from example
   *
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
    */
};

