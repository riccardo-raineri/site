/*!
 * lanyard.js — Vanilla JS port of the React Bits Lanyard component
 * https://reactbits.dev  |  Original: MIT licence
 *
 * Requires Three.js >= 0.161.0 loaded as window.THREE before this script.
 * Includes Lanyard.createBusinessCard() to generate a card image that
 * matches the site's dark / cinematic HUD design without any external files.
 *
 * Usage:
 *   const card = new Lanyard(document.querySelector('#lanyard-wrap'), {
 *     frontImage : Lanyard.createBusinessCard(),  // or any image URL
 *     backImage  : Lanyard.createBusinessCard({ side: 'back' }),
 *     finish     : 'glossy',
 *     metal      : 'graphite',
 *     size       : 0.52,
 *     breeze     : 0.4
 *   });
 *   // later…
 *   card.update({ finish: 'holographic' });
 *   card.destroy();
 */
(function (global) {
  'use strict';

  var THREE = global.THREE;
  if (!THREE) {
    console.error('[Lanyard] THREE.js must be loaded before lanyard.js');
    return;
  }

  /* ─── constants ──────────────────────────────────────────────────────── */
  var CARD_SIZES    = { portrait: [1.6, 2.25], landscape: [2.25, 1.6] };
  var ANCHORS       = { left: 0.27, center: 0.5, right: 0.73 };
  var THICKNESS     = 0.018;
  var BEVEL         = 0.007;
  var JOINTS        = 4;
  var NODE_WEIGHT   = 1 / 0.05;
  var MAX_STEP      = 1 / 960;
  var ITERATIONS    = 2;
  var SAMPLES       = 72;
  var FOV           = 24;
  var STRAP_WIDTH   = 0.36;
  var RING_RADIUS   = 0.095;
  var RING_TUBE     = 0.0135;
  var EYELET_RADIUS = 0.036;
  var CLAMP_BODY    = 0.15;
  var FACE_WIDTH    = 1024;

  var FINISHES = {
    glossy:      { roughness: 0.42, metalness: 0,    clearcoat: 1,   clearcoatRoughness: 0.06, foil: 0, anisotropy: 0   },
    matte:       { roughness: 0.85, metalness: 0,    clearcoat: 0,   clearcoatRoughness: 0.6,  foil: 0, anisotropy: 0   },
    holographic: { roughness: 0.3,  metalness: 0,    clearcoat: 1,   clearcoatRoughness: 0.04, foil: 1, anisotropy: 0   },
    metallic:    { roughness: 0.36, metalness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.18, foil: 0, anisotropy: 0.7 }
  };

  var BAND_COLUMNS = [0, 0.07, 0.93, 1];
  var BAND_BEND    = [-0.95, -0.28, 0.28, 0.95];
  var FLIP_SPIN    = 9;

  var METALS = {
    silver:   { color: '#d9dce2', roughness: 0.16 },
    gold:     { color: '#e4b965', roughness: 0.2  },
    graphite: { color: '#4d4f55', roughness: 0.28 }
  };

  /* ─── GLSL shader injections (holographic foil effect) ───────────────── */
  var FOIL_VERT_HEAD = `
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`;
  var FOIL_VERT_BODY = `
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0,0.0,0.0,0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0,1.0,0.0,0.0)).xyz);
`;
  var FOIL_FRAG_HEAD = `
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
float foilHash(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float foilBump(float t,float c,float w){float x=(t-c)/w;return max(0.0,1.0-x*x);}
vec3 foilSpectrum(float t){return vec3(foilBump(t,0.82,0.32)+0.4*foilBump(t,0.02,0.12),foilBump(t,0.5,0.26),foilBump(t,0.18,0.24));}
vec3 foilGrating(float u,float sp){vec3 c=vec3(0.0);for(int m=1;m<=2;m++){float o=float(m);float t=(sp*abs(u)/o-0.38)/0.32;c+=foilSpectrum(t)/o;}return c;}
vec3 foilShard(vec2 p){vec2 b=floor(p);float best=9.0,edge=9.0;vec2 id=b;for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){vec2 cell=b+vec2(float(i),float(j));vec2 site=cell+vec2(foilHash(cell),foilHash(cell+7.31))*0.9+0.05;float d=length(site-p);if(d<best){edge=best;best=d;id=cell;}else if(d<edge){edge=d;}}}return vec3(foilHash(id+3.17),foilHash(id+11.73),edge-best);}
`;
  var FOIL_FRAG_BODY = `
if(foilStrength>0.0){
  vec3 foilView=normalize(vViewPosition);
  vec3 foilNormal=normalize(normal);
  vec2 foilP=vec2(vFoilUv.x,vFoilUv.y*foilAspect);
  vec3 shard=foilShard(foilP*26.0);
  vec2 ray=foilP-vec2(-1.6,2.6*foilAspect);
  float angle=atan(ray.y,ray.x)+(shard.x-0.5)*0.16;
  vec3 grating=normalize(vFoilX*cos(angle)+vFoilY*sin(angle));
  float spacing=1.7*(0.95+shard.y*0.1);
  vec3 rainbow=foilGrating(dot(foilKey+foilView,grating),spacing);
  rainbow+=0.6*foilGrating(dot(foilTop+foilView,grating),spacing);
  rainbow*=0.8+0.2*smoothstep(0.0,0.04,shard.z);
  rainbow=max(rainbow-0.35*min(rainbow.r,min(rainbow.g,rainbow.b)),0.0);
  vec2 grid=foilP*64.0;
  vec2 cell=floor(grid);
  vec2 jitter=vec2(foilHash(cell+1.7),foilHash(cell+9.2));
  float flake=smoothstep(0.32,0.06,length(fract(grid)-jitter*0.6-0.2))*step(0.45,foilHash(cell+4.4));
  vec3 facet=normalize(foilNormal+(vFoilX*(jitter.x-0.5)+vFoilY*(jitter.y-0.5))*0.8);
  float glint=pow(max(dot(reflect(-foilKey,facet),foilView),0.0),28.0);
  glint+=0.7*pow(max(dot(reflect(-foilTop,facet),foilView),0.0),28.0);
  float fine=1.0-smoothstep(0.35,0.9,max(fwidth(grid.x),fwidth(grid.y)));
  vec3 sparkle=flake*glint*fine*(vec3(0.7)+foilGrating(dot(foilKey+foilView,grating)+jitter.x*0.4,spacing));
  float ink=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));
  float foil=foilStrength*(0.08+0.92*smoothstep(0.04,0.7,ink));
  float facing=clamp(dot(foilNormal,foilView),0.0,1.0);
  float tint=clamp(dot(rainbow,vec3(0.4)),0.0,1.0);
  outgoingLight=outgoingLight*(1.0-foil*(0.3+0.32*tint))+(rainbow*0.62*(0.4+0.6*facing)+sparkle*1.6)*foil;
}
`;

  /* ─── utility functions ──────────────────────────────────────────────── */
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function mix(a, b, t)     { return a + (b - a) * t; }

  function parseColor(value, fallback) {
    try {
      var ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return fallback;
      ctx.fillStyle = '#000'; ctx.fillStyle = value;
      var r = ctx.fillStyle;
      if (r.startsWith('#')) {
        var n = parseInt(r.slice(1), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      }
      var p = r.match(/[\d.]+/g);
      if (!p || p.length < 3) return fallback;
      return [+p[0]/255, +p[1]/255, +p[2]/255];
    } catch(e) { return fallback; }
  }

  function luminance(rgb) { return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]; }
  function toCss(rgb, a) { a = a !== undefined ? a : 1; return 'rgba('+Math.round(rgb[0]*255)+','+Math.round(rgb[1]*255)+','+Math.round(rgb[2]*255)+','+a+')'; }

  function seeded(start) {
    var state = start >>> 0;
    return function() {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function traceRoundedRect(path, x, y, w, h, radius) {
    var r = Math.max(0, Math.min(radius, w/2, h/2));
    var k = r * 0.4477;
    path.moveTo(x+r, y);
    path.lineTo(x+w-r, y);
    path.bezierCurveTo(x+w-k,y, x+w,y+k, x+w,y+r);
    path.lineTo(x+w, y+h-r);
    path.bezierCurveTo(x+w,y+h-k, x+w-k,y+h, x+w-r,y+h);
    path.lineTo(x+r, y+h);
    path.bezierCurveTo(x+k,y+h, x,y+h-k, x,y+h-r);
    path.lineTo(x, y+r);
    path.bezierCurveTo(x,y+k, x+k,y, x+r,y);
  }

  var _imageCache = new Map();
  function loadImage(url) {
    if (!url) return Promise.resolve(null);
    if (_imageCache.has(url)) return _imageCache.get(url);
    var p = new Promise(function(resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding   = 'async';
      img.onload  = function() { resolve(img); };
      img.onerror = function() { resolve(null); };
      img.src = url;
    });
    _imageCache.set(url, p);
    return p;
  }

  /* ─── geometry builders ──────────────────────────────────────────────── */
  function cardLayout(orientation, cornerRadius) {
    var sz = CARD_SIZES[orientation] || CARD_SIZES.portrait;
    var width = sz[0], height = sz[1];
    var radius = mix(0.03, Math.min(width, height)*0.2, clamp(cornerRadius, 0, 1));
    var slot = { width: 0.34, height: 0.07, y: height/2 - 0.13 };
    var ringY = height/2 - 0.055;
    return { width: width, height: height, radius: radius, slot: slot, ringY: ringY, hangY: ringY + RING_RADIUS };
  }

  function buildCardGeometry(layout) {
    var w = layout.width, h = layout.height, r = layout.radius, slot = layout.slot;
    var outline = new THREE.Shape();
    traceRoundedRect(outline, -w/2+BEVEL, -h/2+BEVEL, w-BEVEL*2, h-BEVEL*2, Math.max(r-BEVEL, 0.005));
    var hole = new THREE.Path();
    traceRoundedRect(hole, -slot.width/2-BEVEL, slot.y-slot.height/2-BEVEL, slot.width+BEVEL*2, slot.height+BEVEL*2, slot.height/2+BEVEL);
    outline.holes.push(hole);
    var body = new THREE.ExtrudeGeometry(outline, { depth: THICKNESS, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 5, curveSegments: 24 });
    body.translate(0, 0, -THICKNESS/2);
    var face = new THREE.ShapeGeometry(outline, 24);
    var pos = face.getAttribute('position'), uv = face.getAttribute('uv');
    for (var i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i)+w/2)/w, (pos.getY(i)+h/2)/h);
    uv.needsUpdate = true;
    return { body: body, face: face };
  }

  function buildClampGeometry(width) {
    var shape = new THREE.Shape(), cw = width * 1.16;
    traceRoundedRect(shape, -cw/2+0.014, -CLAMP_BODY/2+0.014, cw-0.028, CLAMP_BODY-0.028, 0.024);
    var g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014, bevelSegments: 6, curveSegments: 10 });
    g.translate(0, 0, -0.01);
    return g;
  }

  function buildBandGeometry(count) {
    var cols = BAND_COLUMNS.length, g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count*cols*3), 3));
    g.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(count*cols*3), 3));
    g.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(count*cols*2), 2));
    var idx = [];
    for (var i = 0; i < count-1; i++) for (var c = 0; c < cols-1; c++) { var a = i*cols+c; idx.push(a, a+cols, a+1, a+1, a+cols, a+cols+1); }
    g.setIndex(idx);
    return g;
  }

  function buildEnvironment(renderer) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0.035, 0.035, 0.04);
    var geom = new THREE.PlaneGeometry(1, 1), mats = [];
    function panel(intensity, pos, scale, rot) {
      var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide });
      mats.push(mat);
      var m = new THREE.Mesh(geom, mat);
      m.position.set(pos[0], pos[1], pos[2]);
      m.scale.set(scale[0], scale[1], 1);
      m.lookAt(0,0,0);
      if (rot) m.rotateZ(rot);
      scene.add(m);
    }
    panel(2.6,  [0,4.5,8],   [9,4]);
    panel(6,    [-5.5,0.5,7],[0.9,14]);
    panel(4,    [5,-0.5,8],  [0.6,14]);
    panel(3.5,  [0,-1,9],    [24,0.35], Math.PI/3);
    panel(2.5,  [1,2.5,9],   [24,0.2],  Math.PI/3);
    panel(1.4,  [0,6,-6],    [12,4]);
    panel(0.5,  [0,-7,1],    [16,6]);
    panel(0.9,  [8,0,-2],    [4,10]);
    var pmrem  = new THREE.PMREMGenerator(renderer);
    var target = pmrem.fromScene(scene, 0.035);
    pmrem.dispose();
    geom.dispose();
    mats.forEach(function(m) { m.dispose(); });
    return target;
  }

  function makeCanvasTexture(canvas, anisotropy) {
    var t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = anisotropy;
    return t;
  }

  function buildGrainTexture() {
    var sz = 128, cv = document.createElement('canvas');
    cv.width = cv.height = sz;
    var ctx = cv.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(cv);
    var rng = seeded(7);
    var field = Float32Array.from({ length: sz*sz }, function() { return rng(); });
    function h(x, y) {
      var sum = 0;
      for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) sum += field[((y+j+sz)%sz)*sz+((x+i+sz)%sz)];
      return (sum/9)*1.6;
    }
    var img = ctx.createImageData(sz, sz);
    for (var y = 0; y < sz; y++) for (var x = 0; x < sz; x++) {
      var nx = h((x-1+sz)%sz,y) - h((x+1)%sz,y);
      var ny = h(x,(y-1+sz)%sz) - h(x,(y+1)%sz);
      var len = Math.hypot(nx, ny, 1);
      var i = (y*sz+x)*4;
      img.data[i]   = ((nx/len)*0.5+0.5)*255;
      img.data[i+1] = ((ny/len)*0.5+0.5)*255;
      img.data[i+2] = ((1/len)*0.5+0.5)*255;
      img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 7);
    return t;
  }

  function buildWeaveTexture() {
    var sz = 128, threads = 8, rng = seeded(19);
    var fiber = Float32Array.from({ length: sz*sz }, function() { return rng(); });
    function profile(f) { return Math.sqrt(Math.max(0, 1-4*f*f)); }
    function h(x, y) {
      var px = ((x%sz)+sz)%sz, py = ((y%sz)+sz)%sz;
      var u = (px/sz)*threads, v = (py/sz)*threads;
      var cu = Math.floor(u), cv = Math.floor(v);
      var fu = u-cu-0.5, fv = v-cv-0.5;
      var lift = (cu+cv)%2 === 0;
      var warp = profile(fu)*(0.55+0.45*Math.cos(fv*Math.PI*(lift?1:0.6)));
      var weft = profile(fv)*(0.55+0.45*Math.cos(fu*Math.PI*(lift?0.6:1)));
      return (lift ? Math.max(warp,weft*0.7) : Math.max(weft,warp*0.7)) + fiber[py*sz+px]*0.08;
    }
    var data = new Uint8Array(sz*sz*4);
    for (var y = 0; y < sz; y++) for (var x = 0; x < sz; x++) {
      var nx = (h(x-1,y) - h(x+1,y))*1.6;
      var ny = (h(x,y-1) - h(x,y+1))*1.6;
      var len = Math.hypot(nx,ny,1);
      var i = (y*sz+x)*4;
      data[i]   = ((nx/len)*0.5+0.5)*255;
      data[i+1] = ((ny/len)*0.5+0.5)*255;
      data[i+2] = ((1/len)*0.5+0.5)*255;
      data[i+3] = 255;
    }
    var t = new THREE.DataTexture(data, sz, sz);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }

  function drawFitted(ctx, image, w, h, fit) {
    var s = (fit === 'contain' ? Math.min : Math.max)(w/image.width, h/image.height);
    ctx.drawImage(image, (w-image.width*s)/2, (h-image.height*s)/2, image.width*s, image.height*s);
  }

  function paintFaceCanvas(canvas, image, color, fit) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = toCss(color);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (image) drawFitted(ctx, image, canvas.width, canvas.height, fit);
  }

  function paintStrapCanvas(canvas, image, color) {
    var across = 192;
    var along  = image ? Math.max(64, Math.round((image.width/image.height)*across)) : across*2;
    canvas.width = across; canvas.height = along;
    var ctx = canvas.getContext('2d');
    if (!ctx) return along/across;
    ctx.fillStyle = toCss(color);
    ctx.fillRect(0, 0, across, along);
    if (image) {
      ctx.save();
      ctx.translate(across, 0);
      ctx.rotate(Math.PI/2);
      ctx.drawImage(image, 0, 0, along, across);
      ctx.restore();
      return along/across;
    }
    var ink = luminance(color) > 0.5 ? [0,0,0] : [1,1,1];
    ctx.fillStyle = toCss(ink, 0.05);
    for (var y = 0; y < along; y += 4) ctx.fillRect(0, y, across, 1);
    ctx.fillStyle = toCss(ink, 0.2);
    for (y = 0; y < along; y += 14) {
      ctx.fillRect(across*0.075, y, 2, 8);
      ctx.fillRect(across*0.925-2, y, 2, 8);
    }
    return along/across;
  }

  /* ─── physics simulation ─────────────────────────────────────────────── */
  function createSimulation() {
    var v = function() { return Array.from({ length: JOINTS+1 }, function() { return new THREE.Vector3(); }); };
    return {
      nodes: v(), previous: v(), velocities: v(),
      lengths: new Float64Array(JOINTS),
      impulses: new Float64Array(JOINTS),
      rest: 1,
      anchor: new THREE.Vector3(),
      body: {
        position: new THREE.Vector3(), previous: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(), previousQuaternion: new THREE.Quaternion(),
        angular: new THREE.Vector3(), mass: 1,
        inverseInertia: new THREE.Vector3(1,1,1),
        hang: new THREE.Vector3()
      },
      grab: null, turn: 0, twist: 0, twistRaw: 0, calm: 0
    };
  }

  // Per-instance scratch space to avoid sharing issues with multiple instances
  function makeScratch() {
    return {
      a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(),
      d: new THREE.Vector3(), e: new THREE.Vector3(), f: new THREE.Vector3(),
      g: new THREE.Vector3(), pin: new THREE.Vector3(),
      q: new THREE.Quaternion(), r: new THREE.Quaternion()
    };
  }

  function applyInverseInertia(body, vector, out, sc) {
    sc.r.copy(body.quaternion).invert();
    out.copy(vector).applyQuaternion(sc.r);
    out.set(out.x*body.inverseInertia.x, out.y*body.inverseInertia.y, out.z*body.inverseInertia.z);
    return out.applyQuaternion(body.quaternion);
  }

  function rotateBody(q, w) {
    var qx=q.x, qy=q.y, qz=q.z, qw=q.w;
    q.x += 0.5*(w.x*qw + w.y*qz - w.z*qy);
    q.y += 0.5*(w.y*qw + w.z*qx - w.x*qz);
    q.z += 0.5*(w.z*qw + w.x*qy - w.y*qx);
    q.w += 0.5*(-w.x*qx - w.y*qy - w.z*qz);
    q.normalize();
  }

  function bodyWeight(body, r, normal, sc) {
    var rn = sc.c.crossVectors(r, normal);
    return 1/body.mass + rn.dot(applyInverseInertia(body, rn, sc.d, sc));
  }

  function pushBody(body, r, impulse, sc) {
    body.position.addScaledVector(impulse, 1/body.mass);
    rotateBody(body.quaternion, applyInverseInertia(body, sc.e.crossVectors(r, impulse), sc.f, sc));
  }

  function solveSegment(sim, i, h, physics, sc) {
    var nodes = sim.nodes, body = sim.body;
    var a = nodes[i], wa = i === 0 ? 0 : NODE_WEIGHT;
    var last = i === JOINTS-1;
    var r = sc.g, b = nodes[i+1];
    if (last) { r.copy(body.hang).applyQuaternion(body.quaternion); b = sc.b.copy(body.position).add(r); }
    var delta = sc.a.subVectors(b, a);
    var len = delta.length(), stretch = len - sim.rest;
    if (stretch <= 0 || len < 1e-9) return;
    var normal = delta.divideScalar(len);
    var wb = last ? bodyWeight(body, r, normal, sc) : NODE_WEIGHT;
    var rate = (len - sim.lengths[i]) / h;
    var tension = physics.hold * Math.tanh((physics.stiffness * stretch) / physics.hold) + physics.spring * stretch + physics.bandDamping * Math.max(0, rate);
    var room = tension * h * h - sim.impulses[i];
    if (room <= 0) return;
    var lambda = Math.min(stretch / (wa+wb), room);
    sim.impulses[i] += lambda;
    if (wa) a.addScaledVector(normal, lambda*wa);
    if (last) pushBody(body, r, normal.multiplyScalar(-lambda), sc);
    else b.addScaledVector(normal, -lambda*wb);
  }

  function solvePin(body, grab, target, sc) {
    var r = sc.g.copy(grab.local).applyQuaternion(body.quaternion);
    var delta = sc.a.copy(target).sub(body.position).sub(r);
    var dist = delta.length();
    if (dist < 1e-9) return;
    var normal = delta.divideScalar(dist);
    var lambda = dist / bodyWeight(body, r, normal, sc);
    pushBody(body, r, normal.multiplyScalar(lambda), sc);
  }

  function placeHanging(sim, layout, intro) {
    var nodes = sim.nodes, prev = sim.previous, vel = sim.velocities, body = sim.body;
    nodes[0].copy(sim.anchor);
    for (var i = 1; i <= JOINTS; i++) {
      nodes[i].copy(nodes[i-1]);
      if (intro) nodes[i].x += sim.rest; else nodes[i].y -= sim.rest;
    }
    body.quaternion.identity();
    if (intro) body.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
    body.hang.set(0, layout.hangY, 0);
    var offset = new THREE.Vector3().copy(body.hang).applyQuaternion(body.quaternion);
    body.position.copy(nodes[JOINTS]).sub(offset);
    body.previous.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.velocity.set(0,0,0); body.angular.set(0,0,0);
    for (i = 0; i <= JOINTS; i++) { prev[i].copy(nodes[i]); vel[i].set(0,0,0); }
    sim.lengths.fill(sim.rest);
    sim.turn = 0; sim.twist = 0; sim.twistRaw = 0; sim.calm = 0;
  }

  function configureSimulation(sim, layout, length) {
    sim.rest = length / JOINTS;
    var w = layout.width, h = layout.height, t = THICKNESS + BEVEL*2;
    sim.body.mass = 1;
    sim.body.inverseInertia.set(12/(h*h+t*t), 12/(w*w+t*t), 12/(w*w+h*h));
    sim.body.hang.set(0, layout.hangY, 0);
  }

  function stepSimulation(sim, dt, physics, time, sc) {
    var steps = Math.max(1, Math.ceil(dt/MAX_STEP - 1e-6));
    var h = dt / steps;
    var nodes = sim.nodes, prev = sim.previous, vel = sim.velocities, body = sim.body;
    var windX = physics.breeze * (Math.sin(time*0.53)*0.7 + Math.sin(time*1.31+1.7)*0.3) * 3;
    var windZ = physics.breeze * Math.sin(time*0.37+0.6) * 2;
    var grab = sim.grab, pin = sc.pin;
    var nodeDrag = Math.exp(-physics.nodeDrag*h);
    var linearDrag = Math.exp(-physics.linearDrag*h);
    var angularDrag = Math.exp(-physics.angularDrag*h);

    for (var s = 0; s < steps; s++) {
      for (var i = 1; i < JOINTS; i++) {
        var v = vel[i];
        v.y -= physics.gravity*h; v.x += windX*h; v.z += windZ*h;
        prev[i].copy(nodes[i]);
        nodes[i].addScaledVector(v, h);
      }
      body.previous.copy(body.position);
      body.previousQuaternion.copy(body.quaternion);
      var q = body.quaternion;
      if (grab) {
        var turn = sc.q.copy(grab.rotation).multiply(sc.r.copy(q).invert());
        if (turn.w < 0) turn.set(-turn.x,-turn.y,-turn.z,-turn.w);
        var torque = sc.a.set(turn.x,turn.y,turn.z).multiplyScalar(2*physics.grip);
        torque.addScaledVector(body.angular, -physics.gripDamping);
        body.angular.addScaledVector(applyInverseInertia(body, torque, sc.b, sc), h);
      }
      var up = sc.a.set(0,1,0).applyQuaternion(q);
      var front = sc.b.set(-up.x*up.z, -up.y*up.z, 1-up.z*up.z);
      if (front.lengthSq() > 1e-3) {
        var facing = sc.d.set(0,0,1).applyQuaternion(q);
        var raw = Math.atan2(sc.e.crossVectors(front, facing).dot(up), front.dot(facing));
        var turned = raw - sim.twistRaw;
        if (turned > Math.PI) turned -= Math.PI*2; else if (turned < -Math.PI) turned += Math.PI*2;
        sim.twist += turned; sim.twistRaw = raw;
      }
      if (!grab) {
        var spin = body.angular.dot(up);
        body.angular.addScaledVector(up, (physics.twist*(sim.turn-sim.twist) - physics.twistDamping*spin)*h);
      }
      body.velocity.y -= physics.gravity*h;
      body.velocity.x += windX*0.35*h; body.velocity.z += windZ*0.35*h;
      body.position.addScaledVector(body.velocity, h);
      rotateBody(body.quaternion, sc.f.copy(body.angular).multiplyScalar(h));
      sim.impulses.fill(0);
      if (grab) pin.lerpVectors(grab.from, grab.target, (s+1)/steps);
      for (var iter = 0; iter < ITERATIONS; iter++) {
        for (i = 0; i < JOINTS; i++) solveSegment(sim, i, h, physics, sc);
        if (grab) solvePin(body, grab, pin, sc);
      }
      for (i = 1; i < JOINTS; i++) {
        var v2 = vel[i].subVectors(nodes[i], prev[i]).divideScalar(h).multiplyScalar(nodeDrag);
        v2.multiplyScalar(1 / (1 + physics.nodeAir*v2.length()*h));
      }
      body.velocity.subVectors(body.position, body.previous).divideScalar(h);
      var dq = sc.q.copy(body.previousQuaternion).invert().premultiply(body.quaternion);
      body.angular.set(dq.x,dq.y,dq.z).multiplyScalar((2/h)*(dq.w < 0 ? -1 : 1));
      var n2 = sc.a.set(0,0,1).applyQuaternion(body.quaternion);
      var across2 = body.velocity.dot(n2);
      var along2 = sc.b.copy(body.velocity).addScaledVector(n2, -across2);
      along2.multiplyScalar(1 / (1+physics.air*along2.length()*h));
      body.velocity.copy(along2).addScaledVector(n2, across2/(1+physics.broadside*Math.abs(across2)*h)).multiplyScalar(linearDrag);
      body.angular.multiplyScalar(angularDrag / (1+physics.spinAir*body.angular.length()*h));
      if (body.velocity.lengthSq() > 3600) body.velocity.setLength(60);
      if (body.angular.lengthSq() > 1600) body.angular.setLength(40);
      nodes[JOINTS].copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
      for (i = 0; i < JOINTS; i++) sim.lengths[i] = nodes[i].distanceTo(nodes[i+1]);
    }
    if (grab) grab.from.copy(grab.target);
    var energy = body.velocity.lengthSq() + body.angular.lengthSq()*0.3;
    for (i = 1; i < JOINTS; i++) energy += vel[i].lengthSq()*0.05;
    sim.calm = energy < 2e-4 ? sim.calm + dt : 0;
  }

  /* ─── Lanyard class ──────────────────────────────────────────────────── */
  function Lanyard(container, options) {
    this.container = container;
    this.settings = Object.assign({
      frontImage   : undefined,
      backImage    : undefined,
      imageFit     : 'cover',
      cardColor    : '#ffffff',
      orientation  : 'portrait',
      finish       : 'glossy',
      cornerRadius : 0.3,
      size         : 0.6,
      anchor       : 'center',
      strapLength  : 0.5,
      strapImage   : undefined,
      strapColor   : '#111111',
      strapWidth   : 0.65,
      metal        : 'silver',
      gravity      : 1,
      damping      : 0.5,
      elasticity   : 0.5,
      breeze       : 0.5,
      interactive  : true,
      intro        : true
    }, options || {});
    this._apply   = null;
    this._cleanup = null;
    this._init();
  }

  Lanyard.prototype._init = function () {
    var self      = this;
    var container = this.container;
    var sc        = makeScratch();

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch(e) { return; }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = (THREE.NeutralToneMapping !== undefined) ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    var canvas = renderer.domElement;
    canvas.className = 'lanyard-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    var anisotropy    = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    var scene         = new THREE.Scene();
    var environment   = buildEnvironment(renderer);
    scene.environment = environment.texture;
    var camera    = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    var keyLight  = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(-2.5, 4, 6);
    var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(3, -1, 4);
    scene.add(keyLight, fillLight);

    var images      = { front: null, back: null, strap: null };
    var frontCanvas = document.createElement('canvas');
    var backCanvas  = document.createElement('canvas');
    var strapCanvas = document.createElement('canvas');
    var frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
    var backTexture  = makeCanvasTexture(backCanvas,  anisotropy);
    var strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
    strapTexture.wrapS = THREE.ClampToEdgeWrapping;
    strapTexture.wrapT = THREE.RepeatWrapping;
    var grain = buildGrainTexture();
    var weave = buildWeaveTexture();

    var foilUniforms = {
      foilStrength: { value: 0 },
      foilAspect:   { value: 1.4 },
      foilKey:      { value: new THREE.Vector3() },
      foilFill:     { value: new THREE.Vector3() },
      foilTop:      { value: new THREE.Vector3() }
    };
    function injectFoil(shader) {
      Object.assign(shader.uniforms, foilUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>',         '#include <common>\n' + FOIL_VERT_HEAD)
        .replace('#include <project_vertex>', '#include <project_vertex>\n' + FOIL_VERT_BODY);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>',          '#include <common>\n' + FOIL_FRAG_HEAD)
        .replace('#include <opaque_fragment>', FOIL_FRAG_BODY + '\n#include <opaque_fragment>');
    }

    var frontMaterial = new THREE.MeshPhysicalMaterial({ map: frontTexture, normalMap: grain, normalScale: new THREE.Vector2(0.06,0.06) });
    var backMaterial  = new THREE.MeshPhysicalMaterial({ map: backTexture,  normalMap: grain, normalScale: new THREE.Vector2(0.06,0.06) });
    frontMaterial.onBeforeCompile = injectFoil;
    backMaterial.onBeforeCompile  = injectFoil;
    var edgeMaterial  = new THREE.MeshPhysicalMaterial();
    var metalMaterial = new THREE.MeshStandardMaterial({ metalness: 1 });
    var bandMaterial  = new THREE.MeshPhysicalMaterial({ map: strapTexture, normalMap: weave, normalScale: new THREE.Vector2(0.7,0.7), roughness: 0.68, sheen: 1, sheenRoughness: 0.42, sheenColor: new THREE.Color(0.32,0.32,0.34), side: THREE.DoubleSide });

    var cardGroup = new THREE.Group();
    var bodyMesh  = new THREE.Mesh(undefined, edgeMaterial);
    var frontMesh = new THREE.Mesh(undefined, frontMaterial);
    var backMesh  = new THREE.Mesh(undefined, backMaterial);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 18, 72), metalMaterial);
    ring.rotation.y = Math.PI/2 - 0.7;
    cardGroup.add(bodyMesh, frontMesh, backMesh, ring);
    scene.add(cardGroup);

    var bandGeometry = buildBandGeometry(SAMPLES);
    var band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    var clampGroup = new THREE.Group();
    var clampMesh  = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY/2 - 0.004;
    var eyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.0105, 14, 40), metalMaterial);
    clampGroup.add(clampMesh, eyelet);
    scene.add(clampGroup);

    var sim = createSimulation();
    var controls = [], mouth = new THREE.Vector3(), tuck = new THREE.Vector3();
    var curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');
    var view = { width: 1, height: 1 };
    var layout = cardLayout('portrait', 0.3);
    var applied = {}, strapScale = STRAP_WIDTH, tileRatio = 2;
    var raf = 0, last = performance.now(), time = 0;
    var visible = true, alive = true, placed = false, hovering = false, press = null, imageToken = 0;
    var reducedMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    function getS() { return self.settings; }

    function paintFaces() {
      var s = getS();
      var color = parseColor(s.cardColor, [1,1,1]);
      var fw = FACE_WIDTH, fh = Math.round((FACE_WIDTH * layout.height) / layout.width);
      if (frontCanvas.width !== fw || frontCanvas.height !== fh) {
        frontCanvas.width = fw; frontCanvas.height = fh;
        backCanvas.width  = fw; backCanvas.height  = fh;
        frontTexture.dispose(); backTexture.dispose();
      }
      paintFaceCanvas(frontCanvas, images.front, color, s.imageFit);
      paintFaceCanvas(backCanvas,  images.back || images.front, color, s.imageFit);
      frontTexture.needsUpdate = true; backTexture.needsUpdate = true;
      start();
    }

    function repaintStrap() {
      var s = getS();
      tileRatio = paintStrapCanvas(strapCanvas, images.strap, parseColor(s.strapColor, [0.07,0.07,0.07]));
      weave.repeat.set(2, 2*tileRatio);
      strapTexture.dispose(); strapTexture.needsUpdate = true;
      start();
    }

    function frameView() {
      var s = getS();
      var aspect = view.width / view.height;
      var viewHeight = layout.height / clamp(s.size, 0.15, 0.9);
      var minW = layout.width / 0.72;
      if (viewHeight * aspect < minW) viewHeight = minW / aspect;
      var viewWidth = viewHeight * aspect;
      camera.aspect = aspect;
      camera.position.set(0, 0, viewHeight/2 / Math.tan(FOV*Math.PI/360));
      camera.lookAt(0,0,0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      foilUniforms.foilKey.value.set(-2.5,4,6).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilFill.value.set(3,-1,4).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilTop.value.set(0.5,4.5,8).normalize().transformDirection(camera.matrixWorldInverse);
      var anchorX = ((ANCHORS[s.anchor] != null ? ANCHORS[s.anchor] : 0.5) - 0.5) * viewWidth;
      var anchorY = viewHeight/2 + 0.2;
      var cardTop = viewHeight/2 - viewHeight * mix(0.12, 0.42, clamp(s.strapLength, 0, 1));
      var hangTop = cardTop + (layout.hangY - layout.height/2);
      sim.anchor.set(anchorX, anchorY, 0);
      configureSimulation(sim, layout, anchorY - hangTop);
      sim.nodes[0].copy(sim.anchor);
      sim.previous[0].copy(sim.anchor);
    }

    function apply() {
      var s = getS();
      var layoutKey = s.orientation + '|' + s.cornerRadius;
      if (layoutKey !== applied.layoutKey) {
        layout = cardLayout(s.orientation, s.cornerRadius);
        var geo = buildCardGeometry(layout);
        if (bodyMesh.geometry)  bodyMesh.geometry.dispose();
        if (frontMesh.geometry) frontMesh.geometry.dispose();
        if (backMesh.geometry)  backMesh.geometry.dispose();
        bodyMesh.geometry  = geo.body;
        frontMesh.geometry = geo.face;
        backMesh.geometry  = geo.face.clone();
        frontMesh.position.z =  THICKNESS/2 + BEVEL + 0.0006;
        backMesh.rotation.y  = Math.PI;
        backMesh.position.z  = -(THICKNESS/2 + BEVEL + 0.0006);
        ring.position.set(0, layout.ringY, 0);
        applied.framingKey = '';
      }
      var framingKey = layoutKey+'|'+s.size+'|'+s.anchor+'|'+s.strapLength+'|'+view.width+'|'+view.height;
      if (framingKey !== applied.framingKey) {
        frameView();
        if (!placed) {
          placeHanging(sim, layout, s.intro && !reducedMotion);
          placed = true;
        } else if (layoutKey !== applied.layoutKey) {
          placeHanging(sim, layout, false);
        }
      }
      var imageKey = s.frontImage + '|' + s.backImage + '|' + s.strapImage;
      if (imageKey !== applied.imageKey) {
        var token = ++imageToken;
        Promise.all([loadImage(s.frontImage), loadImage(s.backImage), loadImage(s.strapImage)])
          .then(function(loaded) {
            if (!alive || token !== imageToken) return;
            images.front = loaded[0]; images.back = loaded[1]; images.strap = loaded[2];
            paintFaces(); repaintStrap();
          });
      }
      var faceKey = layoutKey+'|'+s.cardColor+'|'+s.imageFit;
      if (faceKey !== applied.faceKey) paintFaces();
      if (s.strapColor !== applied.strapColor) repaintStrap();

      var fin = FINISHES[s.finish] || FINISHES.glossy;
      var card = parseColor(s.cardColor, [1,1,1]);
      [frontMaterial, backMaterial].forEach(function(mat) {
        mat.roughness = fin.roughness; mat.metalness = fin.metalness;
        mat.clearcoat = fin.clearcoat; mat.clearcoatRoughness = fin.clearcoatRoughness;
        mat.anisotropy = fin.anisotropy;
      });
      foilUniforms.foilStrength.value = fin.foil;
      foilUniforms.foilAspect.value = layout.height / layout.width;
      edgeMaterial.color.setRGB(card[0]*0.92, card[1]*0.92, card[2]*0.92, THREE.SRGBColorSpace);
      edgeMaterial.roughness = Math.min(fin.roughness, 0.35);
      edgeMaterial.metalness = fin.metalness;
      edgeMaterial.clearcoat = 1; edgeMaterial.clearcoatRoughness = 0.08;
      var metalLook = METALS[s.metal] || METALS.silver;
      metalMaterial.color.set(metalLook.color);
      metalMaterial.roughness = metalLook.roughness;
      strapScale = STRAP_WIDTH * clamp(s.strapWidth, 0.4, 2);
      if (strapScale !== applied.strapScale) {
        if (clampMesh.geometry) clampMesh.geometry.dispose();
        clampMesh.geometry = buildClampGeometry(strapScale);
      }
      canvas.style.touchAction = s.interactive ? 'pan-y' : 'auto';
      applied = { layoutKey: layoutKey, framingKey: framingKey, imageKey: imageKey, faceKey: faceKey, strapColor: s.strapColor, strapScale: strapScale };
      start();
    }

    var pts   = Array.from({ length: SAMPLES }, function() { return new THREE.Vector3(); });
    var sides = Array.from({ length: SAMPLES }, function() { return new THREE.Vector3(); });
    var bends = BAND_BEND.map(function(a) { return [Math.cos(a), Math.sin(a)]; });
    var work = { tangent: new THREE.Vector3(), toCamera: new THREE.Vector3(), basis: new THREE.Matrix4(), up: new THREE.Vector3(), across: new THREE.Vector3(), facing: new THREE.Vector3(), end: new THREE.Vector3() };

    function updateBand() {
      var hang = sim.nodes[JOINTS];
      var reach = EYELET_RADIUS + CLAMP_BODY + 0.05;
      var guide = JOINTS - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach*1.1) guide--;
      var axis = work.up.subVectors(sim.nodes[guide], hang);
      if (axis.lengthSq() < 1e-8) axis.set(0,1,0).applyQuaternion(sim.body.quaternion);
      axis.normalize();
      mouth.copy(hang).addScaledVector(axis, reach);
      tuck.copy(hang).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY*0.35);
      controls.length = 0;
      for (var i = 0; i <= guide; i++) controls.push(sim.nodes[i]);
      controls.push(mouth, tuck);
      curve.updateArcLengths();
      for (i = 0; i < SAMPLES; i++) curve.getPointAt(i/(SAMPLES-1), pts[i]);
      var len = curve.getLength();
      var held = 1 - mouth.distanceTo(tuck) / Math.max(len, 0.001);
      var pos = bandGeometry.getAttribute('position');
      var nor = bandGeometry.getAttribute('normal');
      var uv  = bandGeometry.getAttribute('uv');
      var cols = BAND_COLUMNS.length;
      var restLen = sim.rest * JOINTS;
      var repeats = restLen / (strapScale * tileRatio);
      var width   = strapScale / Math.pow(Math.max(1, len/Math.max(restLen,0.001)), 0.35);
      var tangent = work.tangent, toCamera = work.toCamera, across = work.across, facing = work.facing;
      for (i = 0; i < SAMPLES; i++) {
        tangent.subVectors(pts[Math.min(SAMPLES-1,i+1)], pts[Math.max(0,i-1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0,-1,0);
        tangent.normalize();
        toCamera.subVectors(camera.position, pts[i]).normalize();
        var side = sides[i].crossVectors(toCamera, tangent);
        if (side.lengthSq() < 1e-10) side.copy(i > 0 ? sides[i-1] : sc.a.set(1,0,0));
        side.normalize();
        if (i > 0 && side.dot(sides[i-1]) < 0) side.negate();
        var angle = -sim.twist * Math.pow(Math.min(1, i/(SAMPLES-1)/held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);
        var p = pts[i], vv = (1 - i/(SAMPLES-1)) * repeats;
        for (var c = 0; c < cols; c++) {
          var k = i*cols + c;
          var offset = (BAND_COLUMNS[c] - 0.5) * width;
          pos.setXYZ(k, p.x+across.x*offset, p.y+across.y*offset, p.z+across.z*offset);
          nor.setXYZ(k, facing.x*bends[c][0]+across.x*bends[c][1], facing.y*bends[c][0]+across.y*bends[c][1], facing.z*bends[c][0]+across.z*bends[c][1]);
          uv.setXY(k, BAND_COLUMNS[c], vv);
        }
      }
      work.end.copy(across);
      pos.needsUpdate = true; nor.needsUpdate = true; uv.needsUpdate = true;
      across.copy(work.end).addScaledVector(axis, -work.end.dot(axis)).normalize();
      facing.crossVectors(across, axis).normalize();
      work.basis.makeBasis(across, axis, facing);
      clampGroup.quaternion.setFromRotationMatrix(work.basis);
      clampGroup.position.copy(hang);
    }

    function render() {
      cardGroup.position.copy(sim.body.position);
      cardGroup.quaternion.copy(sim.body.quaternion);
      updateBand();
      renderer.render(scene, camera);
    }

    function getPhysics() {
      var s = getS();
      var gravity = 40 * clamp(s.gravity, 0, 3);
      var weight  = Math.max(gravity, 20);
      var springy = clamp(s.elasticity, 0, 1);
      var settle  = clamp(s.damping, 0, 1);
      return {
        gravity: gravity,
        hold:        weight * mix(2.2, 5.5, springy),
        stiffness:   weight * 10 * JOINTS,
        spring:      weight * mix(0.1, 0.4, springy) * JOINTS,
        bandDamping: weight * mix(0.3, 0.08, springy) * JOINTS,
        linearDrag:  0.25 * Math.pow(16, settle),
        angularDrag: 0.5  * Math.pow(12, settle),
        air: 0.15, broadside: 0.5, spinAir: 0.03,
        nodeDrag: 2, nodeAir: 0.2,
        twist: 30, twistDamping: 3, grip: 40, gripDamping: 6,
        breeze: reducedMotion ? 0 : clamp(s.breeze, 0, 1)
      };
    }

    function tick(now) {
      raf = 0;
      if (!alive) return;
      var dt = Math.min(1/30, Math.max(1/240, (now - last)/1000));
      last = now; time += dt;
      var phys = getPhysics();
      stepSimulation(sim, dt, phys, time, sc);
      var body = sim.body;
      if (!isFinite(body.position.x + body.position.y + body.position.z + body.quaternion.w)) {
        sim.grab = null;
        placeHanging(sim, layout, false);
      }
      render();
      var resting = sim.calm > 1.2 && !sim.grab && phys.breeze === 0;
      if (visible && !resting) raf = requestAnimationFrame(tick);
    }

    function start() {
      if (raf || !visible || !alive) return;
      sim.calm = 0; last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    /* ─── interaction ─────────────────────────────────────── */
    var raycaster = new THREE.Raycaster();
    var pointer   = new THREE.Vector2();

    function toPointer(event) {
      var rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX-rect.left)/rect.width)*2-1, -((event.clientY-rect.top)/rect.height)*2+1);
      raycaster.setFromCamera(pointer, camera);
    }

    function pickCard() {
      cardGroup.updateMatrixWorld();
      var hits = raycaster.intersectObjects([bodyMesh, frontMesh, backMesh], false);
      return hits[0] || null;
    }

    function setCursor(v) { if (canvas.style.cursor !== v) canvas.style.cursor = v; }

    function flip(point) {
      var body = sim.body;
      var up = sc.a.set(0,1,0).applyQuaternion(body.quaternion);
      var dir = sim.turn > 0 ? -1 : 1;
      if (sim.turn === 0) {
        var away = sc.c.subVectors(point, camera.position).normalize();
        dir = sc.b.subVectors(point, body.position).cross(away).dot(up) < 0 ? -1 : 1;
      }
      sim.turn = sim.turn === 0 ? Math.PI * dir : 0;
      body.angular.addScaledVector(up, FLIP_SPIN * dir);
    }

    function onPointerDown(e) {
      if (!getS().interactive || e.button > 0) return;
      toPointer(e);
      var hit = pickCard();
      if (!hit) return;
      sim.grab = { local: hit.point.clone().sub(sim.body.position).applyQuaternion(sim.body.quaternion.clone().invert()), rotation: sim.body.quaternion.clone(), reach: hit.distance, from: hit.point.clone(), target: hit.point.clone() };
      press = { x: e.clientX, y: e.clientY, time: performance.now(), point: hit.point.clone() };
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
      setCursor('grabbing'); e.preventDefault(); start();
    }
    function onPointerMove(e) {
      if (!getS().interactive) return;
      toPointer(e);
      if (sim.grab) {
        if (press && Math.hypot(e.clientX-press.x, e.clientY-press.y) > 6) press = null;
        raycaster.ray.at(sim.grab.reach, sim.grab.target);
        start(); return;
      }
      if (e.pointerType === 'touch') return;
      hovering = !!pickCard();
      setCursor(hovering ? 'grab' : '');
    }
    function onPointerUp(e) {
      if (!sim.grab) return;
      sim.grab = null;
      if (press && e.type === 'pointerup' && performance.now()-press.time < 450) flip(press.point);
      press = null;
      if (canvas.releasePointerCapture) canvas.releasePointerCapture(e.pointerId);
      setCursor(hovering && e.pointerType !== 'touch' ? 'grab' : '');
      start();
    }
    function onTouchStart(e) {
      if (!getS().interactive || e.touches.length !== 1) return;
      toPointer(e.touches[0]);
      if (pickCard()) e.preventDefault();
    }

    canvas.addEventListener('pointerdown',        onPointerDown);
    canvas.addEventListener('pointermove',        onPointerMove);
    canvas.addEventListener('pointerup',          onPointerUp);
    canvas.addEventListener('pointercancel',      onPointerUp);
    canvas.addEventListener('lostpointercapture', onPointerUp);
    canvas.addEventListener('touchstart',         onTouchStart, { passive: false });

    /* ─── resize + visibility ────────────────────────────── */
    function resize() {
      view.width  = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.width, view.height, false);
      apply(); render();
    }

    var ro = new ResizeObserver(resize);
    ro.observe(container);

    var io = new IntersectionObserver(function(entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    });
    io.observe(container);

    function onVisibility() { if (!document.hidden) start(); }
    document.addEventListener('visibilitychange', onVisibility);

    /* ─── expose to public API ───────────────────────────── */
    self._apply = apply;
    self._cleanup = function() {
      alive = false;
      cancelAnimationFrame(raf);
      self._apply = null;
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown',        onPointerDown);
      canvas.removeEventListener('pointermove',        onPointerMove);
      canvas.removeEventListener('pointerup',          onPointerUp);
      canvas.removeEventListener('pointercancel',      onPointerUp);
      canvas.removeEventListener('lostpointercapture', onPointerUp);
      canvas.removeEventListener('touchstart',         onTouchStart);
      [bodyMesh, frontMesh, backMesh, ring, clampMesh, eyelet, band]
        .forEach(function(m) { if (m.geometry) m.geometry.dispose(); });
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial]
        .forEach(function(m) { m.dispose(); });
      [frontTexture, backTexture, strapTexture, grain, weave]
        .forEach(function(t) { t.dispose(); });
      environment.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };

    resize();
  };

  /** Live-update any settings and re-apply immediately. */
  Lanyard.prototype.update = function(options) {
    Object.assign(this.settings, options);
    if (this._apply) this._apply();
  };

  /** Remove the WebGL canvas and free all GPU / memory resources. */
  Lanyard.prototype.destroy = function() {
    if (this._cleanup) this._cleanup();
    this._cleanup = null;
  };

  /* ─────────────────────────────────────────────────────────────────────
   * Lanyard.createBusinessCard(options) → data URL
   * Generates a card face image that matches the site's HUD design.
   * Call with no args for the default; tweak for your taste.
   * ─────────────────────────────────────────────────────────────────────*/
  Lanyard.createBusinessCard = function(options) {
    var opts = Object.assign({
      name       : 'Riccardo Raineri',
      title      : 'Videomaker · Drone · Editor',
      subtitle   : 'Fotografo · Bologna, Italia',
      accent     : '#ff3b30',   /* --tally */
      bg         : '#0a0b0d',   /* --carbon */
      textColor  : '#edeae2',   /* --bone   */
      dimColor   : '#717a86',   /* --steel  */
      side       : 'front',     /* 'front' | 'back' */
      width      : 1024,
      height     : 1440         /* 1024 × 1.6 × (2.25/1.6) ≈ 1440 */
    }, options || {});

    var cv = document.createElement('canvas');
    cv.width = opts.width; cv.height = opts.height;
    var ctx = cv.getContext('2d');
    var W = opts.width, H = opts.height;

    /* background */
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, W, H);

    if (opts.side === 'front') {
      /* subtle dot grid */
      ctx.fillStyle = 'rgba(237,234,226,0.045)';
      for (var gx = 40; gx < W; gx += 48) for (var gy = 40; gy < H; gy += 48) {
        ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI*2); ctx.fill();
      }

      /* corner brackets (mirino) */
      var m = 42, arm = 56, lw = 2.5;
      ctx.strokeStyle = 'rgba(237,234,226,0.35)';
      ctx.lineWidth = lw;
      [
        [m,m, 1,1], [W-m,m, -1,1], [m,H-m, 1,-1], [W-m,H-m, -1,-1]
      ].forEach(function(b) {
        ctx.beginPath();
        ctx.moveTo(b[0]+b[2]*arm, b[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0], b[1]+b[3]*arm);
        ctx.stroke();
      });

      /* REC dot + label */
      ctx.fillStyle = opts.accent;
      ctx.beginPath(); ctx.arc(m + 18, m + 38, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(237,234,226,0.4)';
      ctx.font = '500 22px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText('REC', m + 34, m + 38);

      /* timecode strip */
      ctx.fillStyle = 'rgba(237,234,226,0.06)';
      ctx.fillRect(0, H - 100, W, 1);
      ctx.fillStyle = 'rgba(237,234,226,0.06)';
      ctx.fillRect(0, H - 100, W, 100);
      ctx.fillStyle = opts.dimColor;
      ctx.font = '400 20px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText('00:00:00:00 — 24fps', m, H - 50);
      ctx.textAlign = 'right';
      ctx.fillText('2.39:1 — AERIAL/GROUND/EDIT', W - m, H - 50);
      ctx.textAlign = 'left';

      /* name */
      ctx.fillStyle = opts.textColor;
      ctx.font = '700 120px "Big Shoulders Display", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.letterSpacing = '2px';
      ctx.fillText(opts.name.split(' ')[0].toUpperCase(), m, H*0.44);

      /* surname on second line */
      ctx.fillText((opts.name.split(' ')[1] || '').toUpperCase(), m, H*0.44 + 118);

      /* title */
      ctx.fillStyle = opts.accent;
      ctx.font = '500 28px "IBM Plex Mono", monospace';
      ctx.fillText('● ' + opts.title, m, H*0.44 + 162);

      /* subtitle */
      ctx.fillStyle = opts.dimColor;
      ctx.font = '400 24px "IBM Plex Mono", monospace';
      ctx.fillText(opts.subtitle, m, H*0.44 + 200);

      /* thin horizontal rule */
      ctx.fillStyle = 'rgba(237,234,226,0.12)';
      ctx.fillRect(m, H*0.44 + 222, W - m*2, 1);

    } else {
      /* ── BACK FACE ─────────────────────────────────────────── */
      /* large watermark initial */
      ctx.fillStyle = 'rgba(237,234,226,0.04)';
      ctx.font = '800 520px "Big Shoulders Display", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText('RR', W/2, H/2);
      ctx.textAlign = 'left';

      /* corner brackets */
      var m2 = 42, arm2 = 56;
      ctx.strokeStyle = 'rgba(237,234,226,0.25)'; ctx.lineWidth = 2.5;
      [[m2,m2,1,1],[W-m2,m2,-1,1],[m2,H-m2,1,-1],[W-m2,H-m2,-1,-1]].forEach(function(b) {
        ctx.beginPath();
        ctx.moveTo(b[0]+b[2]*arm2,b[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(b[0],b[1]+b[3]*arm2);
        ctx.stroke();
      });

      /* social handles */
      var lines = ['instagram.com/riccardo_raineri', 'behance.net/riccardoraineri', 'youtube.com/@riccardoraineri'];
      ctx.font = '400 22px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      lines.forEach(function(l, i) {
        ctx.fillStyle = i === 0 ? opts.textColor : opts.dimColor;
        ctx.fillText(l, W/2, H/2 + 120 + i*44);
      });
      ctx.textAlign = 'left';

      /* tally line at top */
      ctx.fillStyle = opts.accent;
      ctx.fillRect(m2, m2 + 38, 48, 3);
    }

    return cv.toDataURL('image/png');
  };

  global.Lanyard = Lanyard;

})(window);
