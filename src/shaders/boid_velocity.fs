/**
 * Shader for bird's velocity
 */
uniform float time;
uniform float testing;
uniform float delta; // about 0.016
uniform float seperationDistance; // 20
uniform float alignmentDistance; // 40
uniform float cohesionDistance; //
uniform float freedomFactor;
/*uniform vec3 predator;*/

const float width = resolution.x;
const float height = resolution.y;
const float numBoids = width * height;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

const float SPEED_LIMIT = 4.0;
const float xMin = -2000.0;
const float xMax = 2000.0;
const float yMin = -500.0;
const float yMax = 1000.0;
const float zMin = -300.0;
const float zMax = 300.0;
const float boundOffset = 40.0;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 bound_position(vec3 b) {
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

  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;
  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;

  vec3 velocity = selfVelocity;
  vec3 centerMass = vec3(.0, .0, .0);
  vec3 sep = vec3(.0, .0, .0);
  vec3 allVelocity = vec3(.0, .0, .0);
  vec3 dir;
  float dist;

  for (float y=0.0;y<height;y++) {
    for (float x=0.0;x<width;x++) {
      vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
      birdPosition = texture2D( texturePosition, ref ).xyz;
      birdVelocity = texture2D( textureVelocity, ref ).xyz ;

      dir = birdPosition - selfPosition;
      dist = length(dir);

      if (dist < 0.0001) continue;

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

  velocity += normalize(centerMass) * 0.3; // delta;
  velocity += normalize(sep) * delta;
  velocity += normalize(allVelocity) * delta;
  velocity += bound_position(selfPosition);

  // Boids rule 3
  // Boids try to match velocity with near boids.

  // Speed Limits
  if ( length( velocity ) > SPEED_LIMIT ) {
    velocity = normalize( velocity ) * SPEED_LIMIT;
  }

  gl_FragColor = vec4(velocity, 1.0 );
}
