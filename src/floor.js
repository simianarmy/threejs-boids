////////////
// cool floor  //
////////////
import { WORLD_WIDTH } from './globals.js';
import 'three.terrain.js';

import grassImg from './images/ground/grass1.jpg';
import sandImg from './images/ground/sand1.jpg';
import snowImg from './images/ground/snow1.jpg';
import stoneImg from './images/ground/stone1.jpg';

const xS = 63, yS = 63, minHeight = -100, maxHeight = 200; // spread: 300
const xSize = WORLD_WIDTH, ySize = WORLD_WIDTH;

/**
 * @returns {Image}
 */
export const getHeightMap = (scene) => {
  let terrain = scene.getObjectByName('Terrain');
  // create heightmap canvas
  // Append to your document body to view; right click to save as a PNG image.
  // Note: doesn't work if you generated the terrain with
  // `useBufferGeometry` set to `true`.
  let canvas = THREE.Terrain.toHeightmap(
    // terrainScene.children[0] is the most detailed version of the terrain mesh
    terrain.children[0].geometry.vertices,
    { xSegments: xS, ySegments: yS, maxHeight, minHeight }
  );
  console.log('Heightmap canvas', canvas);
  const context = canvas.getContext('2d');
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
  /*
  let img = new Image();
  img.src = canvas.toDataURL();
  return img;
  */
};

export const initFloor = (scene) => {

  let terrainScene, blend;
    /*
   * Triangle-y floor from example
   *
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
  //var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: 0x5566aa} );

  function regenerate(material) {
    console.log('Regenerating terrain');
    if (terrainScene) {
      scene.remove(terrainScene);
    }

    terrainScene = THREE.Terrain({
      easing: THREE.Terrain.Linear,
      frequency: 2.5,
      heightmap: THREE.Terrain.PerlinDiamond,
      material,
      maxHeight,
      minHeight,
      steps: 1,
      stretch: true,
      useBufferGeometry: false,
      xSegments: xS,
      xSize,
      ySegments: yS,
      ySize
    });
    terrainScene.name = 'Terrain';
    // Assuming you already have your global scene, add the terrain to it
    scene.add(terrainScene);

    // Optional:
    // Get the geometry of the terrain across which you want to scatter meshes
    let geo = terrainScene.children[0].geometry;
    // Add randomly distributed foliage
    let decoScene = THREE.Terrain.ScatterMeshes(geo, {
      mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
      w: xS,
      h: yS,
      spread: 0.02,
      randomness: Math.random,
    });
    terrainScene.add(decoScene);

    return terrainScene;
  };

  // add water?
  let water = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 16, 16),
    new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
  );
  water.position.y = -60;
  water.rotation.x = -0.5 * Math.PI;
  scene.add(water);

	// Load ground material textures
  let loader = new THREE.TextureLoader();

  loader.load(sandImg, function(t1) {
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    /*
    let sand = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 64, 64),
      new THREE.MeshLambertMaterial({map: t1})
    );
    sand.position.y = -59;
    sand.rotation.x = -0.5 * Math.PI;
    scene.add(sand);
    */

		// Use this for ground texture until img textures code works
    let gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });

    regenerate(gray);

    /* the code below causes a shader error.  something about a lighting
     * uniform value...
     *
    loader.load(grassImg, function(t2) {
      loader.load(stoneImg, function(t3) {
        loader.load(snowImg, function(t4) {
          // t2.repeat.x = t2.repeat.y = 2;
          let blend = THREE.Terrain.generateBlendedMaterial([
            {texture: t1},
            {texture: t2, levels: [-80, -35, 20, 50]},
            {texture: t3, levels: [20, 50, 60, 85]},
            {texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'},
            {texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'}, // between 27 and 45 degrees
          ]);

          regenerate(blend);
        });
      });
    });
    */
  });
};

