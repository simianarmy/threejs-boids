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

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;

const float SPEED_LIMIT = 9.0;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 birdPosition, birdVelocity;

  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;
  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;

  // rule 1
  // Boids try to fly towards the centre of mass of neighbouring boids

  // Boids rule 2
  // Boids try to keep a small distance away from other objects (including other boids).

  // Boids rule 3
  // Boids try to match velocity with near boids.

  gl_FragColor = vec4( selfVelocity, 1.0 );
}
