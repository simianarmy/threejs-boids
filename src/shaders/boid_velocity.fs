/**
 * Shader for bird's velocity
 */
uniform float time;
uniform float testing;
uniform float delta; // about 0.016
uniform float seperationDistance; // 20
uniform float alignmentDistance; // 20
uniform float cohesionDistance; // 20
uniform float freedomFactor;
uniform vec3 wind; // set by mouse
uniform vec3 predator; // set by mouse
uniform float scatter; // 1.
uniform sampler2D heightMap;

const float width = resolution.x;
const float height = resolution.y;
const float numBoids = width * height;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

const float SPEED_LIMIT = 9.0;
const float xMin = -1500.0;
const float xMax = 1500.0;
const float heightFromGroundMin = 50.0;
const float yMax = 1000.0;
const float zMin = -300.0;
const float zMax = 330.0;
const float boundOffset = 10.0;

float zoneRadius, zoneRadiusSquared;
float separationThreshold;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 bound_position(vec3 b, float yMin) {
  vec3 v = vec3(.0, .0, .0);

  if (b.x < xMin) {
    v.x = boundOffset;
  } else if (b.x > xMax) {
    v.x = -boundOffset;
  }

  if (b.y < yMin) {
    v.y = boundOffset;
  } else if (b.y > yMax) {
    v.y = -boundOffset;
  }

  if (b.z < zMin) {
    v.z = boundOffset;
  } else if (b.z > zMax) {
    v.z = -boundOffset;
  }

  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 birdPosition, birdVelocity;

  zoneRadius = seperationDistance + alignmentDistance + cohesionDistance;
  zoneRadiusSquared = zoneRadius * zoneRadius;

  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;
  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;

  // get terrain height at this position
  float groundPos = texture2D(heightMap, uv).y;
  float groundHeight = (groundPos / 255.0 * 300.0 + 100.0) + 5.0;

  vec3 velocity = selfVelocity;
  vec3 centerMass = vec3(.0, .0, .0);
  vec3 sep = vec3(.0, .0, .0);
  vec3 allVelocity = vec3(.0, .0, .0);
  vec3 dir;
  float dist, distSquared;
  float speedLimit = SPEED_LIMIT;

  for (float y=0.0;y<height;y++) {
    for (float x=0.0;x<width;x++) {
      vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
      birdPosition = texture2D( texturePosition, ref ).xyz;
      birdVelocity = texture2D( textureVelocity, ref ).xyz ;

      dir = birdPosition - selfPosition;
      dist = length(dir);

      if (dist < 0.0001) continue;

      distSquared = dist * dist;
      if (distSquared > zoneRadiusSquared ) continue;

      // rule 1
      // Boids try to fly towards the centre of mass of neighbouring boids
      centerMass += birdPosition;

      // rule 2
      // Boids try to keep a small distance away from other objects (including other boids).
      /*if (dist < seperationDistance) {*/
        sep -= dir;
      /*}*/

      // Boids rule 3
      // Boids try to match velocity with near boids.
      allVelocity += (birdVelocity - selfVelocity);
    }
  }
  centerMass -= selfPosition;
  centerMass /= (numBoids - 1.);
  sep += selfPosition;
  allVelocity -= selfVelocity;
  allVelocity /= (numBoids - 1.);

  // Add rules 1 - 3
  velocity += (1. / cohesionDistance) * normalize(centerMass) * delta * scatter;
  velocity += (1. / seperationDistance) * normalize(sep) * delta;
  velocity += (1. / alignmentDistance) * normalize(allVelocity) * delta;

  // apply wind, if any
  if (length(wind) > 0.) {
    velocity += normalize(wind) * delta;
  }

  // attract to center
  dir = selfPosition - centerMass;
  velocity -= normalize(dir) * delta * 5.;

  // run from predator
  if (length(predator) > 0.) {
    dir = predator - selfPosition;
    dir.z = 0.;
    float distToPredator = length(dir);

    float preyRadius = 150.0;
    float preyRadiusSq = preyRadius * preyRadius;

    if (distToPredator < preyRadius) {
      // the closer bird is to predator, the greater the multiplier
      float m = (distToPredator*distToPredator / preyRadiusSq  - 1.) * delta * 100.;
      velocity += m * normalize(dir);
      // increase speed limit
      speedLimit += 5.;
    }
  }

  // Ground & bounds collision detection
  velocity += bound_position(selfPosition, groundHeight + heightFromGroundMin) * delta;

  // Speed Limits
  if ( length( velocity ) > speedLimit ) {
    velocity = normalize( velocity ) * speedLimit;
  }

  gl_FragColor = vec4(velocity, 1.0 );
}
