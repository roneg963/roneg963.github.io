// Moved from docs/design/reference/reference-v-e.html. Changes against the reference, and only these:
//  - three comes from npm (pinned to 0.149.0, the reference's version) instead of three.min.js;
//  - the cube labels, group names and hint lines come from the content file (JSON in the page);
//  - the animation loop runs only while a scene is on screen (IntersectionObserver);
//  - with prefers-reduced-motion the helix cubes do not spin frame by frame (Codex review RN-040), and the mouse does not rotate scenes;
//  - on portrait screens (aspect < 0.85) the three popped-out cube pieces are stacked vertically instead of side by side (RN-040, Ron);
//  - each scene is built only when its canvas comes within 600px of the screen (all at once in ?freeze=1, in the original order);
//  - for the English (ltr) page, mirrored (RN-030 part F): the three popped-out pieces are laid out left to right,
//    and the small sticker text uses the page direction, so labels with "·" or "&" are not reordered. Hebrew unchanged.
import { Vector3, Color, Quaternion, MeshStandardMaterial, Group, sRGBEncoding, Mesh, BoxGeometry, WebGLRenderer, Scene, PointsMaterial, Points, PointLight, PerspectiveCamera, LineSegments, LineBasicMaterial, HemisphereLight, Fog, Euler, EdgesGeometry, DirectionalLight, CanvasTexture, BufferGeometry, BufferAttribute } from 'three';
// Only what the scenes use is imported (same three 0.149.0); the code below keeps the reference's THREE.* names.
var THREE = { Vector3, Color, Quaternion, MeshStandardMaterial, Group, sRGBEncoding, Mesh, BoxGeometry, WebGLRenderer, Scene, PointsMaterial, Points, PointLight, PerspectiveCamera, LineSegments, LineBasicMaterial, HemisphereLight, Fog, Euler, EdgesGeometry, DirectionalLight, CanvasTexture, BufferGeometry, BufferAttribute };
window.THREE = THREE;
var DATA = JSON.parse(document.getElementById('cube-data').textContent);


