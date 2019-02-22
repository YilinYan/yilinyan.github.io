// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.vert#L35

// attributes of our mesh
attribute float position;
attribute float angle;
attribute vec2 uv;

// built-in uniforms from ThreeJS camera and Object3D
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

// custom uniforms to build up our tubes
uniform float thickness;
uniform float time;
uniform float size;
uniform float index;

// pass a few things along to the vertex shader
varying vec2  vUv;
varying vec3  vViewPosition;
varying vec3  vNormal;
varying float vPosition;
varying vec3  vVertPos;
varying float vIndex;
varying float vTime;

float noise(float t) {
  return fract(abs(sin(t * 135711.7 + 24151.991)));
}

float hash(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise(vec2 p) {
  vec2 w = fract(p);
  w = w * w * (3.0 - 2.0 * w);
  p = floor(p);
  return mix(
    mix(hash(p + vec2(0.0, 0.0)), hash(p + vec2(1.0, 0.0)), w.x),
    mix(hash(p + vec2(0.0, 1.0)), hash(p + vec2(1.0, 1.0)), w.x), 
    w.y);
}

vec3 sample (float t) {
  vec3 ret = vec3(t, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(t, index / float(TOTAL_MESHES))), index / float(TOTAL_MESHES));
  if(int(index) > int(index) / 2 * 2) return ret.xyz;
  return vec3(ret.z, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(ret.z, ret.x)), ret.x);;
}

void createTube (float t, vec2 volume, out vec3 offset, out vec3 normal) {
  float nextT = t + (1.0 / float(TOTAL_SEGMENTS));
  vec3 current = sample(t);
  vec3 next = sample(nextT);

  // compute the TBN matrix
  vec3 T = normalize(next - current);
  vec3 B = normalize(cross(T, next + current));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = angle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  // compute position and normal
  normal.xyz = normalize(B * circX + N * circY);
  offset.xyz = current + (B * volume.x * circX + N * volume.y * circY);
}

void main() {
  vec2 volume = vec2(thickness * 0.2, thickness * 1.0);
  vec3 transformed;
  vec3 objNormal;

  createTube(position, volume, transformed, objNormal);
  vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);
  vNormal = normalize(normalMatrix * objNormal);
  vUv = uv.yx;
  vViewPosition = -mvPos.xyz;  // ??????
  vPosition = position;
  vVertPos = mvPos.xyz;
  vIndex = index;
  vTime = time;

  gl_Position = projectionMatrix * mvPos;
}