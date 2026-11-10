/* ==========================================================================
   PAPERVIEW PRODUCTIONS v2: motion layer
   The 3D camera, the boot sequence, the dive through the lens, the bokeh
   behind the page, camera sounds and the rest of the page motion.
   site.js owns the content and the camera's controls. This file only adds
   depth and movement, and the page still works if it fails to load.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mk = (tag, cls, parent, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; };
  const fillIris = (el) => { for (let i = 0; i < 8; i++) mk('i', '', el).style.setProperty('--n', i); return el; };

  const hero = $('#hero'), pin = $('#heroPin'), rig = $('#rig'), spin = $('#spin'), cam = $('#cam');
  if (!rig || !spin || !cam) { root.classList.add('is-live'); return; }

  /* ==================================================================
     SOUND: synthesized, so there is nothing to download
     ================================================================== */
  const sfx = (() => {
    let ctx = null, on = true;
    try { on = localStorage.getItem('pv-sound') !== 'off'; } catch (_) {}
    const ac = () => {
      if (!on) return null;
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (_) { ctx = null; }
      return ctx;
    };
    function noise(t0, dur, freq, q, gain, type) {
      const c = ac(); if (!c) return;
      const n = Math.max(1, Math.floor(c.sampleRate * dur)), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(c.currentTime + t0);
    }
    return {
      get on() { return on; },
      set(v) { on = v; try { localStorage.setItem('pv-sound', v ? 'on' : 'off'); } catch (_) {} },
      shutter() { noise(0, 0.05, 2600, 0.9, 0.5); noise(0.012, 0.03, 700, 1.2, 0.35); noise(0.085, 0.06, 1800, 0.8, 0.36); },
      tick() { noise(0, 0.018, 4200, 2, 0.16, 'highpass'); },
      whoosh() { noise(0, 0.32, 420, 0.6, 0.1, 'lowpass'); },
    };
  })();
  const sndBtn = $('#snd');
  if (sndBtn) {
    const paint = () => { sndBtn.setAttribute('aria-pressed', sfx.on); sndBtn.setAttribute('aria-label', sfx.on ? 'Camera sounds on' : 'Camera sounds off'); };
    paint();
    sndBtn.addEventListener('click', () => { sfx.set(!sfx.on); paint(); sfx.tick(); });
  }

  /* ==================================================================
     THE 3D CAMERA: built from flat strips and discs around the real
     back panel, so the screen and controls stay ordinary HTML
     ================================================================== */
  let G = null;            // geometry of the current build
  const parts = {};        // handles the animation loop needs
  const LIGHT = [-0.36, -0.93];

  function strip(parent, w, len, a, r, z, cls, inward) {
    const s = document.createElement('i'), rad = a * Math.PI / 180;
    const d = (Math.sin(rad) * LIGHT[0] - Math.cos(rad) * LIGHT[1]) * (inward ? -1 : 1);
    s.className = 's3 ' + cls;
    s.style.cssText = `width:${w.toFixed(2)}px;height:${len.toFixed(2)}px;margin:${(-len / 2).toFixed(2)}px 0 0 ${(-w / 2).toFixed(2)}px;` +
      `transform:rotateZ(${a.toFixed(2)}deg) translateY(${(-r).toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${inward ? -90 : 90}deg);` +
      `--hl:${(Math.pow(Math.max(0, d), 1.6) * 0.2).toFixed(3)};--sh:${(Math.max(0, -d) * 0.5).toFixed(3)}`;
    parent.appendChild(s);
    return s;
  }
  function group(parent, x, y, z, extra) {
    const g = mk('div', 'g3', parent);
    g.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) ${extra || ''}`;
    return g;
  }
  function cyl(parent, r, z0, len, n, cls, inward) {
    const w = 2 * r * Math.tan(Math.PI / n) + 0.9;
    for (let i = 0; i < n; i++) {
      const s = strip(parent, w, len, i * 360 / n, r, z0 + len / 2, cls, inward);
      if (i === 0 && cls === 's3--barrel') s.classList.add('s3--idx');
    }
  }
  function disc(parent, r, z, cls, html, extra) {
    const d = mk('div', 'ld ' + cls, parent, html);
    d.style.cssText = `width:${(2 * r).toFixed(1)}px;height:${(2 * r).toFixed(1)}px;margin:${(-r).toFixed(1)}px 0 0 ${(-r).toFixed(1)}px;transform:translateZ(${z.toFixed(1)}px) ${extra || ''}`;
    return d;
  }
  // a rounded rectangle pushed through depth: four flat sides and four quarter-round corners
  function box(parent, cx, cy, w, h, rad, zc, depth, cls) {
    const g = group(parent, cx, cy, zc), k = 4, th = 90 / k, sw = 2 * rad * Math.tan(th * Math.PI / 360) + 0.9;
    strip(g, w - 2 * rad + 1, depth, 0, h / 2, 0, cls);
    strip(g, h - 2 * rad + 1, depth, 90, w / 2, 0, cls);
    strip(g, w - 2 * rad + 1, depth, 180, h / 2, 0, cls);
    strip(g, h - 2 * rad + 1, depth, 270, w / 2, 0, cls);
    [[w / 2 - rad, -(h / 2 - rad), 0], [w / 2 - rad, h / 2 - rad, 90], [-(w / 2 - rad), h / 2 - rad, 180], [-(w / 2 - rad), -(h / 2 - rad), 270]].forEach(([x, y, a0]) => {
      const c = group(g, x, y, 0);
      for (let j = 0; j < k; j++) strip(c, sw, depth, a0 + th / 2 + j * th, rad, 0, cls);
    });
    return g;
  }
  function cap(cls, x, y, w, h, z, flip, html) {
    const c = mk('div', 'cap3 ' + cls, spin, html);
    c.style.cssText = `left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:translateZ(${z.toFixed(1)}px)${flip ? ' rotateY(180deg)' : ''}`;
    return c;
  }

  function build() {
    $$(':scope > .g3, :scope > .cap3', spin).forEach((n) => n.remove());
    const W = cam.offsetWidth, H = cam.offsetHeight;
    if (!W || !H) return;
    const mobile = W < 520;
    const rad = parseFloat(getComputedStyle(cam).borderTopLeftRadius) || 30;
    const D = Math.round(clamp(W * 0.105, 44, 86));          // body depth
    const Gd = Math.round(D * 0.6);                           // how far the grip sticks out
    const R = Math.round(Math.min(W * 0.265, H * 0.4));       // lens radius
    const L = Math.round(R * (mobile ? 0.95 : 1.12));         // lens length
    const lxF = mobile ? 0.5 : 0.56;                          // lens position as seen from the front
    const lx = W * (1 - lxF), ly = H * (mobile ? 0.5 : 0.53);
    const N = mobile ? 26 : 40;
    G = { W, H, D, R, L, offX: (lxF - 0.5) * W, offY: ly - H / 2 };
    spin.style.setProperty('--R', R + 'px');
    spin.style.setProperty('--rad', rad + 'px');
    spin.style.setProperty('--lxf', (lxF * W) + 'px');
    spin.style.setProperty('--ly', ly + 'px');
    cam.style.transform = `translateZ(${D / 2}px)`;

    // body
    box(spin, W / 2, H / 2, W, H, rad, 0, D, 's3--body');
    cap('front', 0, 0, W, H, -D / 2, true,
      '<div class="front__mount"></div><span class="front__badge">7S</span><i class="front__lamp"></i><i class="front__rel"></i>' +
      '<span class="front__sub">PVP SERIES<br>HAVERHILL MA</span>');

    // viewfinder hump and eyecup
    const hp = $('.cam__hump', cam), hw = hp.offsetWidth, hh = hp.offsetHeight, hy = hp.offsetTop + 1, hd = D * 0.84;
    box(spin, W / 2, hy + hh / 2, hw, hh, 10, D / 2 - hd / 2 - 0.5, hd, 's3--hump');
    cap('humpf', W / 2 - hw / 2, hy, hw, hh + 3, D / 2 - hd, true, '<b>PAPERVIEW</b>');
    const shoe = group(spin, W / 2, hy - 0.5, D / 2 - hd / 2, 'rotateX(90deg)');
    const sh = mk('i', 'shoe', shoe); sh.style.cssText = `width:${hw * 0.36}px;height:${hd * 0.56}px;left:${-hw * 0.18}px;top:${-hd * 0.28}px;transform:translateZ(1.5px)`;
    box(spin, W / 2, hy + hh / 2 + 1, hw * 0.46, hh * 0.76, 7, D / 2 + 6, 12, 's3--rubber');
    cap('eyecap', W / 2 - hw * 0.23, hy + hh * 0.12 + 1, hw * 0.46, hh * 0.76, D / 2 + 12, false);

    // grip
    const gw = W * 0.2, gh = H * 0.9, gcx = W - W * 0.115, gcy = H * 0.52, grad = Math.min(26, gw / 2 - 2);
    spin.style.setProperty('--grad', grad + 'px');
    box(spin, gcx, gcy, gw, gh, grad, -D / 2 - Gd / 2, Gd, 's3--leather');
    cap('gripf', gcx - gw / 2, gcy - gh / 2, gw, gh, -D / 2 - Gd, true);

    // top plate: shutter on the grip, two dials on the body
    const sg = group(spin, gcx, gcy - gh / 2, -D / 2 - Gd * 0.5, 'rotateX(90deg)'), sr = clamp(W * 0.036, 13, 30);
    cyl(sg, sr * 1.3, 0, 5, 20, 's3--knurl'); disc(sg, sr * 1.3, 5, 'ld--dark');
    cyl(sg, sr, 5, 8, 20, 's3--gold');
    parts.top = disc(sg, sr, 13, 'ld--goldtop');
    const d1 = group(spin, W * 0.7, 0, 0, 'rotateX(90deg)'), dr = clamp(W * 0.042, 14, 34);
    cyl(d1, dr, 0, 14, 22, 's3--knurl'); disc(d1, dr, 14, 'ld--dial');
    const d2 = group(spin, W * 0.15, 0, D * 0.04, 'rotateX(90deg)');
    cyl(d2, dr * 0.84, 0, 10, 20, 's3--knurl'); disc(d2, dr * 0.84, 10, 'ld--dial');

    // lens: barrel, hood, then glass elements stepping back to the iris
    const lens = group(spin, lx, ly, -D / 2, 'rotateY(180deg)');
    cyl(lens, R * 0.86, 0, L * 0.08, N, 's3--chrome');
    cyl(lens, R * 0.93, L * 0.06, L * 0.78, N, 's3--barrel');
    cyl(lens, R, L * 0.8, L * 0.2, N, 's3--rim');
    cyl(lens, R * 0.9, L * 0.5, L * 0.5, Math.round(N * 0.6), 's3--inner', true);
    disc(lens, R, L * 0.8, 'ld--back');
    disc(lens, R * 0.92, L * 0.48, 'ld--hole');
    const iris = disc(lens, R * 0.5, L * 0.56, 'ld--iris', '<div class="iris"></div>');
    fillIris(iris.firstChild);
    parts.refl = disc(lens, R * 0.58, L * 0.68, 'ld--refl', '', 'rotate(180deg)');
    disc(lens, R * 0.72, L * 0.78, 'ld--step2');
    parts.glass = disc(lens, R * 0.72, L * 0.86, 'ld--glass', '<div class="ld__sheen"></div>');
    disc(lens, R * 0.8, L * 0.94, 'ld--step1');
    disc(lens, R, L, 'ld--front',
      '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="pvLensRing" d="M100,100 m-87.5,0 a87.5,87.5 0 1,1 175,0 a87.5,87.5 0 1,1 -175,0"/></defs>' +
      '<text><textPath href="#pvLensRing" startOffset="2%"><tspan class="g">PAPERVIEW</tspan> &#160;&#183;&#160; 24-70mm 1:2.8 &#160;&#183;&#160; &#216;82 &#160;&#183;&#160; <tspan class="g">PVP G</tspan> &#160;&#183;&#160; HAVERHILL MA &#160;&#183;&#160; FULL FRAME &#160;&#183;</textPath></text></svg>');
    parts.iris = iris; parts.irisIn = iris.firstChild; parts.sheen = parts.glass.firstChild;
    const bg = document.getElementById('lcdBg');
    parts.refl.style.backgroundImage = lastThumb ? `url("${lastThumb}")` : (bg ? bg.style.backgroundImage : '');

    parts.glass.addEventListener('click', () => $('#shutter').click());
    parts.top.addEventListener('click', () => $('#shutter').click());
    S.dirty = true;
  }

  /* ==================================================================
     ROTATION: springs toward a pose made from the pointer, a drag, an
     idle float, or the scroll position while the hero is pinned
     ================================================================== */
  const S = { ry: -200, rx: -6, vy: 0, vx: 0, base: 0, dragRx: 0, nx: 0, ny: 0, over: false, drag: false, hold: true, intro: true, p: 0, tilt: 0, auto: false, dirty: true, lastRy: 999, fade: 1, spun: false };
  const floor = $('#rigFloor'), glare = $('#lcdGlare'), dive = $('#dive'), say = $('#diveSay');
  const head = $('.hero__head'), rest = $('.hero__rest'), extras = $('#heroExtras'), hint = $('#heroScroll');
  const flipBtn = $('#flip'), flipLabel = $('#flipLabel');
  let pinned = false, lastThumb = '', lastFrame = 0, heroH = 0;

  const mqPin = matchMedia('(min-width: 1181px) and (min-height: 660px)');
  function setPinned() {
    pinned = mqPin.matches && !reduce;
    hero.classList.toggle('is-pinned', pinned);
    heroH = hero.offsetHeight;
    if (!pinned) { [head, rest, extras].forEach((el) => { el.style.opacity = ''; el.style.transform = ''; }); rig.classList.remove('is-auto'); S.auto = false; S.fade = 1; rig.style.perspectiveOrigin = ''; if (dive) dive.style.cssText = 'opacity:0'; }
  }
  const isFront = () => Math.abs(Math.round(S.base / 180)) % 2 === 1;
  function syncSide() {
    const f = isFront();
    rig.classList.toggle('is-front', f);
    if (flipLabel) flipLabel.textContent = f ? 'See the screen' : 'See the lens';
  }
  function flip() { S.base = Math.round(S.base / 180) * 180 + 180; S.spun = true; syncSide(); sfx.whoosh(); }
  if (flipBtn) flipBtn.addEventListener('click', flip);

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = rig.getBoundingClientRect();
    S.nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.75), -1, 1);
    S.ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9), -1, 1);
    S.over = e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 44 && e.clientY < r.bottom + 20;
  }, { passive: true });

  // drag anywhere on the camera to spin it; it settles on the screen or the lens
  let dg = null, draggedAt = 0;
  rig.addEventListener('pointerdown', (e) => {
    if (S.auto || e.button > 0) return;
    if (e.target.closest('button, a, .mode__knob, .car__arrow, .ld--goldtop')) return;
    dg = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, on: false, v: 0, t: performance.now() };
  });
  rig.addEventListener('pointermove', (e) => {
    if (!dg || e.pointerId !== dg.id) return;
    const tdx = e.clientX - dg.x, tdy = e.clientY - dg.y;
    if (!dg.on) {
      if (Math.abs(tdx) < 8 || Math.abs(tdx) < Math.abs(tdy)) return;
      dg.on = true; S.drag = true; S.spun = true; rig.classList.add('is-drag'); dg.lx = e.clientX; dg.ly = e.clientY;
      try { rig.setPointerCapture(e.pointerId); } catch (_) {}
    }
    const now = performance.now(), dx = e.clientX - dg.lx, dy = e.clientY - dg.ly;
    dg.v = dx / Math.max(1, now - dg.t); dg.t = now; dg.lx = e.clientX; dg.ly = e.clientY;
    S.base += dx * 0.42;
    if (e.pointerType !== 'touch') S.dragRx = clamp(S.dragRx - dy * 0.22, -26, 26);
  });
  const endDrag = () => {
    if (!dg) return;
    const was = dg.on, v = dg.v; dg = null;
    if (!was) return;
    S.drag = false; S.dragRx = 0; rig.classList.remove('is-drag');
    S.base = Math.round((S.base + clamp(v, -3, 3) * 130) / 180) * 180;
    draggedAt = performance.now(); syncSide();
  };
  rig.addEventListener('pointerup', endDrag);
  rig.addEventListener('pointercancel', endDrag);
  rig.addEventListener('click', (e) => { if (performance.now() - draggedAt < 260) { e.stopPropagation(); e.preventDefault(); } }, true);

  function camStep(dt, t, snap) {
    if (!G) return;
    const y = scrollY;
    if (y > heroH + 80 && !S.dirty) return;                       // off screen, nothing to do
    const vw = innerWidth, vh = innerHeight;

    // where we are in the pinned scroll
    let p = pinned ? clamp(y / Math.max(1, heroH - vh), 0, 1) : 0;
    S.p = snap ? p : S.p + (p - S.p) * Math.min(1, dt * 9);
    if (Math.abs(S.p - p) < 0.0004) S.p = p;
    const P = S.p, a = smooth(0.1, 0.52, P), b = smooth(0.6, 1, P), auto = pinned ? smooth(0.03, 0.12, P) : 0;
    const isAuto = auto > 0.02;
    if (isAuto !== S.auto) { S.auto = isAuto; rig.classList.toggle('is-auto', isAuto); if (isAuto && dg) endDrag(); }

    // the pose we are springing toward
    let tRy, tRx;
    if (S.drag) { tRy = S.base; tRx = S.dragRx; }
    else if (S.over) { tRy = S.base + S.nx * 5; tRx = -S.ny * 4; }
    else { tRy = S.base - 11 + Math.sin(t * 0.5) * 3 + S.nx * 3; tRx = 5 + Math.sin(t * 0.37) * 1.5 - S.ny * 2; }
    if (!pinned) tRy += S.tilt;
    if (S.hold) { tRy = S.ry; tRx = S.rx; }
    if (snap || reduce) { S.ry = reduce ? S.base - 10 : tRy; S.rx = reduce ? 4 : tRx; S.vy = S.vx = 0; S.intro = false; }
    else {
      const k = S.intro ? 15 : 62, c = S.intro ? 6 : 13;
      S.vy += ((tRy - S.ry) * k - S.vy * c) * dt; S.ry += S.vy * dt;
      S.vx += ((tRx - S.rx) * k - S.vx * c) * dt; S.rx += S.vx * dt;
      if (S.intro && !S.hold && Math.abs(tRy - S.ry) < 1 && Math.abs(S.vy) < 6) S.intro = false;
    }

    let ry = S.ry, rx = S.rx, s = 1, tx = 0, ty = 0;
    if (auto > 0) {
      // scroll turns the camera to face you, centers the lens and pushes in
      const end = isFront() ? S.base : S.base + 180;
      ry = lerp(S.ry, lerp(S.base, end, a), auto);
      rx = lerp(S.rx, lerp(0, -1.5, a), auto);
      const r = rig.getBoundingClientRect();
      const dx = vw / 2 - (r.left + r.width / 2), dy = vh / 2 - (r.top + r.height / 2), oy = vh / 2 - (r.top + r.height * 0.46);
      s = lerp(1, 0.94, a) * (1 + 3.3 * b * b);
      tx = (dx - G.offX * s) * a; ty = (dy - G.offY * s) * a;
      rig.style.perspectiveOrigin = `calc(50% + ${(dx * a).toFixed(1)}px) calc(46% + ${(oy * a).toFixed(1)}px)`;
      S.poWritten = true;
    } else if (S.poWritten) { rig.style.perspectiveOrigin = ''; S.poWritten = false; }

    spin.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    // light that moves with the turn
    if (Math.abs(ry - S.lastRy) > 0.08 || S.dirty) {
      S.lastRy = ry; S.dirty = false;
      const q = ry * Math.PI / 180;
      if (floor) floor.style.transform = `scaleX(${(0.5 + 0.5 * Math.abs(Math.cos(q))).toFixed(3)})`;
      if (glare) glare.style.backgroundPosition = `${(50 + Math.sin(q) * 95).toFixed(1)}% 0`;
      if (parts.sheen) parts.sheen.style.transform = `rotate(${(ry * 0.9).toFixed(1)}deg)`;
    }

    if (!pinned) return;
    // copy and the strip under the camera get out of the way
    const fade = 1 - smooth(0.04, 0.26, P);
    if (Math.abs(fade - S.fade) > 0.002 || (fade === 1 && S.fade !== 1)) {
      S.fade = fade;
      const st = fade === 1 ? '' : String(fade.toFixed(3));
      head.style.opacity = rest.style.opacity = extras.style.opacity = st;
      head.style.transform = rest.style.transform = fade === 1 ? '' : `translateX(${((fade - 1) * 90).toFixed(1)}px)`;
      extras.style.transform = fade === 1 ? '' : `translateY(${((1 - fade) * 40).toFixed(1)}px)`;
      if (hint) hint.style.opacity = fade === 1 ? '' : st;
      [head, rest, extras].forEach((el) => { el.style.transition = fade === 1 ? '' : 'none'; el.style.filter = fade === 1 ? '' : 'none'; });
    }
    // the iris opens and the dark inside the lens swallows the frame
    if (b > 0.001 && parts.iris) {
      const ap = lerp(0.27, 0.5, smooth(0.15, 0.6, b));
      parts.irisIn.style.setProperty('--ap', ap.toFixed(3));
      const h = parts.iris.getBoundingClientRect(), pr = pin.getBoundingClientRect();
      const g = smooth(0.42, 1, b), r0 = h.width * ap * 0.92, r1 = Math.hypot(vw, vh);
      dive.style.cssText = `opacity:${smooth(0.2, 0.4, b).toFixed(3)};--x:${(h.left + h.width / 2 - pr.left).toFixed(1)}px;--y:${(h.top + h.height / 2 - pr.top).toFixed(1)}px;--r:${lerp(r0, r1, g * g).toFixed(1)}px`;
      const so = smooth(0.8, 0.96, b);
      say.style.opacity = so.toFixed(3); say.style.transform = `scale(${lerp(1.25, 1, so).toFixed(3)})`;
      S.diving = true;
    } else if (S.diving) {
      S.diving = false; dive.style.cssText = 'opacity:0'; say.style.opacity = 0;
      if (parts.irisIn) parts.irisIn.style.removeProperty('--ap');
    }
  }

  /* ==================================================================
     SHUTTER: recoil, the lens iris snaps, and the frame flies to the roll
     ================================================================== */
  const pop = mk('div', 'pop', document.body);
  addEventListener('pv:render', (e) => {
    lastThumb = e.detail.thumb;
    if (parts.refl) parts.refl.style.backgroundImage = `url("${lastThumb}")`;
  });
  addEventListener('pv:shoot', (e) => {
    sfx.shutter();
    if (reduce) return;
    S.vx -= 150; S.vy += (Math.random() - 0.5) * 60;
    if (parts.iris) { parts.iris.classList.add('snap'); setTimeout(() => parts.iris.classList.remove('snap'), 150); }
    pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go');
    const cell = e.detail.cell, src = e.detail.src;
    const from = (isFront() && parts.glass ? parts.glass : $('#lcdFrame')).getBoundingClientRect(), to = cell.getBoundingClientRect();
    if (!from.width || !to.width || to.top > innerHeight || to.bottom < 0) return;
    const im = mk('img', 'fly', document.body);
    im.src = src; im.alt = '';
    im.style.cssText = `width:${from.width}px;height:${from.height}px;transform:translate(${from.left}px,${from.top}px)`;
    void im.offsetWidth;
    im.style.transform = `translate(${to.left}px,${to.top}px) scale(${to.width / from.width},${to.height / from.height})`;
    im.style.opacity = 0;
    setTimeout(() => im.remove(), 900);
  });
  // control clicks tick like a dial
  document.addEventListener('click', (e) => { if (e.target.closest('.mode__b, .fmt__b, .pad, .mode__knob, .chip, .svc__tab, .indnav__b')) sfx.tick(); });

  /* ==================================================================
     BOKEH: a small fragment shader behind the whole page
     ================================================================== */
  let gl = null, glU = null, glCv = $('#gl'), mx = 0, my = 0, gmx = 0, gmy = 0;
  function initGL() {
    if (!glCv) return;
    try { gl = glCv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (_) { gl = null; }
    if (!gl) { glCv.style.display = 'none'; return; }
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;
      uniform vec2 uR; uniform float uT; uniform vec2 uM; uniform float uS;
      float h(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        vec2 p = (gl_FragCoord.xy - .5 * uR) / uR.y;
        vec3 col = vec3(.031, .031, .039);
        for (int i = 0; i < 16; i++) {
          float fi = float(i), dp = h(fi * 1.7) * .9 + .25;
          vec2 c = vec2(h(fi * 3.1) - .5, h(fi * 5.3) - .5) * vec2(2.6, 1.7);
          c.x += sin(uT * .05 * dp + fi) * .28 + uM.x * .09 * dp;
          c.y += cos(uT * .04 * dp + fi * 2.) * .2 - uM.y * .07 * dp + uS * .32 * dp;
          c.y = mod(c.y + .95, 1.9) - .95;
          float r = mix(.035, .17, h(fi * 7.7)) * dp;
          float d = length(p - c);
          float body = smoothstep(r, r * .8, d);
          float ring = smoothstep(r, r * .92, d) - smoothstep(r * .92, r * .76, d);
          float al = (body * .5 + ring * .7) * mix(.035, .13, h(fi * 9.1)) * (.62 + .38 * sin(uT * .5 + fi * 4.));
          col += mix(vec3(.79, .64, .29), vec3(.96, .86, .58), h(fi * 2.3)) * al;
        }
        col += vec3(.79, .6, .25) * exp(-3.4 * length(p - vec2(uM.x * .7, -uM.y * .45 + .08))) * .06;
        col *= 1. - .5 * dot(p, p) * .7;
        gl_FragColor = vec4(col, 1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { gl = null; glCv.style.display = 'none'; return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    glU = { r: gl.getUniformLocation(pr, 'uR'), t: gl.getUniformLocation(pr, 'uT'), m: gl.getUniformLocation(pr, 'uM'), s: gl.getUniformLocation(pr, 'uS') };
    sizeGL();
  }
  function sizeGL() {
    if (!gl) return;
    const k = 0.5, w = Math.max(2, Math.round(innerWidth * k)), h = Math.max(2, Math.round(innerHeight * k));
    if (glCv.width !== w || glCv.height !== h) { glCv.width = w; glCv.height = h; gl.viewport(0, 0, w, h); }
  }
  function drawGL(t) {
    if (!gl) return;
    gmx += (mx - gmx) * 0.05; gmy += (my - gmy) * 0.05;
    gl.uniform2f(glU.r, glCv.width, glCv.height); gl.uniform1f(glU.t, t);
    gl.uniform2f(glU.m, gmx, gmy); gl.uniform1f(glU.s, scrollY / Math.max(1, innerHeight));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  /* ==================================================================
     TYPE: headlines rise word by word, labels decode
     ================================================================== */
  function split(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = mk('span', 'w'), wi = mk('span', 'wi', w);
            wi.style.setProperty('--i', i++); wi.textContent = tok;
            frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    };
    walk(el);
  }
  function scramble(el) {
    if (el._scr) return; el._scr = true;
    if (reduce) return;
    const final = el.textContent, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/', t0 = performance.now(), dur = 750;
    const iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / dur), keep = Math.floor(p * final.length);
      el.textContent = final.slice(0, keep) + [...final.slice(keep)].map((c) => (c === ' ' || c === '·') ? c : chars[Math.random() * chars.length | 0]).join('');
      if (p >= 1) { clearInterval(iv); el.textContent = final; }
    }, 40);
  }
  $$('.hero__title, .sec__title').forEach(split);
  const scrEls = $$('.sec .eyebrow, .case__tag');

  /* ==================================================================
     CARDS: tilt and a soft glare under the pointer
     ================================================================== */
  function tilt(els, max) {
    if (!fine || reduce) return;
    els.forEach((el) => {
      if (el._tilt) return; el._tilt = true;
      el.classList.add('tilt');
      const g = mk('span', 'tilt__glare', el);
      el.addEventListener('pointermove', (e) => {
        if (el.classList.contains('playing')) { el.style.transform = ''; g.style.opacity = 0; return; }
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transitionDelay = '0s';
        el.style.transform = `perspective(1300px) rotateY(${((x - 0.5) * max).toFixed(2)}deg) rotateX(${(-(y - 0.5) * max).toFixed(2)}deg)`;
        g.style.background = `radial-gradient(circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(233,206,130,.15), transparent 46%)`;
        g.style.opacity = 1;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; g.style.opacity = 0; });
    });
  }
  function burst(c) {
    const body = $('.case__body', c), num = $('.case__num', c);
    if (!body || !num || reduce || document.hidden) return;
    const br = body.getBoundingClientRect(), nr = num.getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const s = mk('i', 'spark', body), ang = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 150;
      s.style.cssText = `--x:${(nr.left - br.left + Math.random() * Math.min(nr.width, 420)).toFixed(0)}px;--y:${(nr.top - br.top + nr.height * (0.25 + Math.random() * 0.5)).toFixed(0)}px;--dx:${(Math.cos(ang) * dist).toFixed(0)}px;--dy:${(Math.sin(ang) * dist - 30).toFixed(0)}px;animation-delay:${(Math.random() * 120).toFixed(0)}ms`;
      setTimeout(() => s.remove(), 1200);
    }
  }

  /* ==================================================================
     INDUSTRIES: iris wipe between them, film linked to the scroll
     ================================================================== */
  const indSec = $('#industries'), stage = $('#indStage');
  let wipe = null, wiping = false;
  if (indSec && stage) {
    // the wipe is clipped to the stage, so the heading and the industry buttons stay put
    const clip = mk('div', 'ind__clip', indSec);
    const fitClip = () => { clip.style.top = stage.offsetTop + 'px'; clip.style.height = stage.offsetHeight + 'px'; };
    wipe = mk('div', 'ind__wipe', clip, '<div class="iris"></div>');
    fillIris(wipe.firstChild);
    window.pvSwapInd = (swap) => {
      if (reduce) return swap();
      if (wiping) return;
      wiping = true;
      const h = stage.offsetHeight, w = stage.offsetWidth, cy = Math.min(h / 2, innerHeight * 0.45);
      fitClip();
      wipe.style.top = cy + 'px';
      wipe.style.setProperty('--is', Math.ceil(Math.hypot(w, (h - cy) * 2) * 1.06) + 'px');
      void wipe.offsetWidth;
      wipe.classList.add('shut');
      setTimeout(() => { swap(); fitClip(); wipe.classList.remove('shut'); setTimeout(() => { wiping = false; }, 440); }, 450);
    };
  }
  function wireStage() {
    const rail = $('.strip__rail', stage);
    if (rail && !rail._fx) {
      rail._fx = true; rail.dataset.cursor = 'Drag';
      rail.style.scrollSnapType = 'none';
      const touch = () => { if (!rail._touched) { rail._touched = true; rail.style.scrollSnapType = ''; } };
      ['pointerdown', 'touchstart', 'wheel'].forEach((ev) => rail.addEventListener(ev, touch, { passive: true }));
      rail.addEventListener('scroll', () => {
        const v = rail.scrollLeft - (rail._l || 0); rail._l = rail.scrollLeft;
        if (reduce) return;
        rail.style.setProperty('--sk', clamp(-v * 0.28, -7, 7).toFixed(2) + 'deg');
        clearTimeout(rail._t); rail._t = setTimeout(() => rail.style.setProperty('--sk', '0deg'), 90);
      }, { passive: true });
    }
    tilt($$('.ind__stat', stage), 5);
    railLink();
  }
  function railLink() {
    const rail = stage && $('.strip__rail', stage);
    if (!rail || rail._touched || reduce) return;
    const r = rail.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    rail.scrollLeft = clamp((vh - r.top) / (vh + r.height), 0, 1) * (rail.scrollWidth - rail.clientWidth) * 0.6;
  }
  addEventListener('pv:ind', wireStage);

  /* ==================================================================
     VIEWFINDER FRAME + scroll-linked details
     ================================================================== */
  const SECS = [
    ['hero', '00', 'Camera', '1/1000   f/2.8   ISO 3200'], ['results', '01', 'Results', '1/500   f/4   ISO 200'],
    ['services', '02', 'What we do', '1/250   f/2.8   ISO 400'], ['industries', '03', 'Industries', '1/1000   f/2   ISO 1600'],
    ['proof', '04', 'Proof', '1/60   f/1.8   ISO 800'], ['contact', '05', 'Start a project', '1/125   f/5.6   ISO 100'],
  ].map(([id, n, name, exp]) => ({ el: $('#' + id), id, n, name, exp })).filter((s) => s.el);
  const vfScale = $('#vfScale'), vfDot = $('#vfDot'), vfNum = $('#vfNum'), vfName = $('#vfName'), vfExp = $('#vfExp'), footMark = $('#footMark');
  let curSec = '';
  function buildTicks() {
    if (!vfScale) return;
    $$('.vf__tick', vfScale).forEach((t) => t.remove());
    const max = Math.max(1, root.scrollHeight - innerHeight);
    SECS.forEach((s) => {
      const top = s.el.getBoundingClientRect().top + scrollY;
      const t = mk('button', 'vf__tick', vfScale);
      t.type = 'button'; t.tabIndex = -1; t.dataset.label = s.name; t.dataset.id = s.id;
      t.style.top = (clamp(top / max, 0, 1) * 100).toFixed(2) + '%';
      t.addEventListener('click', () => s.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    });
  }
  function onScroll() {
    const y = scrollY, vh = innerHeight, max = Math.max(1, root.scrollHeight - vh);
    if (vfDot) vfDot.style.setProperty('--p', (clamp(y / max, 0, 1) * 100).toFixed(2) + '%');
    let cur = SECS[0];
    SECS.forEach((s) => { if (s.el.getBoundingClientRect().top < vh * 0.5) cur = s; });
    if (cur && cur.id !== curSec) {
      curSec = cur.id;
      if (vfNum) { vfNum.textContent = cur.n; vfName.textContent = cur.name; vfExp.textContent = cur.exp; if (root.classList.contains('is-live')) scramble(Object.assign(vfName, { _scr: false })); }
      $$('.vf__tick').forEach((t) => t.classList.toggle('is-on', t.dataset.id === cur.id));
    }
    scrEls.forEach((el) => { if (!el._scr && el.getBoundingClientRect().top < vh * 0.9) scramble(el); });
    $$('.case.in:not(.did)').forEach((c) => { c.classList.add('did'); setTimeout(() => burst(c), 1850); });
    railLink();
    if (footMark) {
      const r = footMark.getBoundingClientRect(), fh = footMark.parentNode.offsetHeight;
      if (r.top < vh) footMark.style.setProperty('--f', (clamp((vh - r.top) / (fh * 0.9), 0, 1) * 100).toFixed(1) + '%');
      root.classList.toggle('at-foot', r.top < vh - 40);
    }
    if (!pinned) { const r = rig.getBoundingClientRect(); S.tilt = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1) * -16; }
    // if the frame loop is asleep (background tab), keep the scroll-driven pose correct anyway
    if (performance.now() - lastFrame > 300) camStep(0, performance.now() / 1000, true);
  }

  /* cursor label: says what a drag or click will do */
  if (fine && !reduce) {
    const ret = $('#reticle');
    if (ret) {
      const lab = mk('b', 'reticle__t', ret);
      let cur = '';
      addEventListener('pointermove', (e) => {
        const c = e.target.closest ? e.target.closest('[data-cursor]') : null, t = c && !S.auto ? c.dataset.cursor : '';
        if (t !== cur) { cur = t; lab.textContent = t; ret.classList.toggle('has-t', Boolean(t)); }
      }, { passive: true });
    }
    $$('.cam__ctl, .cam__top').forEach((el) => { el.dataset.cursor = ''; });
    $$('.pv').forEach((el) => { el.dataset.cursor = 'Play'; });
  }

  /* ==================================================================
     BOOT: count up, then the iris opens onto the page
     ================================================================== */
  function boot() {
    const b = $('#boot');
    const live = () => { root.classList.add('is-live'); S.hold = false; onScroll(); };
    if (!b) return live();
    if (reduce) { b.remove(); return live(); }
    fillIris($('#bootIris'));
    b.classList.add('is-ready');
    const n = $('#bootN'), msg = $('#bootMsg'), msgs = ['Powering on', 'Sensor check', 'Lens mounted', 'Card ready', 'Rolling'], t0 = performance.now();
    let done = false;
    const open = () => { if (done) return; done = true; b.classList.add('is-open'); live(); setTimeout(() => b.remove(), 1400); };
    const iv = setInterval(() => {
      const v = Math.min(100, Math.round((performance.now() - t0) / 11));
      n.textContent = String(v).padStart(3, '0'); msg.textContent = msgs[Math.min(4, Math.floor(v / 21))];
      if (v >= 100) { clearInterval(iv); open(); }
    }, 30);
    setTimeout(open, 3200);
  }

  /* ==================================================================
     START
     ================================================================== */
  let running = false, tPrev = 0;
  function frame(now) {
    if (document.hidden) { running = false; return; }
    const dt = Math.min(0.05, (now - tPrev) / 1000 || 0.016); tPrev = now; lastFrame = now;
    camStep(dt, now / 1000, false);
    drawGL(now / 1000);
    requestAnimationFrame(frame);
  }
  function start() { if (running || document.hidden) return; running = true; tPrev = performance.now(); requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', start);

  let rz = null;
  function relayout() {
    setPinned();
    if (!G || Math.abs(cam.offsetWidth - G.W) > 1 || Math.abs(cam.offsetHeight - G.H) > 1) build();
    sizeGL(); buildTicks(); onScroll();
  }
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(relayout, 140); });
  if (mqPin.addEventListener) mqPin.addEventListener('change', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(relayout, 60));
  addEventListener('load', relayout);
  addEventListener('scroll', onScroll, { passive: true });

  setPinned();
  build();
  syncSide();
  initGL();
  tilt($$('.case'), 3.5);
  tilt($$('.pv'), 6);
  wireStage();
  buildTicks();
  if (reduce) { camStep(0, 0, true); drawGL(0); }
  start();
  boot();
})();