class Component {
  constructor() { this.state = {}; this.props = {}; }
  setState(o) { Object.assign(this.state, o); this.applyVals(); }
  componentDidMount() {
    var self = this;
    var THREE = window.THREE;
    if (!THREE) return;
    this.reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ?freeze=1 : deterministic frames for screenshot comparison (time = 0, seeded random, no smoothing, no mouse)
    this.freeze = /[?&]freeze=1/.test(location.search);
    if (this.freeze) { document.documentElement.classList.add('freeze'); var seed = 12345; Math.random = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var CREAM = new THREE.Color('#F3EEE5'), GOLD = new THREE.Color('#DDBC4B');
    this.cGold = GOLD; this.cCream = CREAM;
    this.emOn = new THREE.Color(0x2a2208); this.emOff = new THREE.Color(0x000000);
    var mk = function (cv, fov) {
      if (!cv) return null;
      var r;
      try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false }); } catch (e) { return null; }
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding;
      r.setClearColor(0x050226, 1);
      var sc = new THREE.Scene();
      sc.fog = new THREE.Fog(0x050226, 12, 32);
      sc.add(new THREE.HemisphereLight(0xfff4dc, 0x1a1640, 0.75));
      var key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(-6, 9, 7); sc.add(key);
      var warm = new THREE.PointLight(0xddbc4b, 1.4, 24); warm.position.set(4, -2, 6); sc.add(warm);
      var cam = new THREE.PerspectiveCamera(fov || 34, 1, 0.1, 100);
      return { cv: cv, r: r, sc: sc, cam: cam };
    };
    var cube = function (size, color) {
      var g = new THREE.BoxGeometry(size, size, size);
      var m = new THREE.MeshStandardMaterial({ color: color.clone(), roughness: 0.38, metalness: 0.12, emissive: new THREE.Color(0x000000) });
      var mesh = new THREE.Mesh(g, m);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0xddbc4b, transparent: true, opacity: 0.6 })));
      return mesh;
    };
    var dust = function (n, rMin, rMax, hgt) {
      var pg = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
      for (var j = 0; j < n; j++) { var rr = rMin + Math.random() * (rMax - rMin), a = Math.random() * Math.PI * 2; pos[j*3] = Math.cos(a) * rr; pos[j*3+1] = (Math.random() - 0.5) * hgt; pos[j*3+2] = Math.sin(a) * rr; }
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xddbc4b, size: 0.045, transparent: true, opacity: 0.7 }));
    };
    this.scenes = [];

    // MAIN: a Rubik-style cube that breaks into pieces; each labelled piece = something Ron did.
    this.build = {};
    this.build.main = function () {
    var M = mk(self.cvMain, 34);
    if (M) {
      var items = DATA.items;
      var sticker = function (fill, big, small) {
        var cnv = document.createElement('canvas'); cnv.width = 512; cnv.height = 512;
        var draw = function () {
          var x = cnv.getContext('2d');
          x.fillStyle = '#0B0820'; x.fillRect(0, 0, 512, 512);
          var r = 46, p = 26, w = 512 - 2 * p;
          x.fillStyle = fill; x.beginPath();
          x.moveTo(p + r, p); x.arcTo(p + w, p, p + w, p + w, r); x.arcTo(p + w, p + w, p, p + w, r); x.arcTo(p, p + w, p, p, r); x.arcTo(p, p, p + w, p, r); x.closePath(); x.fill();
          if (big) {
            x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#050226';
            var fit = function (txt, weight, start, maxW, minS) { var sz = start; x.font = weight + ' ' + sz + 'px Rubik, Arial, sans-serif'; while (sz > minS && x.measureText(txt).width > maxW) { sz -= 4; x.font = weight + ' ' + sz + 'px Rubik, Arial, sans-serif'; } return sz; };
            var latin = /[A-Za-z]/.test(big) && !/[\u0590-\u05FF]/.test(big);
            x.direction = latin ? 'ltr' : 'rtl';
            fit(big, '800', 150, 400, 40);
            x.fillText(big, 256, 214);
            x.direction = DATA.dir; x.fillStyle = '#4A4458';
            fit(small, '500', 40, 420, 22);
            x.fillText(small, 256, 388);
            x.fillStyle = '#DDBC4B'; x.fillRect(206, 318, 100, 6);
          }
        };
        draw();
        var tex = new THREE.CanvasTexture(cnv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
        tex.userData = { redraw: function () { draw(); tex.needsUpdate = true; } };
        return tex;
      };
      var mat = function (tex) { return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.05 }); };
      var plainCream = mat(sticker('#F3EEE5')), plainGold = mat(sticker('#DDBC4B')), body = new THREE.MeshStandardMaterial({ color: 0x0B0820, roughness: 0.6 });
      var texs = [];
      var geo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
      var cells = [], li = 0, nc = 0;
      for (var x = -1; x <= 1; x++) for (var y = -1; y <= 1; y++) for (var z = -1; z <= 1; z++) {
        var faceMat = function (axisVal, gold) { return axisVal === 0 ? body : (gold ? plainGold : plainCream); };
        var mats = [faceMat(x === 1 ? 1 : 0, false), faceMat(x === -1 ? 1 : 0, false), faceMat(y === 1 ? 1 : 0, true), faceMat(y === -1 ? 1 : 0, false), faceMat(z === 1 ? 1 : 0, false), faceMat(z === -1 ? 1 : 0, false)];
        var isCenter = (x === 0 && y === 0 && z === 0);
        var label = null;
        if (!isCenter) nc++;
        if (!isCenter && li < items.length && nc % 2 === 1) {
          var t = sticker('#F3EEE5', items[li][0], items[li][1]); texs.push(t);
          mats[4] = mat(t); label = li; li++;
        }
        var mesh = new THREE.Mesh(geo, mats);
        mesh.userData.home = new THREE.Vector3(x, y, z);
        mesh.userData.label = label;
        mesh.userData.seed = new THREE.Vector3(Math.sin(cells.length * 12.9) , Math.cos(cells.length * 7.3), Math.sin(cells.length * 3.1));
        M.sc.add(mesh); cells.push(mesh);
      }
      if (document.fonts && document.fonts.load) {
        Promise.all([document.fonts.load('800 120px Rubik'), document.fonts.load('500 40px Rubik')]).then(function () { texs.forEach(function (t) { t.userData.redraw(); }); }).catch(function () {});
      }
      var d1 = dust(600, 5, 14, 14); M.sc.add(d1);
      M.kind = 'explode'; M.cells = cells; M.nLabels = li; M.dust = d1;
      M.qA = new THREE.Quaternion(); M.qT = new THREE.Quaternion(); M.eT = new THREE.Euler(); M.vA = new THREE.Vector3(); M.vB = new THREE.Vector3(); M.qI = new THREE.Quaternion();
      self.scenes.push(M);
    }
    };
    // A: wave of cubes
    this.build.a = function () {
    var A = mk(self.cvA, 30);
    if (A) {
      var wave = new THREE.Group(); A.sc.add(wave);
      var wc = [];
      for (var i = 0; i < 30; i++) { var q = cube(0.55, i % 9 === 4 ? GOLD : CREAM); q.position.x = -17 + i * 1.15; wave.add(q); wc.push(q); }
      A.kind = 'wave'; A.wave = wave; A.items = wc;
      A.cam.position.set(0, 1.4, 11); A.cam.lookAt(0, 0, 0);
      self.scenes.push(A);
    }
    };
    // B: helix of cubes around the quote
    this.build.b = function () {
    var B = mk(self.cvB, 32);
    if (B) {
      var helix = new THREE.Group(); B.sc.add(helix);
      for (var k = 0; k < 56; k++) {
        var ang = k / 56 * Math.PI * 4;
        var h = cube(0.42, k % 8 === 0 ? GOLD : CREAM);
        h.position.set(Math.cos(ang) * 5.4, (k / 56 - 0.5) * 4.2, Math.sin(ang) * 5.4);
        h.rotation.set(ang, ang * 0.5, 0);
        helix.add(h);
      }
      var d2 = dust(380, 2, 9, 6); B.sc.add(d2);
      B.kind = 'helix'; B.helix = helix; B.dust = d2;
      B.cam.position.set(0, 1.2, 13); B.cam.lookAt(0, 0, 0);
      self.scenes.push(B);
    }
    };
    // C: cubes stacking into a stepped pyramid
    this.build.c = function () {
    var C = mk(self.cvC, 30);
    if (C) {
      var pyr = new THREE.Group(); C.sc.add(pyr);
      var bricks = [];
      var levels = 5;
      for (var lv = 0; lv < levels; lv++) {
        var n = levels - lv;
        for (var a = 0; a < n; a++) for (var b2 = 0; b2 < n; b2++) {
          var br = cube(0.9, lv === levels - 1 ? GOLD : CREAM);
          var tx = (a - (n - 1) / 2), tz = (b2 - (n - 1) / 2), ty = lv - 1.6;
          br.userData.to = new THREE.Vector3(tx, ty, tz);
          br.userData.from = new THREE.Vector3(tx * 3.2, ty + 7 + lv * 1.5, tz * 3.2);
          br.userData.delay = lv * 0.12 + ((a + b2) % 3) * 0.03;
          pyr.add(br); bricks.push(br);
        }
      }
      C.kind = 'pyramid'; C.pyr = pyr; C.bricks = bricks;
      C.cam.position.set(0, 4.5, 13); C.cam.lookAt(0, 0.2, 0);
      self.scenes.push(C);
    }
    };

    this.mx = 0; this.my = 0;
    this.onMove = function (e) { self.mx = e.clientX / window.innerWidth - 0.5; self.my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', this.onMove, { passive: true });
    this.onResize = function () { self.resizeAll(); };
    window.addEventListener('resize', this.onResize);
    this.t0 = performance.now();
    // Draw only while a scene is on screen (IntersectionObserver). The reference looped all the time.
    this.visible = new Set();
    var loop = function (now) {
      if (!self.visible.size) { self.raf = 0; return; }
      self.frame((now - self.t0) / 1000);
      self.raf = requestAnimationFrame(loop);
    };
    var hasIO = 'IntersectionObserver' in window;
    if (hasIO) {
      this.io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) self.visible.add(e.target); else self.visible.delete(e.target); });
        if (self.visible.size && !self.raf) self.raf = requestAnimationFrame(loop);
      }, { rootMargin: '50px' });
    }
    var keys = [['main', 'cvMain'], ['a', 'cvA'], ['b', 'cvB'], ['c', 'cvC']];
    var built = {};
    var buildOne = function (key) {
      if (built[key]) return;
      built[key] = true;
      var n = self.scenes.length;
      self.build[key]();
      var S = self.scenes[n];
      if (!S) return;
      self.resizeOne(S);
      if (hasIO) self.io.observe(S.cv);
    };
    if (this.freeze || !hasIO) {
      // Deterministic order for screenshots (seeded random), and the reference behaviour without IntersectionObserver.
      keys.forEach(function (k) { buildOne(k[0]); });
      if (!hasIO) { this.visible.add(this.cvMain || this.cvA); this.raf = requestAnimationFrame(loop); }
    } else {
      var near = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          near.unobserve(e.target);
          var k = keys.filter(function (x) { return self[x[1]] === e.target; })[0];
          if (k) setTimeout(function () { buildOne(k[0]); }, 0);
        });
      }, { rootMargin: '600px 0px' });
      keys.forEach(function (k) { if (self[k[1]]) near.observe(self[k[1]]); });
      this.near = near;
    }
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('resize', this.onResize);
    if (this.near) this.near.disconnect();
    (this.scenes || []).forEach(function (S) { S.r.dispose(); });
  }
  resizeAll() {
    var self = this;
    (this.scenes || []).forEach(function (S) { self.resizeOne(S); });
  }
  resizeOne(S) {
    var w = S.cv.clientWidth || 1, h = S.cv.clientHeight || 1;
    S.r.setSize(w, h, false);
    S.cam.aspect = w / h; S.cam.updateProjectionMatrix();
    S.wide = w > 900;
  }
  pinProgress(cv) {
    var sec = cv.closest('section'); if (!sec) return 0;
    var r = sec.getBoundingClientRect(), total = r.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / total));
  }
  passProgress(cv) {
    var r = cv.getBoundingClientRect(), vh = window.innerHeight;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
  }
  frame(time) {
    var self = this, vh = window.innerHeight;
    var tm = (this.reduce || this.freeze) ? 0 : time;
    if (this.freeze || this.reduce) { this.mx = 0; this.my = 0; }
    var ease = function (x) { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); };
    (this.scenes || []).forEach(function (S) {
      var rect = S.cv.getBoundingClientRect();
      if (rect.bottom < -50 || rect.top > vh + 50) return;
      if (S.kind === 'explode') {
        var p = self.reduce ? 0.2 : self.pinProgress(S.cv);
        S.sp = (S.sp === undefined || self.freeze) ? p : S.sp + (p - S.sp) * 0.09;
        var s = S.sp;
        var G = 4, start = 0.06, span = 0.86;
        var gpos = (s - start) / span * G;
        var g = Math.max(0, Math.min(G - 1, Math.floor(gpos)));
        var t = Math.min(1, Math.max(0, gpos - g));
        var inRange = s >= start && s <= start + span;
        var out = inRange ? ease(t / 0.32) * (1 - ease((t - 0.74) / 0.24)) : 0;
        var phase = !inRange ? (s < start ? 0 : 5) : g + 1;
        if (phase !== self.state.phase) self.setState({ phase: phase });
        var wide = S.wide, gap = wide ? 2.9 : 2.25;
        S.eT.set(0.5 + self.my * 0.15, 0.7 + s * Math.PI * 1.6 + tm * 0.06 + self.mx * 0.3, 0);
        S.qA.setFromEuler(S.eT);
        var shake = out * 0.06;
        S.cells.forEach(function (m, n) {
          var hm = m.userData.home, lab = m.userData.label;
          S.vA.copy(hm).multiplyScalar(1.02 + shake).applyQuaternion(S.qA);
          var mine = lab !== null && Math.floor(lab / 3) === g;
          if (mine) {
            var i3 = lab % 3;
            // Portrait phones: three pieces side by side do not fit the width, so they are stacked top to bottom instead.
            if (S.cam.aspect < 0.85) S.vB.set(0, -0.7 + (1 - i3) * 2.0 + Math.sin(tm * 0.9 + i3) * 0.05, 3.4);
            else S.vB.set((DATA.dir === 'rtl' ? 1 - i3 : i3 - 1) * gap, -0.7 + Math.sin(tm * 0.9 + i3) * 0.05, 3.4);
            m.position.lerpVectors(S.vA, S.vB, out);
            m.quaternion.copy(S.qA).slerp(S.qI, out);
            var sc = 1 + out * (wide ? 1.05 : 0.7); m.scale.set(sc, sc, sc);
          } else {
            m.position.copy(S.vA);
            m.quaternion.copy(S.qA);
            m.scale.set(1, 1, 1);
          }
        });
        S.dust.rotation.y = tm * 0.02 + s * 1.2;
        S.cam.position.set(0, 0.2, 13 + (wide ? 0 : 3));
        S.cam.lookAt(0, -0.3, 0);
      } else {
        var q = self.reduce ? 0.5 : self.passProgress(S.cv);
        S.sp = (S.sp === undefined || self.freeze) ? q : S.sp + (q - S.sp) * 0.1;
        var u = S.sp;
        if (S.kind === 'wave') {
          S.items.forEach(function (c, n) {
            var ph = n * 0.45 - u * 9 + tm * 0.6;
            c.position.y = Math.sin(ph) * 0.9;
            c.position.z = Math.cos(ph) * 0.6;
            c.rotation.x = ph * 0.5; c.rotation.y = ph * 0.35;
          });
          S.wave.position.x = (0.5 - u) * 4;
        } else if (S.kind === 'helix') {
          S.helix.rotation.y = u * Math.PI * 1.6 + tm * 0.05 + self.mx * 0.3;
          S.helix.rotation.x = 0.25 + (u - 0.5) * 0.4;
          if (!self.reduce) S.helix.children.forEach(function (c, n) { c.rotation.x += 0.004; c.rotation.y += 0.003; });
          S.dust.rotation.y = tm * 0.03 + u;
        } else if (S.kind === 'pyramid') {
          var build = Math.min(1, Math.max(0, (u - 0.12) / 0.55));
          S.bricks.forEach(function (b) {
            var k = ease((build - b.userData.delay) / 0.45);
            b.position.lerpVectors(b.userData.from, b.userData.to, k);
            b.rotation.y = (1 - k) * 2.2; b.rotation.x = (1 - k) * 1.4;
          });
          S.pyr.rotation.y = 0.6 + u * 0.9 + self.mx * 0.2;
        }
      }
      S.r.render(S.sc, S.cam);
    });
  }
  renderVals() {
    var self = this;
    if (!this._refs) this._refs = {
      main: function (el) { self.cvMain = el; },
      a: function (el) { self.cvA = el; },
      b: function (el) { self.cvB = el; },
      c: function (el) { self.cvC = el; }
    };
    var st = this.state.step || 1;
    var ph = this.state.phase || 0;
    var groups = DATA.groups;
    var hint = ph === 0 ? DATA.hintStart : (ph === 5 ? DATA.hintEnd : ('0' + ph + ' / 04 · ' + groups[ph - 1]));
    var panel = function (n) { var on = st === n; return 'position: absolute; inset: 0 0 auto 0; opacity: ' + (on ? 1 : 0) + '; transform: translateY(' + (on ? 0 : (n < st ? -24 : 24)) + 'px);'; };
    var dot = function (n) { return 'display: block; height: 3px; width: ' + (st === n ? 44 : 18) + 'px; background: ' + (st === n ? '#DDBC4B' : 'rgba(255,255,255,0.3)') + '; transition: width .5s;'; };
    return { cubeHint: hint, canvasRef: this._refs.main, refA: this._refs.a, refB: this._refs.b, refC: this._refs.c, p1: panel(1), p2: panel(2), p3: panel(3), d1: dot(1), d2: dot(2), d3: dot(3) };
  }
  applyVals() {
    var v = this.renderVals();
    var el = document.getElementById('cube-hint'); if (el && el.textContent !== v.cubeHint) el.textContent = v.cubeHint;
  }
}
(function () {
  var c = new Component();
  c.renderVals();
  c.cvMain = document.getElementById('cv-main'); c.cvA = document.getElementById('cv-a'); c.cvB = document.getElementById('cv-b'); c.cvC = document.getElementById('cv-c');
  c.componentDidMount();
  c.applyVals();
})();

