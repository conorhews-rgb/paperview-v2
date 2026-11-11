/* ==========================================================================
   PAPERVIEW PRODUCTIONS v2: round two
   Result sliders, the ring of finished work, the pinned process walkthrough,
   the names wall, questions, and a pointer spotlight in each section.
   Editable numbers and lists are in the data blocks at the top.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mk = (tag, cls, parent, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; };

  /* ------------------------------------------------------------------
     DATA: the two result sliders
     each step is [label, amount added in that step, short tag]
     ------------------------------------------------------------------ */
  const money = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const views = (v) => (Math.round(v / 1e5) / 10).toString().replace(/\.0$/, '') + 'M';
  const SCRUBS = {
    marotte: {
      steps: [['Month 1', 30000, ''], ['Month 2', 50000, ''], ['Month 3', 70000, '']],
      fmt: money, short: (v) => '$' + Math.round(v / 1000) + 'K', end: '$150,000+',
      say: (s, v, last) => `<b>${s[0]}:</b> ${money(v)} in new business.${last ? ' <b>$150,000+ in total.</b>' : ''}`,
    },
    // Daily split is an estimate that adds up to the real 75M total. Swap in the real numbers from the analytics here.
    duel: {
      steps: [['Day 1', 6e6, ''], ['Day 2', 10e6, ''], ['Day 3', 24e6, 'Weigh-ins'], ['Day 4', 35e6, 'Fight day']],
      fmt: views, short: (v) => '~' + views(v), end: '75M', approx: true,
      say: (s, v, last) => `<b>${s[0]}${s[2] ? ', ' + s[2].toLowerCase() : ''}:</b> about ${views(v)} views that day.${last ? ' <b>75M in total.</b>' : ''}`,
    },
  };

  /* ------------------------------------------------------------------
     DATA: the ring of finished work
     ------------------------------------------------------------------ */
  const RING = [
    { vid: 'reel-marotte', kind: 'Reel', who: 'Marotte Industrial' },
    { img: 'assets/img/bc-mi-hydrant-wrench.webp', kind: 'Photo', who: 'Marotte Industrial' },
    { vid: 'reel-fight', kind: 'Reel', who: 'Fight night recap' },
    { img: 'assets/img/cs-bkfc-inside.webp', kind: 'Photo', who: 'BKFC' },
    { vid: 'reel-duel', kind: 'Reel', who: 'Duel Arena arrivals' },
    { img: 'assets/img/ath-connor-barry.webp', kind: 'Photo', who: 'Northeast Fight Promotion' },
    { vid: 'reel-lbh', kind: 'Reel', who: 'Long Barn Hay' },
    { vid: 'reel-realestate', kind: 'Reel', who: 'Lucci Witte Team' },
    { img: 'assets/img/bc-lbh-cowboy-portrait.webp', kind: 'Photo', who: 'Long Barn Hay' },
    { img: 'assets/img/wc-headshot-2.webp', kind: 'Photo', who: 'Professional headshots' },
    { img: 'assets/img/cs-cz-champ.webp', kind: 'Photo', who: 'Combat Zone MMA' },
    { vid: 'reel-cz', kind: 'Reel', who: 'Combat Zone MMA' },
  ];

  /* ==================================================================
     RESULT SLIDERS
     ================================================================== */
  const scrubs = [];
  $$('[data-scrub]').forEach((box) => {
    const cfg = SCRUBS[box.dataset.scrub], c = box.closest('.case'), numEl = c && $('.case__num .num', c);
    if (!cfg || !numEl) return;
    const n = cfg.steps.length, max = Math.max(...cfg.steps.map((s) => s[1]));
    const totals = cfg.steps.reduce((acc, s) => { acc.push((acc[acc.length - 1] || 0) + s[1]); return acc; }, []);
    box.innerHTML = `<p class="scrub__hint">Drag to see it build</p>
      <div class="scrub__bars">${cfg.steps.map((s, i) => `<button type="button" class="scrub__bar" data-i="${i}" style="--h:${Math.round(s[1] / max * 78)}" aria-label="${s[0]}">${cfg.short(s[1])}<i></i></button>`).join('')}</div>
      <input class="scrub__range" type="range" min="0" max="${n}" step="any" value="${n}" aria-label="${cfg.steps[0][0].split(' ')[0]}" />
      <div class="scrub__ticks">${cfg.steps.map((s) => `<span>${s[0]}${s[2] ? `<em>${s[2]}</em>` : ''}</span>`).join('')}</div>
      <p class="scrub__say" aria-live="polite"></p>${cfg.approx ? '<p class="scrub__note">Daily split is approximate</p>' : ''}`;
    const range = $('.scrub__range', box), bars = $$('.scrub__bar', box), fills = bars.map((b) => $('i', b)), ticks = $$('.scrub__ticks span', box), say = $('.scrub__say', box);
    let v = n, idx = -1, sayKey = '', raf = null;
    // running total at any point along the slider, not just at the stops
    const totalAt = (x) => { const k = Math.min(n - 1, Math.floor(x)); return (k > 0 ? totals[k - 1] : 0) + cfg.steps[k][1] * Math.min(1, x - k); };
    function draw(x) {
      v = clamp(x, 0, n);
      const last = v >= n - 0.002, i = clamp(Math.ceil(v - 0.002) - 1, 0, n - 1);
      range.style.setProperty('--p', (v / n * 100).toFixed(2) + '%');
      fills.forEach((f, k) => f.style.setProperty('--f', clamp(v - k, 0, 1).toFixed(3)));
      numEl.textContent = last ? cfg.end : cfg.fmt(totalAt(v));
      if (i !== idx) {
        idx = i;
        bars.forEach((b, k) => { b.classList.toggle('is-in', k <= i); b.classList.toggle('is-on', k === i); });
        ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
      }
      const key = i + (last ? 'x' : '');
      if (key !== sayKey) { sayKey = key; say.innerHTML = cfg.say(cfg.steps[i], cfg.steps[i][1], last); }
    }
    // ease the thumb to a position instead of jumping there
    function glide(to, dur, inOut) {
      cancelAnimationFrame(raf);
      if (reduce || document.hidden) { range.value = to; draw(to); return; }
      const from = v, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = inOut ? (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2) : 1 - Math.pow(1 - p, 3);
        const x = from + (to - from) * e;
        range.value = x; draw(x);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    const st = { c, played: false, user: false, play: () => { range.value = 0; draw(0); glide(n, 2400, true); } };
    const touched = () => { st.user = true; };
    range.addEventListener('pointerdown', () => { touched(); cancelAnimationFrame(raf); });
    range.addEventListener('input', () => { touched(); cancelAnimationFrame(raf); draw(+range.value); });
    range.addEventListener('change', () => glide(Math.max(1, Math.round(v)), 340));   // on release it settles on the nearest stop
    range.addEventListener('keydown', (e) => {
      const d = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 0;
      if (!d) return;
      e.preventDefault(); touched(); glide(clamp(Math.round(v) + d, 1, n), 420);
    });
    bars.forEach((b) => b.addEventListener('click', () => { touched(); glide(+b.dataset.i + 1, 560); }));
    ticks.forEach((t, k) => t.addEventListener('click', () => { touched(); glide(k + 1, 560); }));
    draw(n);
    scrubs.push(st);
  });
  // the first time a case comes into view, it builds from zero once
  function playScrubs() {
    scrubs.forEach((st) => {
      if (st.played || !st.c.classList.contains('in')) return;
      st.played = true;
      if (reduce) return;
      setTimeout(() => { if (!st.user) st.play(); }, 250);
    });
  }

  /* ==================================================================
     THE RING: finished reels and photos on a wheel you can turn
     ================================================================== */
  const ring = $('#ring'), rspin = $('#ringSpin');
  let rcards = [], RR = 0, ang = 0, vel = 0, rd = null, lastTouch = 0, ringSeen = false;
  const STEP = 360 / RING.length;
  if (ring && rspin) {
    RING.forEach((it) => {
      const f = mk('figure', 'rcard', rspin);
      if (it.vid) {
        const v = mk('video', '', f);
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.poster = `assets/vid/${it.vid}.webp`; v.dataset.src = `assets/vid/${it.vid}.mp4`;
      } else { const im = mk('img', '', f); im.src = it.img; im.alt = `${it.kind}, ${it.who}`; im.loading = 'lazy'; im.draggable = false; }
      mk('figcaption', '', f, `<i>${it.kind}</i>${it.who}`);
      if (it.vid) mk('span', 'rcard__tap', f, '&#9654;');
      rcards.push({ el: f, vid: $('video', f), dim: -1, on: false });
    });
    ring.addEventListener('pointerdown', (e) => { if (e.button > 0) return; rd = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, on: false }; });
    ring.addEventListener('pointermove', (e) => {
      if (!rd || e.pointerId !== rd.id) return;
      if (!rd.on) {
        if (Math.abs(e.clientX - rd.x) < 6 || Math.abs(e.clientX - rd.x) < Math.abs(e.clientY - rd.y)) return;
        rd.on = true; ring.classList.add('is-drag'); rd.lx = e.clientX;
        try { ring.setPointerCapture(e.pointerId); } catch (_) {}
      }
      const dx = e.clientX - rd.lx; rd.lx = e.clientX;
      ang -= dx * 0.12; vel = -dx * 0.12; lastTouch = performance.now();
    });
    const endR = () => { if (rd && rd.on) { ring.classList.remove('is-drag'); lastTouch = performance.now(); } rd = null; };
    ring.addEventListener('pointerup', endR); ring.addEventListener('pointercancel', endR);
  }
  // Start a reel. Some browsers refuse to start video on their own (Safari in Low Power Mode, data saver),
  // so when that happens the card shows a play button and any click or key press starts it.
  function playCard(c) {
    if (!c.vid.getAttribute('src')) c.vid.src = c.vid.dataset.src;
    const p = c.vid.play();
    if (p && p.then) p.then(() => c.el.classList.remove('needs-tap')).catch(() => { if (c.on) c.el.classList.add('needs-tap'); });
  }
  function unlockVideo() {
    // inside a real click, tap or key press the browser lets video start, and remembers it for that video
    if (ringSeen) rcards.forEach((c) => {
      if (!c.vid) return;
      if (c.on) return playCard(c);
      if (c.primed) return;
      c.primed = true;
      if (!c.vid.getAttribute('src')) c.vid.src = c.vid.dataset.src;
      const p = c.vid.play();
      if (p && p.then) p.then(() => { if (!c.on) c.vid.pause(); }).catch(() => { c.primed = false; });
    });
    // looping clips only: testimonial videos have controls and stay as the viewer left them
    $$('video[autoplay]:not([controls])').forEach((v) => {
      if (!v.paused) return;
      const r = v.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) v.play().catch(() => {});
    });
  }
  ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'].forEach((ev) => addEventListener(ev, unlockVideo, { passive: true }));

  function sizeRing() {
    if (!ring || !rcards.length) return;
    const cw = rcards[0].el.offsetWidth;
    // the cards line the inside of a wheel and you stand in the middle of it
    RR = (cw + 26) / 2 / Math.sin(Math.PI / RING.length);
    rcards.forEach((c, i) => { c.el.style.transform = `rotateY(${i * STEP}deg) translateZ(${(-RR).toFixed(1)}px)`; });
    drawRing();
  }
  function drawRing() {
    if (!ring) return;
    rspin.style.transform = `translateZ(${RR.toFixed(1)}px) rotateY(${ang.toFixed(2)}deg)`;
    rcards.forEach((c, i) => {
      const rel = ((i * STEP + ang) % 360 + 540) % 360 - 180, a = Math.abs(rel);
      const dim = Math.round(clamp((a - 8) / 75, 0, 1) * 72) / 100;
      if (dim !== c.dim) { c.dim = dim; c.el.style.setProperty('--dim', dim); }
      if (!c.vid) return;
      const on = ringSeen && a < 40;
      if (on !== c.on) {
        c.on = on;
        if (on) playCard(c); else { c.vid.pause(); c.el.classList.remove('needs-tap'); }
      }
    });
  }
  function ringFrame() {
    if (!ring) return;
    const r = ring.getBoundingClientRect(), seen = r.bottom > 0 && r.top < innerHeight;
    if (seen !== ringSeen) { ringSeen = seen; if (!seen) rcards.forEach((c) => { if (c.vid && c.on) { c.on = false; c.vid.pause(); } }); }
    if (!seen) return;
    if (!rd || !rd.on) {
      ang += vel; vel *= 0.94;
      if (Math.abs(vel) < 0.03 && !reduce && performance.now() - lastTouch > 1800) ang += 0.05;   // idles slowly until you grab it
    }
    drawRing();
  }

  /* ==================================================================
     HOW IT WORKS: pinned on desktop, scroll moves the steps sideways
     ================================================================== */
  const proc = $('#process'), track = $('#procTrack'), steps = $$('.pstep'), procBar = $('#procBar'), procN = $('#procN');
  const mqProc = matchMedia('(min-width: 961px) and (min-height: 600px)');
  let procPinned = false, travel = 0, procTop = 0, procI = -1;
  function layoutProc() {
    if (!proc || !track) return;
    procPinned = mqProc.matches && !reduce;
    proc.classList.toggle('is-pinned', procPinned);
    track.style.transform = '';
    if (procPinned) {
      const last = steps[steps.length - 1];
      // enough travel to bring the last step to the middle of the screen
      travel = Math.max(0, last.offsetLeft + last.offsetWidth / 2 - innerWidth / 2);
      proc.style.setProperty('--travel', travel + 'px');
    } else { steps.forEach((s) => s.classList.remove('is-on')); procI = -1; }
    procTop = proc.getBoundingClientRect().top + scrollY;
    procScroll();
  }
  function procScroll() {
    if (!procPinned) return;
    const p = clamp((scrollY - procTop) / Math.max(1, travel), 0, 1), x = p * travel;
    track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    if (procBar) procBar.style.setProperty('--p', p.toFixed(4));
    // the step nearest the middle of the screen is the live one
    let best = 0, bd = 1e9;
    steps.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - x - innerWidth / 2); if (d < bd) { bd = d; best = i; } });
    if (best !== procI) {
      procI = best;
      steps.forEach((s, i) => {
        s.classList.toggle('is-on', i === best);
        const v = $('video', s); if (v) { if (i === best) v.play().catch(() => {}); else v.pause(); }
      });
      if (procN) procN.textContent = String(best + 1).padStart(2, '0');
    }
  }

  /* ==================================================================
     NAMES: hover a name and their photo follows the pointer
     ================================================================== */
  const names = $('#names');
  if (names && fine && !reduce) {
    const pic = mk('div', 'names__pic', document.body), img = mk('img', '', pic);
    img.alt = '';
    let tx = 0, ty = 0, x = 0, y = 0, raf = null, live = false;
    const loop = () => {
      const dx = tx - x, dy = ty - y;
      x += dx * 0.16; y += dy * 0.16;
      pic.style.transform = `translate(${(x + 26).toFixed(1)}px, ${(y - 150).toFixed(1)}px) rotate(${clamp(dx * 0.06, -9, 9).toFixed(2)}deg)`;
      raf = live || Math.abs(dx) + Math.abs(dy) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    $$('li', names).forEach((li) => {
      if (li.dataset.img) { const pre = new Image(); pre.src = `assets/img/${li.dataset.img}.webp`; }
      li.addEventListener('pointerenter', (e) => {
        if (!li.dataset.img) { pic.classList.remove('on'); live = false; return; }
        img.src = `assets/img/${li.dataset.img}.webp`;
        if (!live) { x = tx = e.clientX; y = ty = e.clientY; }
        live = true; pic.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      li.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    });
    names.addEventListener('pointerleave', () => { live = false; pic.classList.remove('on'); });
    addEventListener('scroll', () => { if (live) { live = false; pic.classList.remove('on'); } }, { passive: true });
  }

  /* ==================================================================
     QUESTIONS: one open at a time
     ================================================================== */
  $$('.qa').forEach((qa) => {
    const btn = $('.qa__q', qa);
    btn.addEventListener('click', () => {
      const open = !qa.classList.contains('open');
      $$('.qa.open').forEach((o) => { o.classList.remove('open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { qa.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  const firstQa = $('.qa'); if (firstQa) { firstQa.classList.add('open'); $('.qa__q', firstQa).setAttribute('aria-expanded', 'true'); }

  /* ==================================================================
     SPOTLIGHT: a soft gold light under the pointer in every section
     ================================================================== */
  if (fine && !reduce) {
    $$('.sec').forEach((sec) => {
      const spot = mk('i', 'spot', sec);
      sec.addEventListener('pointermove', (e) => {
        const r = sec.getBoundingClientRect();
        spot.style.background = `radial-gradient(560px circle at ${(e.clientX - r.left).toFixed(0)}px ${(e.clientY - r.top).toFixed(0)}px, rgba(201,162,75,.1), transparent 62%)`;
        spot.style.opacity = 1;
      });
      sec.addEventListener('pointerleave', () => { spot.style.opacity = 0; });
    });
  }

  /* ==================================================================
     SCROLL + FRAME LOOP
     ================================================================== */
  const aboutImg = $('.about__pic img');
  function onScroll() {
    procScroll();
    playScrubs();
    if (aboutImg && !reduce) {
      const r = aboutImg.parentNode.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom > 0 && r.top < vh) aboutImg.style.setProperty('--py', (-clamp((vh - r.top) / (vh + r.height), 0, 1) * 14).toFixed(2) + '%');
    }
  }
  let running = false;
  function frame() {
    if (document.hidden) { running = false; return; }
    ringFrame();
    requestAnimationFrame(frame);
  }
  function start() { if (running || document.hidden) return; running = true; requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', () => {
    start();
    // coming back to the tab: try again on any reel that was refused while the page was in the background
    if (!document.hidden) rcards.forEach((c) => { if (c.vid && c.on && c.vid.paused) playCard(c); });
  });

  let rz = null;
  const relayout = () => { sizeRing(); layoutProc(); onScroll(); };
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(relayout, 150); });
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(relayout, 80));
  if (mqProc.addEventListener) mqProc.addEventListener('change', relayout);
  addEventListener('scroll', onScroll, { passive: true });
  relayout();
  start();
})();
