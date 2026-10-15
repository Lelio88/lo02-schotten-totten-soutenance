/**
 * Effets WebGL du diaporama : fond animé (Highlands au lever du jour) et transitions
 * entre slides, tous deux écrits en GLSL.
 *
 * Choix non évidents :
 *  - Les transitions sont des « rideaux » : un shader plein écran couvre la scène (0 → 0,5),
 *    deck.js change alors de slide à l'abri du rideau, puis le shader le retire (0,5 → 1).
 *    On évite ainsi de rendre le DOM dans une texture (coûteux et fragile).
 *  - Trois motifs : encre (dissolve par bruit), tartan (balayage diagonal), iris (cercle).
 *  - Repli sans WebGL ou avec prefers-reduced-motion : FX.ready vaut false et deck.js
 *    bascule sur un simple fondu CSS.
 *
 * Invariants : le fond ne dépasse pas ~30 images/s (économie CPU/GPU sur un PC de salle) et
 * se met en pause quand l'onglet est caché.
 *
 * API : FX.ready, FX.play(mode, onMid), FX.setProgress(0..1)
 */
(() => {
  const NOISE = `
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p){
      float a = 0.5, s = 0.0;
      for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.03 + vec2(7.1, 3.7); a *= 0.5; }
      return s;
    }`;

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  /* Fond : ciel d'aube, soleil bas, nuages et quatre crêtes brumeuses qui défilent avec la progression. */
  const BG_FRAG = `
    precision mediump float;
    uniform vec2 uRes; uniform float uTime; uniform float uProg;
    ${NOISE}
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float asp = uRes.x / uRes.y;
      vec2 p = vec2(uv.x * asp, uv.y);
      vec3 col = mix(vec3(0.96, 0.82, 0.58), vec3(0.16, 0.34, 0.38), smoothstep(0.25, 1.0, uv.y));
      float d = length(p - vec2(asp * 0.72, 0.36));
      col += vec3(1.0, 0.78, 0.40) * exp(-d * 3.2) * 0.55;
      float c = fbm(vec2(p.x * 1.4 + uTime * 0.01 + uProg * 0.6, p.y * 5.0));
      col = mix(col, vec3(1.0, 0.95, 0.85), smoothstep(0.55, 0.9, c) * smoothstep(0.45, 0.9, uv.y) * 0.35);
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float ridge = 0.18 + (3.0 - fi) * 0.085
                    + 0.10 * fbm(vec2(p.x * (1.2 + fi * 0.9) + uProg * (0.35 + fi * 0.25) + fi * 10.0, fi * 3.7));
        float m = smoothstep(ridge + 0.004, ridge - 0.004, uv.y);
        vec3 g = mix(vec3(0.30, 0.45, 0.40), vec3(0.07, 0.20, 0.12), fi / 3.0);
        float mist = fbm(vec2(p.x * 2.0 + uTime * 0.02 * (fi + 1.0), uv.y * 4.0 + fi)) * 0.35;
        g = mix(g, vec3(0.90, 0.90, 0.85), mist * (1.0 - fi / 4.0) * smoothstep(ridge - 0.12, ridge, uv.y));
        col = mix(col, g, m);
      }
      col *= 1.0 - 0.35 * pow(length(uv - 0.5) * 1.2, 2.0);
      gl_FragColor = vec4(col, 1.0);
    }`;

  /* Rideau de transition : uT 0 → 1, couvert à 0,5. Sortie en alpha pré-multiplié. */
  const FX_FRAG = `
    precision mediump float;
    uniform vec2 uRes; uniform float uT; uniform int uMode; uniform float uSeed;
    ${NOISE}
    vec3 tartan(vec2 p){
      float bx = fract(p.x * 7.0), by = fract(p.y * 7.0);
      float gx = step(0.55, bx) * step(bx, 0.85), gy = step(0.55, by) * step(by, 0.85);
      float wx = step(0.20, bx) * step(bx, 0.26), wy = step(0.20, by) * step(by, 0.26);
      vec3 c = vec3(0.58, 0.12, 0.10);
      c = mix(c, vec3(0.08, 0.30, 0.18), max(gx, gy) * 0.85);
      c = mix(c, vec3(0.05, 0.10, 0.20), gx * gy * 0.7);
      c = mix(c, vec3(0.95, 0.90, 0.75), max(wx, wy) * 0.9);
      return c * (0.9 + 0.1 * sin((p.x + p.y) * 600.0));
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float asp = uRes.x / uRes.y;
      vec2 q = vec2(uv.x * asp, uv.y);
      bool covering = uT < 0.5;
      float phase = covering ? uT * 2.0 : (uT - 0.5) * 2.0;
      float a = 0.0;
      vec3 col = vec3(0.95, 0.90, 0.76);
      if (uMode == 0) {
        float nz = fbm(q * 3.5 + uSeed + (covering ? 0.0 : 17.0));
        float th = covering ? phase : 1.0 - phase;
        float v = th * 1.5 - 0.25;
        a = 1.0 - smoothstep(v - 0.03, v + 0.03, nz);
        float ink = 1.0 - smoothstep(0.0, 0.07, abs(nz - v));
        col = mix(col, vec3(0.18, 0.10, 0.05), ink * 0.9);
      } else if (uMode == 1) {
        float s = (q.x * 0.8 + q.y * 0.5) / (asp * 0.8 + 0.5);
        float front = (covering ? phase : phase) * 1.3 - 0.15;
        a = covering ? 1.0 - smoothstep(front - 0.01, front + 0.01, s)
                     : smoothstep(front - 0.01, front + 0.01, s);
        col = tartan(q);
        float edge = 1.0 - smoothstep(0.0, 0.02, abs(s - front));
        col = mix(col, vec3(0.79, 0.59, 0.17), edge);
      } else {
        float r = length((uv - 0.5) * vec2(asp, 1.0));
        float maxR = length(vec2(asp, 1.0) * 0.5) + 0.05;
        float R = phase * maxR;
        a = covering ? 1.0 - smoothstep(R - 0.01, R + 0.01, r)
                     : smoothstep(R - 0.01, R + 0.01, r);
        col = mix(vec3(0.07, 0.20, 0.12), vec3(0.12, 0.30, 0.18), fbm(q * 5.0));
        float ring = 1.0 - smoothstep(0.0, 0.025, abs(r - R));
        col = mix(col, vec3(0.79, 0.59, 0.17), ring);
      }
      gl_FragColor = vec4(col * a, a);
    }`;

  const API = { ready: false, play: (mode, onMid) => { onMid(); return Promise.resolve(); }, setProgress() {} };
  window.FX = API;

  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bgCanvas = document.getElementById("bg");
  const fxCanvas = document.getElementById("fx");
  const GL_OPTS = { antialias: false, alpha: true, premultipliedAlpha: true };
  const bgGl = !reduced && bgCanvas.getContext("webgl", GL_OPTS);
  const fxGl = !reduced && fxCanvas.getContext("webgl", GL_OPTS);
  if (!bgGl || !fxGl) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function program(gl, frag) {
    const pr = gl.createProgram();
    gl.attachShader(pr, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, compile(gl, gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // Un grand triangle qui couvre tout l'écran.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return pr;
  }

  let bgProg, fxProg;
  try {
    bgProg = program(bgGl, BG_FRAG);
    fxProg = program(fxGl, FX_FRAG);
  } catch (err) {
    console.warn("WebGL indisponible, repli CSS :", err.message);
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const u = (gl, pr, name) => gl.getUniformLocation(pr, name);
  const bgU = { res: u(bgGl, bgProg, "uRes"), time: u(bgGl, bgProg, "uTime"), prog: u(bgGl, bgProg, "uProg") };
  const fxU = { res: u(fxGl, fxProg, "uRes"), t: u(fxGl, fxProg, "uT"), mode: u(fxGl, fxProg, "uMode"), seed: u(fxGl, fxProg, "uSeed") };

  /* Le fond est rendu à demi-résolution : il est flou par nature, inutile de payer plein pot. */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    bgCanvas.width = Math.round(innerWidth * dpr * 0.5);
    bgCanvas.height = Math.round(innerHeight * dpr * 0.5);
    fxCanvas.width = Math.round(innerWidth * dpr);
    fxCanvas.height = Math.round(innerHeight * dpr);
  }
  resize();
  addEventListener("resize", resize);

  let progress = 0;
  let shownProgress = 0;
  let lastDraw = 0;

  function drawBg(now) {
    if (!document.hidden && now - lastDraw > 33) {
      lastDraw = now;
      shownProgress += (progress - shownProgress) * 0.06; // le décor glisse en douceur d'une slide à l'autre
      bgGl.viewport(0, 0, bgCanvas.width, bgCanvas.height);
      bgGl.useProgram(bgProg);
      bgGl.uniform2f(bgU.res, bgCanvas.width, bgCanvas.height);
      bgGl.uniform1f(bgU.time, now / 1000);
      bgGl.uniform1f(bgU.prog, shownProgress);
      bgGl.drawArrays(bgGl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(drawBg);
  }
  requestAnimationFrame(drawBg);

  const MODES = { ink: 0, tartan: 1, iris: 2 };
  const DURATION = 1100;
  let running = false;

  function drawFx(t, mode, seed) {
    fxGl.viewport(0, 0, fxCanvas.width, fxCanvas.height);
    fxGl.useProgram(fxProg);
    fxGl.uniform2f(fxU.res, fxCanvas.width, fxCanvas.height);
    fxGl.uniform1f(fxU.t, t);
    fxGl.uniform1i(fxU.mode, mode);
    fxGl.uniform1f(fxU.seed, seed);
    fxGl.clearColor(0, 0, 0, 0);
    fxGl.clear(fxGl.COLOR_BUFFER_BIT);
    fxGl.drawArrays(fxGl.TRIANGLES, 0, 3);
  }

  API.ready = true;
  API.setProgress = (p) => { progress = p; };
  /** Dessine une seule image de transition à l'instant t (0..1) : sert à vérifier les shaders. */
  API.preview = (modeName, t) => drawFx(t, MODES[modeName] ?? 0, 3.0);
  API.play = (modeName, onMid) =>
    new Promise((resolve) => {
      if (running) { onMid(); resolve(); return; }
      running = true;
      const mode = MODES[modeName] ?? 0;
      const seed = Math.random() * 50;
      let swapped = false;
      const start = performance.now();
      (function frame(now) {
        const t = Math.min((now - start) / DURATION, 1);
        drawFx(t, mode, seed);
        if (t >= 0.5 && !swapped) { swapped = true; onMid(); }
        if (t < 1) { requestAnimationFrame(frame); return; }
        fxGl.clear(fxGl.COLOR_BUFFER_BIT);
        running = false;
        resolve();
      })(start);
    });
})();
