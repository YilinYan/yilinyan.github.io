(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/geom/createTubeGeometry.js#L2

module.exports = (sides = 8, segments = 50, openEnded = false) => {
  // create a CylinderGeometry as base
  const radius = 1;
  const length = 1;
  const baseGeometry = new THREE.CylinderGeometry(radius, radius, length, sides, segments, openEnded);  
  baseGeometry.rotateZ(Math.PI / 2);  // put it horizontally

  const angles = [];
  const postions = [];
  const UVS = []
  const vertices = baseGeometry.vertices;
  baseGeometry.faces.forEach((face, i) => {
    const {a, b, c} = face;
    const verts = [vertices[a], vertices[b], vertices[c]];
    const uvs = baseGeometry.faceVertexUvs[0][i];  // the first layer of uvs, and the i-th

    if(verts[0].y >= 0 && verts[1].y >= 0 && verts[2].y >= 0) {  // cull out the back side
      verts.forEach((pos, j) => {
        const angle = Math.atan2(pos.z, pos.y);
        angles.push(angle);
        postions.push(pos.x + 0.5);  // [-0.5, 0.5] -> [0.0, 1.0]
        UVS.push(uvs[j].toArray());
      })
    }
  });

  const angleArray = new Float32Array(angles);
  const posArray = new Float32Array(postions);
  const uvArray = new Float32Array(UVS.length * 2);

  for (let i = 0; i < posArray.length; ++i) {
    const [u, v] = UVS[i];
    uvArray[i * 2] = u;
    uvArray[i * 2 + 1] = v;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(posArray, 1));
  geometry.addAttribute('angle', new THREE.BufferAttribute(angleArray, 1));
  geometry.addAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

  baseGeometry.dispose();
  return geometry;
}
},{}],2:[function(require,module,exports){
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.x = camera.position.z = 1.2
camera.position.y = 0.5
camera.lookAt(new THREE.Vector3(0,0,0))
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor('#000000');
canvas = renderer.domElement;
canvas.setAttribute('background', '#000000');
document.body.appendChild( canvas );

// create material
const lengthSeg = 200;
const curveSides = 10;

const vShader = "#define GLSLIFY 1\n// Reference:\n// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.vert#L35\n\n// attributes of our mesh\nattribute float position;\nattribute float angle;\nattribute vec2 uv;\n\n// built-in uniforms from ThreeJS camera and Object3D\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat3 normalMatrix;\n\n// custom uniforms to build up our tubes\nuniform float thickness;\nuniform float time;\nuniform float size;\nuniform float index;\n\n// pass a few things along to the vertex shader\nvarying vec2  vUv;\nvarying vec3  vViewPosition;\nvarying vec3  vNormal;\nvarying float vPosition;\nvarying vec3  vVertPos;\nvarying float vIndex;\nvarying float vTime;\n\nfloat noise(float t) {\n  return fract(abs(sin(t * 135711.7 + 24151.991)));\n}\n\nfloat hash(vec2 st) {\n  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*\n        43758.5453123);\n}\n\nfloat noise(vec2 p) {\n  vec2 w = fract(p);\n  w = w * w * (3.0 - 2.0 * w);\n  p = floor(p);\n  return mix(\n    mix(hash(p + vec2(0.0, 0.0)), hash(p + vec2(1.0, 0.0)), w.x),\n    mix(hash(p + vec2(0.0, 1.0)), hash(p + vec2(1.0, 1.0)), w.x), \n    w.y);\n}\n\nvec3 sample (float t) {\n  vec3 ret = vec3(t, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(t, index / float(TOTAL_MESHES))), index / float(TOTAL_MESHES));\n  if(int(index) > int(index) / 2 * 2) return ret.xyz;\n  return vec3(ret.z, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(ret.z, ret.x)), ret.x);;\n}\n\nvoid createTube (float t, vec2 volume, out vec3 offset, out vec3 normal) {\n  float nextT = t + (1.0 / float(TOTAL_SEGMENTS));\n  vec3 current = sample(t);\n  vec3 next = sample(nextT);\n\n  // compute the TBN matrix\n  vec3 T = normalize(next - current);\n  vec3 B = normalize(cross(T, next + current));\n  vec3 N = -normalize(cross(B, T));\n\n  // extrude outward to create a tube\n  float tubeAngle = angle;\n  float circX = cos(tubeAngle);\n  float circY = sin(tubeAngle);\n\n  // compute position and normal\n  normal.xyz = normalize(B * circX + N * circY);\n  offset.xyz = current + (B * volume.x * circX + N * volume.y * circY);\n}\n\nvoid main() {\n  vec2 volume = vec2(thickness * 0.2, thickness * 1.0);\n  vec3 transformed;\n  vec3 objNormal;\n\n  createTube(position, volume, transformed, objNormal);\n  vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);\n  vNormal = normalize(normalMatrix * objNormal);\n  vUv = uv.yx;\n  vViewPosition = -mvPos.xyz;  // ??????\n  vPosition = position;\n  vVertPos = mvPos.xyz;\n  vIndex = index;\n  vTime = time;\n\n  gl_Position = projectionMatrix * mvPos;\n}";
const fShader = "// Reference:\n// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.frag#L14\n\n#extension GL_OES_standard_derivatives : enable\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec3 sscolor;\n\nvarying vec2  vUv;\nvarying vec3  vViewPosition;\nvarying vec3  vNormal;\nvarying float vPosition;\nvarying vec3  vVertPos;\nvarying float vIndex;\nvarying float vTime;\n\nvec3 normals_1_0(vec3 pos) {\n  vec3 fdx = dFdx(pos);\n  vec3 fdy = dFdy(pos);\n  return normalize(cross(fdx, fdy));\n}\n\n\n\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(12325.13, 12245.93))) * 86762.39);\n}\n\nfloat noise(vec2 p) {\n  vec2 w = fract(p);\n  w = w * w * (3.0 - 2.0 * w);\n  p = floor(p);\n  return mix(\n    mix(hash(p + vec2(0.0, 0.0)), hash(p + vec2(1.0, 0.0)), w.x),\n    mix(hash(p + vec2(0.0, 1.0)), hash(p + vec2(1.0, 1.0)), w.x), \n    w.y);\n}\n\nvoid main () {\n  vec3 normal = vNormal;\n  vec3 lightDirec = normalize(vec3(10.0, -2.0, 6.0));\n  float diffuse = clamp(dot(lightDirec, normal), 0.0, 1.0);\n  float ambient = dot(lightDirec, normal) * 0.5 + 0.5;\n\n  vec3 col = vec3(0.0);\n  col += diffuse * vec3(0.1, 0.1, 1.0) * sscolor;\n  col += ambient * vec3(0.3, 0.1, 0.1) * sscolor;\n\n  // add some fake rim lighting\n  vec3 view = normalize(vec3(1.2, 0.5, 1.2));\n  vec3 ref = normalize(2.0 * normal - lightDirec);\n  float specular = clamp(dot(view, ref), 0.0, 1.0);\n  col += pow(specular, 4.0) * diffuse * vec3(0.1, 0.1, 1.0);\n  col += pow(specular, 12.0) * vec3(0.1, 0.1, 1.0);\n\n  // back light\n  float diffuse2 = clamp(dot(-lightDirec, normal), 0.0, 1.0);\n  col += diffuse2 * vec3(0.7, 0.1, 0.1) * sscolor;\n\n  // tone map\n  col = col / (vec3(1.0) + col);\n  col = pow(col, vec3(0.7)) * 1.5;\n\n  // alpha\n  // float alpha = clamp(length(vVertPos) * 0.05, 0.0, 1.0) * (\n  //   sqrt(ambient) + pow(specular, 4.0) * diffuse);\n  // cut into segments\n  // alpha *= sign(fract((vPosition + 0.5) * 12.0 + vIndex / 40. * 2.0 + vTime / 4.) - 0.5);\n  // alpha *= pow(noise(8.0*vec2(vPosition, 1024.0*vIndex/float(TOTAL_MESHES))), 3.0);\n\n  gl_FragColor = vec4(col, 1.0);\n}";
const totalMeshes = 200;
const baseMaterial = new THREE.RawShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  side: THREE.FrontSide,
  transparent: true,
  extensions: {
    deriviatives: true
  },
  defines: {
    PI: Math.PI,
    TOTAL_SEGMENTS: lengthSeg,
    TOTAL_MESHES: totalMeshes,
  },
  uniforms: {
    thickness: { type: 'f', value: 0.01 },
    time: { type: 'f', value: 0 },
    size: { type: 'f', value: 4.0 },
    sscolor: { type: 'c', value: new THREE.Color('#222262') },
    index: { type: 'f', value: 0 }
  }
});

// create meshes
const myRand = (a, b) => { return Math.random() * (b - a) + a; };
const createCurve = require( './createCurve.js' );
const geometry = createCurve( curveSides, lengthSeg );
const meshContainer = new THREE.Object3D();
const meshes = new Array(totalMeshes).fill(null).map((_, i) => {
  const material = baseMaterial.clone();
  material.uniforms = THREE.UniformsUtils.clone(material.uniforms);
  material.uniforms.index.value = i;
  material.uniforms.thickness.value = myRand(0.001, 0.002);  // random thickness

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  meshContainer.add(mesh);
  return mesh;
});
scene.add(meshContainer);

// animate
var timeNow = Date.now();
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );

  var dt = (Date.now() - timeNow) / 1000.0;
  timeNow = Date.now();
  meshes.forEach((mesh) => {
    mesh.material.uniforms.time.value += dt;
  });
}
animate();
},{"./createCurve.js":1}]},{},[2]);
