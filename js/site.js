/* ==========================================================================
   PAPERVIEW PRODUCTIONS v2: interactions
   Everything editable (clients, photos, captions) lives in the data blocks
   at the top of this file.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const IMG = (n) => `assets/img/${n}.webp`;
  const CAR = (n) => `assets/carousel/${n}.webp`;
  const VID = (n) => `assets/vid/${n}.mp4`;
  const POSTER = (n) => `assets/vid/${n}.webp`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------
     DATA: the camera
     ------------------------------------------------------------------ */
  const FORMATS = [
    { key: 'photo', label: 'Photo', where: 'Website, ads and print', icon: [26, 18] },
    { key: 'reel', label: 'Reel', where: 'Instagram Reels, TikTok and Shorts', icon: [11, 18] },
    { key: 'carousel', label: 'Carousel', where: 'Instagram and Facebook carousels', icon: [15, 18] },
    { key: 'wide', label: 'Wide', where: 'YouTube, commercials and your website', icon: [30, 17] },
  ];

  const MODES = [
    {
      key: 'combat', label: 'Combat sports', exp: ['1/1000', 'f/2.8', 'ISO 3200'],
      photo: { src: IMG('cs-mcgregor-belt'), ratio: 3 / 2, client: 'Conor McGregor', what: 'Athlete photography' },
      reel: { vid: 'reel-fight', ratio: 9 / 16, client: 'Fight night', what: 'Recap reel' },
      carousel: { slides: [1, 2, 3, 4].map((i) => CAR(`nabjj-${i}`)), ratio: 3 / 4, client: 'North Andover Jiu-Jitsu', what: 'Class carousel' },
      wide: { src: IMG('cs-nfp-punch'), ratio: 16 / 9, client: 'Northeast Fight Promotion', what: 'NFP 1 fight coverage' },
    },
    {
      key: 'blue', label: 'Blue collar', exp: ['1/500', 'f/4', 'ISO 200'],
      photo: { src: IMG('bc-mi-demo-excavator'), ratio: 3 / 2, client: 'Marotte Industrial', what: 'Job site photography' },
      reel: { vid: 'reel-marotte', ratio: 9 / 16, client: 'Marotte Industrial', what: 'Demolition reel' },
      carousel: { slides: [1, 2, 3, 4].map((i) => CAR(`marotte-${i}`)), ratio: 4 / 5, client: 'Marotte Industrial', what: 'Customer education carousel' },
      wide: { src: IMG('bc-lbh-bale-sky'), ratio: 16 / 9, client: 'Long Barn Hay', what: 'Delivery day' },
    },
    {
      key: 'white', label: 'White collar', exp: ['1/200', 'f/2', 'ISO 100'],
      photo: { src: IMG('wc-headshot-2'), ratio: 2 / 3, client: 'Professional headshots', what: 'Studio and on location' },
      reel: { vid: 'reel-realestate', ratio: 9 / 16, client: 'Lucci Witte Team', what: 'Real estate team event reel' },
      carousel: { slides: ['wc-glow-sign', 'wc-glow-cake', 'wc-glow-speech', 'wc-glow-wall'].map(IMG), ratio: 4 / 5, client: 'Ultimate Glow', what: '5 year anniversary' },
      wide: { src: IMG('wc-glow-group'), ratio: 16 / 9, client: 'Ultimate Glow', what: 'Brand event coverage' },
    },
    {
      key: 'events', label: 'Live events', exp: ['1/250', 'f/2.8', 'ISO 6400'],
      photo: { src: IMG('ev-duel-presser'), ratio: 3 / 2, client: 'Duel Arena', what: 'Press conference' },
      reel: { vid: 'reel-duel', ratio: 9 / 16, client: 'Duel Arena', what: 'Fighter arrivals' },
      carousel: { slides: ['cs-bkfc-exchange', 'cs-nfp-arms-raised', 'ev-dbx6-arena', 'cs-bkfc-ropes'].map(IMG), ratio: 4 / 5, client: 'BKFC, NFP, Dirty Boxing', what: 'Fight night coverage' },
      wide: { vid: 'wide-duel', ratio: 16 / 9, client: 'Duel Arena', what: 'Kia Center, Orlando' },
    },
  ];

  /* ------------------------------------------------------------------
     DATA: services
     ------------------------------------------------------------------ */
  const SERVICES = [
    {
      h: 'We bring the cameras to where the work happens.',
      p: 'Job sites, gyms, offices and arenas. Photo and video that gets used, not filed away.',
      li: ['Reels and short video', 'Commercials and brand films', 'Job site and event photography', 'Headshots and team photos', 'Athlete portraits and hype shoots', 'Fight week and live event coverage', 'Drone footage', 'Testimonial videos'],
      how: 'Monthly or one shoot at a time', proof: '200+ athletes and dozens of job sites, gyms and offices in front of our cameras.',
      vis: { img: IMG('founder') },
    },
    {
      h: 'We run the pages so you can run the business.',
      p: 'A plan for the month, posts going out on schedule, and one team that owns it from the shoot to the caption.',
      li: ['Monthly content plan and posting', 'A calendar: what goes out, when and why', 'Carousels, reels and captions', 'Replies, comments and community', 'Instagram, Facebook, TikTok and YouTube', 'Event day posting while it is happening'],
      how: 'Monthly', proof: 'We ran the social media for Dirty Boxing Championship 6 and Combat Zone MMA.',
      vis: { vid: 'reel-lbh' },
    },
    {
      h: 'Every post has a job: bring in money.',
      p: 'Views are a tool. The goal is calls, booked work, new members and tickets sold. That is how Marotte Industrial booked $150,000+ in three months.',
      li: ['Content strategy: what to make and who it is for', 'Offers and campaigns built around what you sell', 'Websites that turn visitors into leads', 'Event promotion that sells seats and pay per view', 'Looking at what came back, then doing more of it'],
      how: 'Monthly or by the project', proof: '$150,000+ in new business for Marotte Industrial. 75M views for Duel Arena.',
      vis: { img: IMG('bc-mi-site-talk') },
    },
  ];

  /* ------------------------------------------------------------------
     DATA: industries
     ------------------------------------------------------------------ */
  const INDUSTRIES = {
    combat: {
      name: ['Combat', 'sports'],
      lede: 'Promotions, gyms and fighters. We cover fight week from the press conference to the walkout, cut the reels and run the pages.',
      stat: ['75M', 'views for Duel Arena in under a week, and 200+ athletes in front of our cameras.'],
      tag: 'Monthly, plus event coverage',
      how: [
        ['The problem', 'A fight card is only news for about a week. Content that shows up late gets no views.'],
        ['What we do', 'Cover the press conference, the weigh-ins, the arrivals and the fights. Cut it that night and run the pages while it is still happening.'],
        ['What comes back', 'Views that sell tickets and pay per view, and fighters and sponsors who want to be on the next card.'],
      ],
      feat: [
        ['ev-duel-presser', 'Duel Arena', '75M views in under a week. Kia Center, Orlando.'],
        ['ev-dbx6-arena', 'Dirty Boxing Championship 6', 'We ran the social media for the event.'],
        ['cs-nfp-punch', 'Northeast Fight Promotion', 'Fight coverage for NFP 1 and the promotion website.'],
        ['cs-nabjj-kattar', 'North Andover Jiu-Jitsu', 'Class carousels and shoots, including an MMA class with Calvin Kattar.'],
      ],
      faces: [['jon-jones', 'Jon Jones'], ['conor-mcgregor', 'Conor McGregor'], ['mike-perry', 'Mike Perry'], ['calvin-kattar', 'Calvin Kattar'], ['dillon-danis', 'Dillon Danis'], ['rob-font', 'Rob Font']],
      lists: [
        ['Promotions and events', ['Duel Arena', 'Dirty Boxing Championship', 'Combat Zone MMA', 'BKFC', 'Northeast Fight Promotion', 'ADCC', 'NAGA', 'Golden Gloves', 'Fuji Grappling', 'Grappling Industries', 'King of the Mat', 'PGF']],
        ['Gyms and brands', ['North Andover Jiu-Jitsu', 'Broadway Jiu-Jitsu', 'Precision Jiu-Jitsu', 'Team Link', 'Kingsway', 'Off-Season', 'Ruthless Syndicate']],
        ['Also on our cameras', ['Gordon Ryan', 'John Danaher', 'Kyle Bochniak', 'James Murrin', 'Stitch Duran']],
      ],
      shots: [
        ['cs-nfp-arms-raised', 'Northeast Fight Promotion', 'NFP 1'], ['cs-bkfc-exchange', 'BKFC', 'Mohegan Sun'], ['cs-murrin-bag', 'James Murrin', 'Hype shoot'],
        ['ev-dbx6-arena', 'Dirty Boxing Championship', 'DBX 6'], ['cs-nabjj-class', 'North Andover Jiu-Jitsu', 'Calvin Kattar class'], ['cs-nfp-red', 'Northeast Fight Promotion', 'NFP 1'],
        ['cs-kattar-sig', 'Calvin Kattar', 'Training day'], ['cs-bkfc-ropes', 'BKFC', 'Mohegan Sun'], ['cs-murrin-mitts', 'James Murrin', 'Hype shoot'],
        ['ev-duel-namecard', 'Duel Arena', 'Press conference'], ['cs-nfp-blue', 'Northeast Fight Promotion', 'NFP 1'], ['cs-nabjj-kattar', 'North Andover Jiu-Jitsu', 'Calvin Kattar class'],
        ['cs-nfp-winner', 'Northeast Fight Promotion', 'NFP 1'],
      ],
    },
    blue: {
      name: ['Blue', 'collar'],
      lede: 'Contractors, trades and farms. We show up on the job, shoot the real work and turn it into posts that make the phone ring.',
      stat: ['$150K+', 'in new business for Marotte Industrial within 3 months of working with us.'],
      tag: 'Monthly, or by the project',
      how: [
        ['The problem', 'The work is good but nobody sees it. Customers call whoever looks the most trustworthy online.'],
        ['What we do', 'Show up on the job, shoot the real work and the real crew, and turn it into reels, carousels and before and after posts.'],
        ['What comes back', 'Calls for the kind of jobs you want. Marotte Industrial booked $150,000+ in three months.'],
      ],
      feat: [
        ['bc-mi-skidsteer-dig', 'Marotte Industrial', '$150,000+ in new business within 3 months.'],
        ['bc-lbh-bale-toss', 'Long Barn Hay', 'Delivery days and life on the farm, shot for social.'],
        ['bc-si-chimney-liner', 'Sam & Ivan Chimney Guys', 'On the roof for a chimney liner install.'],
        ['bc-gc-owner-wash', 'G&C Softwash', 'House wash shoot with the owner and the crew.'],
      ],
      lists: [
        ['Businesses we have worked with', ['Marotte Industrial', 'Long Barn Hay', 'G&C Softwash', 'Sam & Ivan Chimney Guys', 'ACE Cleanouts', 'Merrimack Valley Roofing & Gutters', 'Seacoast Cabinets', 'Rebel Electric', 'Fox Gutter Cleaning', 'Anchor Auto Body']],
        ['What we make for the trades', ['Job site reels', 'Customer education carousels', 'Before and after', 'Owner and crew photos', 'Commercials', 'Websites']],
      ],
      shots: [
        ['bc-mi-skidsteer-dig', 'Marotte Industrial', 'Foundation dig'], ['bc-lbh-bale-toss', 'Long Barn Hay', 'Delivery'], ['bc-gc-owner-wash', 'G&C Softwash', 'House wash'],
        ['bc-mi-stone-dump', 'Marotte Industrial', 'Stone drop'], ['bc-si-chimney-liner', 'Sam & Ivan Chimney Guys', 'Liner install'], ['bc-ace-crew', 'ACE Cleanouts', 'Cleanout day'],
        ['bc-mi-hydrant-flush', 'Marotte Industrial', 'Hydrant flush'], ['bc-lbh-bulldog-bale', 'Long Barn Hay', 'The farm dog'], ['bc-seacoast-vanity', 'Seacoast Cabinets', 'Finished vanity'],
        ['bc-rebel-electric', 'Rebel Electric', 'Owner headshot'], ['bc-mi-carry-overhead', 'Marotte Industrial', 'On site'], ['bc-gc-crew', 'G&C Softwash', 'The crew'],
        ['bc-lbh-elevator-load', 'Long Barn Hay', 'Loading the loft'], ['bc-ace-truck', 'ACE Cleanouts', 'The truck'], ['bc-mi-excavator-woods', 'Marotte Industrial', 'Site leveling'],
        ['bc-si-crew', 'Sam & Ivan Chimney Guys', 'The crew'], ['bc-lbh-cowboy-portrait', 'Long Barn Hay', 'End of the haul'],
      ],
    },
    white: {
      name: ['White', 'collar'],
      lede: 'Real estate teams, med spas, offices and brands. Headshots that look like you on your best day, video that explains what you do, and events covered from setup to the last toast.',
      stat: ['223', 'finished photos delivered from one evening at the Ultimate Glow anniversary.'],
      tag: 'Monthly, by the project, or one shoot',
      how: [
        ['The problem', 'Every office says it is the best in town. Stock photos and phone pictures say otherwise.'],
        ['What we do', 'Headshots, team and event coverage, and video that explains what you do in plain words.'],
        ['What comes back', 'A brand that looks as good as the service, with photos and video ready for the website, the listings and the feed.'],
      ],
      feat: [
        ['wc-glow-group', 'Ultimate Glow', '223 finished photos from their 5 year anniversary.'],
        ['wc-headshot-2', 'Professional headshots', 'In studio or on location, for owners and teams.'],
        ['wc-glow-speech', 'Brand and team events', 'Covered from setup to the last toast.'],
        ['wc-family', 'Family sessions', 'Portraits you book once. No contract.'],
      ],
      lists: [
        ['Businesses we have worked with', ['Lucci Witte Team', 'Ultimate Glow', 'Xcaliber', 'Tuscan Market']],
        ['What we make for offices and brands', ['Professional headshots', 'Real estate and listing video', 'Brand and team events', 'Testimonial videos', 'Family and portrait sessions']],
      ],
      shots: [
        ['wc-headshot-2', 'Professional headshots', 'On location'], ['wc-glow-cake', 'Ultimate Glow', '5 year anniversary'], ['wc-headshot-3', 'Professional headshots', 'Outdoor'],
        ['wc-glow-group', 'Ultimate Glow', 'The team'], ['wc-glow-speech', 'Ultimate Glow', 'The toast'], ['wc-headshot-1', 'Professional headshots', 'On location'],
        ['wc-glow-sign', 'Ultimate Glow', 'Event details'], ['wc-glow-wall', 'Ultimate Glow', 'Guest photos'], ['wc-family', 'Family session', 'Portraits'], ['wc-glow-spread', 'Ultimate Glow', 'Event details'],
      ],
    },
  };

  /* ------------------------------------------------------------------
     DATA: proof videos
     ------------------------------------------------------------------ */
  const PROOF = [
    { name: 'Jon Jones', role: 'UFC champion', vid: 'assets/vid/jon-jones-shoutout.mp4', poster: IMG('poster-jon-jones') },
    { name: 'Rob Font', role: 'UFC bantamweight', vid: 'assets/vid/rob-font-testimonial.mp4', poster: IMG('poster-rob-font') },
    { name: 'Kyle Bochniak', role: 'UFC veteran', vid: 'assets/vid/kyle-bochniak-testimonial.mp4', poster: IMG('poster-kyle-bochniak') },
  ];

  const WEB3FORMS_KEY = '245e6ec5-3dd2-4db7-847d-31c0a436d41a';

  /* ==================================================================
     THE CAMERA
     ================================================================== */
  const cam = $('#cam'), lcd = $('#lcd'), frame = $('#lcdFrame'), lcdBg = $('#lcdBg');
  const af = $('#af'), knob = $('#knob'), modeList = $('#modeList'), fmtList = $('#fmtList');
  let mode = 0, fmt = 0, slide = 0, shots = 0, userTook = false, carTimer = null, clockTimer = null, clockSec = 0;
  const KNOB_ANGLES = [33, 11, -11, -33];

  MODES.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = 'mode__b'; b.textContent = m.label; b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { took(); setMode(i); });
    modeList.appendChild(b);
  });
  FORMATS.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'fmt__b'; b.setAttribute('role', 'tab');
    b.innerHTML = `<i style="width:${f.icon[0]}px;height:${f.icon[1]}px"></i>${f.label}`;
    b.addEventListener('click', () => { took(); setFmt(i); });
    fmtList.appendChild(b);
  });

  const current = () => MODES[mode][FORMATS[fmt].key];
  const thumbOf = (it) => it.slides ? it.slides[slide] : it.vid ? POSTER(it.vid) : it.src;
  const ratioLabel = (r) => r > 1.7 ? '16:9' : r > 1.4 ? '3:2' : r > 0.78 ? '4:5' : r > 0.7 ? '3:4' : r > 0.6 ? '2:3' : '9:16';

  function sizeFrame(r) {
    const stage = 3 / 2;
    if (r >= stage) { frame.style.width = '100%'; frame.style.height = (stage / r * 100) + '%'; }
    else { frame.style.height = '100%'; frame.style.width = (r / stage * 100) + '%'; }
  }

  function render() {
    const it = current(), f = FORMATS[fmt], m = MODES[mode];
    clearInterval(carTimer); clearInterval(clockTimer); slide = 0;
    sizeFrame(it.ratio);
    lcdBg.style.backgroundImage = `url("${thumbOf(it)}")`;
    frame.innerHTML = '';

    if (it.slides) {
      const car = document.createElement('div'); car.className = 'car';
      car.innerHTML = `<div class="car__track">${it.slides.map((s) => `<img src="${s}" alt="" draggable="false">`).join('')}</div>
        <button class="car__arrow car__arrow--p" aria-label="Previous slide">&#9664;</button>
        <button class="car__arrow car__arrow--n" aria-label="Next slide">&#9654;</button>
        <div class="car__dots">${it.slides.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
      frame.appendChild(car);
      const go = (n) => {
        slide = (n + it.slides.length) % it.slides.length;
        $('.car__track', car).style.transform = `translateX(${-slide * 100}%)`;
        $$('.car__dots i', car).forEach((d, i) => d.classList.toggle('on', i === slide));
      };
      $('.car__arrow--p', car).addEventListener('click', (e) => { e.stopPropagation(); took(); go(slide - 1); });
      $('.car__arrow--n', car).addEventListener('click', (e) => { e.stopPropagation(); took(); go(slide + 1); });
      let sx = null;
      car.addEventListener('pointerdown', (e) => { sx = e.clientX; });
      car.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 30) { took(); go(slide + (e.clientX < sx ? 1 : -1)); } sx = null; });
      carTimer = setInterval(() => go(slide + 1), 2400);
    } else if (it.vid) {
      const v = document.createElement('video');
      v.className = 'm'; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
      v.poster = POSTER(it.vid); v.src = VID(it.vid);
      frame.appendChild(v);
      v.play().catch(() => {});
      if (f.key === 'reel') {
        const bar = document.createElement('div'); bar.className = 'reelbar'; bar.innerHTML = '<i></i>';
        frame.appendChild(bar);
        v.addEventListener('timeupdate', () => { if (v.duration) bar.firstChild.style.width = (v.currentTime / v.duration * 100) + '%'; });
      }
    } else {
      const img = document.createElement('img');
      img.className = 'm'; img.alt = `${it.client}, ${it.what}`; img.src = it.src;
      frame.appendChild(img);
    }

    // HUD
    $('#hudClient').textContent = it.client;
    $('#hudWhat').textContent = it.what;
    $('#hudWhere').textContent = f.where;
    $('#hudFmt').textContent = `${f.label.toUpperCase()} ${ratioLabel(it.ratio)}`;
    $('#hudSS').textContent = m.exp[0]; $('#hudAp').textContent = m.exp[1]; $('#hudIso').textContent = m.exp[2];
    $('#hudNeedle').style.left = (30 + Math.random() * 40) + '%';
    const live = Boolean(it.vid);
    $('#hudRec').textContent = live ? 'REC' : 'STBY';
    $('#hudRec').classList.toggle('live', live);
    $('#camLamp').classList.toggle('on', live);
    clockSec = 0; tickClock();
    if (live) clockTimer = setInterval(() => { clockSec++; tickClock(); }, 1000);

    $$('.mode__b', modeList).forEach((b, i) => { b.classList.toggle('is-on', i === mode); b.setAttribute('aria-selected', i === mode); });
    $$('.fmt__b', fmtList).forEach((b, i) => { b.classList.toggle('is-on', i === fmt); b.setAttribute('aria-selected', i === fmt); });
    knob.style.transform = `rotate(${KNOB_ANGLES[mode]}deg)`;
    window.dispatchEvent(new CustomEvent('pv:render', { detail: { thumb: thumbOf(it) } }));
  }
  function tickClock() {
    const s = String(clockSec % 60).padStart(2, '0'), mm = String(Math.floor(clockSec / 60)).padStart(2, '0');
    $('#hudClock').textContent = `00:${mm}:${s}`;
  }
  const setMode = (i) => { mode = (i + MODES.length) % MODES.length; render(); };
  const setFmt = (i) => { fmt = (i + FORMATS.length) % FORMATS.length; render(); };
  const took = () => { userTook = true; };

  // drag the knob up and down to change mode
  let knobDrag = false;
  knob.addEventListener('pointerdown', (e) => { knobDrag = true; knob.setPointerCapture(e.pointerId); took(); });
  knob.addEventListener('pointermove', (e) => {
    if (!knobDrag) return;
    const r = modeList.getBoundingClientRect();
    const i = Math.max(0, Math.min(MODES.length - 1, Math.floor((e.clientY - r.top) / (r.height / MODES.length))));
    if (i !== mode) setMode(i);
  });
  const endKnob = () => { knobDrag = false; };
  knob.addEventListener('pointerup', endKnob); knob.addEventListener('pointercancel', endKnob);
  knob.addEventListener('click', () => { if (!knobDrag) { took(); setMode(mode + 1); } });

  $('#prev').addEventListener('click', () => { took(); step(-1); });
  $('#next').addEventListener('click', () => { took(); step(1); });
  function step(d) { // walks every format of every mode
    let f = fmt + d, m = mode;
    if (f >= FORMATS.length) { f = 0; m++; } else if (f < 0) { f = FORMATS.length - 1; m--; }
    mode = (m + MODES.length) % MODES.length; fmt = f; render();
  }

  cam.addEventListener('keydown', (e) => {
    const onButton = e.target.closest('button');
    if (e.key === 'ArrowDown') { e.preventDefault(); took(); setMode(mode + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); took(); setMode(mode - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); took(); setFmt(fmt + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); took(); setFmt(fmt - 1); }
    else if ((e.key === ' ' || e.key === 'Enter') && !onButton) { e.preventDefault(); took(); shoot(); }
  });

  // autofocus box + parallax inside the LCD
  let afIdle;
  lcd.addEventListener('pointermove', (e) => {
    const r = lcd.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    af.style.left = (x * 100) + '%'; af.style.top = (y * 100) + '%';
    af.classList.remove('locked');
    frame.style.setProperty('--px', ((0.5 - x) * 2.4) + '%'); frame.style.setProperty('--py', ((0.5 - y) * 2.4) + '%');
    clearTimeout(afIdle); afIdle = setTimeout(() => af.classList.add('locked'), 240);
  });
  lcd.addEventListener('pointerleave', () => { af.style.left = '50%'; af.style.top = '50%'; af.classList.add('locked'); frame.style.setProperty('--px', '0'); frame.style.setProperty('--py', '0'); });
  lcd.addEventListener('click', (e) => { if (!e.target.closest('.car__arrow')) { took(); shoot(); } });

  // the 3D body, its rotation and the lens live in fx.js

  // the shutter
  const rollStrip = $('#rollStrip');
  for (let i = 0; i < 6; i++) { const c = document.createElement('div'); c.className = 'roll__cell'; rollStrip.appendChild(c); }
  let shooting = false;
  function shoot() {
    if (shooting) return; shooting = true;
    const it = current(), blades = $('#blades'), flash = $('#flash');
    blades.classList.add('shut');
    setTimeout(() => {
      blades.classList.remove('shut');
      flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
      const cell = rollStrip.children[shots % 6];
      cell.innerHTML = `<img src="${thumbOf(it)}" alt=""><span>${MODES[mode].label.split(' ')[0]} · ${FORMATS[fmt].label}</span>`;
      shots++;
      window.dispatchEvent(new CustomEvent('pv:shoot', { detail: { src: thumbOf(it), cell } }));
      $('#shotCount').textContent = String(shots).padStart(3, '0');
      $('#rollNote').innerHTML = shots < 3
        ? `${shots} on the roll. Try another mode or format.`
        : `${shots} frames on the roll. Now picture your business in them. <a href="#contact">Start a project</a>`;
      shooting = false;
    }, 130);
  }
  $('#shutter').addEventListener('click', () => { took(); shoot(); });

  // demo loop until someone touches the camera
  setInterval(() => {
    if (userTook || document.hidden) return;
    const r = cam.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    step(1);
  }, 4200);
  render();

  /* ==================================================================
     RESULTS: case viewers
     ================================================================== */
  $$('.case').forEach((c) => {
    const view = $('.case__view', c), tabs = $$('.chip', c);
    const show = (b) => {
      tabs.forEach((t) => t.classList.toggle('is-on', t === b));
      view.innerHTML = '';
      let el;
      if (b.dataset.kind === 'vid') {
        el = document.createElement('video');
        el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true; el.preload = 'metadata';
        el.poster = b.dataset.poster; el.src = b.dataset.src; el.play().catch(() => {});
      } else { el = document.createElement('img'); el.src = b.dataset.src; el.alt = b.textContent; el.loading = 'lazy'; }
      if (b.dataset.fit === 'contain') el.className = 'contain';
      view.appendChild(el);
    };
    tabs.forEach((b) => b.addEventListener('click', () => show(b)));
    show(tabs[0]);
  });

  /* ==================================================================
     SERVICES + FLOW
     ================================================================== */
  const svcPanel = $('#svcPanel'), svcTabs = $$('.svc__tab');
  function showSvc(i) {
    const s = SERVICES[i];
    svcTabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); });
    const vis = s.vis.vid
      ? `<video muted loop playsinline autoplay preload="metadata" poster="${POSTER(s.vis.vid)}" src="${VID(s.vis.vid)}"></video>`
      : `<img src="${s.vis.img}" alt="" loading="lazy">`;
    svcPanel.innerHTML = `<div class="svc__txt"><span class="svc__how">${s.how}</span><h3>${s.h}</h3><p>${s.p}</p><ul>${s.li.map((l) => `<li>${l}</li>`).join('')}</ul><p class="svc__proof">${s.proof}</p></div><div class="svc__vis">${vis}</div>`;
    const v = $('video', svcPanel); if (v) v.play().catch(() => {});
  }
  svcTabs.forEach((t, i) => { t.addEventListener('click', () => showSvc(i)); t.addEventListener('mouseenter', () => { if (finePointer) showSvc(i); }); });
  showSvc(0);

  const flowSteps = $$('.flow__step'), beam = $('#flowBeam');
  let flowI = 0, flowUser = false;
  function setFlow(i) {
    if (!beam) return;
    flowI = i;
    flowSteps.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
    beam.style.width = ((i + 1) * 25) + '%';
  }
  flowSteps.forEach((s, i) => { s.addEventListener('click', () => { flowUser = true; setFlow(i); }); s.addEventListener('mouseenter', () => { if (finePointer) { flowUser = true; setFlow(i); } }); });
  setInterval(() => { if (!flowUser && !document.hidden) setFlow((flowI + 1) % 4); }, 1900);

  /* ==================================================================
     INDUSTRIES
     ================================================================== */
  const indStage = $('#indStage'), indBtns = $$('.indnav__b');
  let lbSet = [], lbI = 0;
  function showInd(key) {
    const d = INDUSTRIES[key];
    indBtns.forEach((b) => { const on = b.dataset.ind === key; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    lbSet = d.shots.map(([n, c, w]) => ({ src: IMG(n), cap: `${c} · ${w}` }));
    indStage.innerHTML = `
      <div class="ind__in">
        <div class="wrap">
          <div class="ind__top">
            <div>
              <h3 class="ind__name">${d.name[0]} <em>${d.name[1]}</em></h3>
              <p class="ind__lede">${d.lede}</p>
              <span class="ind__tag">How we work together: ${d.tag}</span>
            </div>
            <div>
              <div class="ind__stat"><b>${d.stat[0]}</b><span>${d.stat[1]}</span></div>
              <div class="ind__lists">${d.lists.map(([h, items]) => `<div class="ind__list"><h4>${h}</h4><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>
            </div>
          </div>
          <div class="ind__how">${d.how.map(([h, t], i) => `<div class="how"><h4><i>0${i + 1}</i>${h}</h4><p>${t}</p></div>`).join('')}</div>
          <p class="ind__h">Featured work</p>
          <div class="ind__feat">${d.feat.map(([n, c, t]) => `<figure class="feat" style="margin:0"><img src="${IMG(n)}" alt="${c}" loading="lazy"><div><b>${c}</b><span>${t}</span></div></figure>`).join('')}</div>
          ${d.faces ? `<p class="ind__h">Athletes we have shot</p><div class="faces">${d.faces.map(([n, name]) => `<figure class="face" style="margin:0"><img src="${IMG('ath-' + n)}" alt="${name}" loading="lazy"><b>${name}</b></figure>`).join('')}</div>` : ''}
        </div>
        <div class="strip">
          <p class="strip__hint"><span>Drag the film. Click a frame to open it.</span><span>${d.shots.length} frames</span></p>
          <div class="strip__rail">${d.shots.map(([n, c, w], i) => `<figure class="shot" data-i="${i}" style="margin:0" tabindex="0"><img src="${IMG(n)}" alt="${c}, ${w}" loading="lazy" draggable="false"><figcaption><i>${c}</i><span>${w}</span></figcaption></figure>`).join('')}</div>
        </div>
      </div>`;
    wireRail($('.strip__rail', indStage));
    wireTilt($$('.face', indStage));
    window.dispatchEvent(new CustomEvent('pv:ind'));
  }
  // fx.js wraps the swap in an iris wipe when it is loaded
  indBtns.forEach((b) => b.addEventListener('click', () => {
    if (b.classList.contains('is-on')) return;
    if (window.pvSwapInd) window.pvSwapInd(() => showInd(b.dataset.ind)); else showInd(b.dataset.ind);
  }));

  function wireRail(rail) {
    let down = false, moved = 0, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) { rail.classList.add('drag'); rail.scrollLeft = sl - dx; }
    });
    window.addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', (e) => { const s = e.target.closest('.shot'); if (s && moved < 6) openLb(+s.dataset.i); });
    rail.addEventListener('keydown', (e) => { const s = e.target.closest('.shot'); if (s && e.key === 'Enter') openLb(+s.dataset.i); });
    rail.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && e.shiftKey) { rail.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  }
  function wireTilt(els) {
    if (!finePointer || reduce) return;
    els.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  showInd('combat');

  /* lightbox */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  function openLb(i) { lbI = (i + lbSet.length) % lbSet.length; lbImg.src = lbSet[lbI].src; lbImg.alt = lbSet[lbI].cap; lbCap.textContent = lbSet[lbI].cap; lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', () => openLb(lbI - 1));
  $('#lbN').addEventListener('click', () => openLb(lbI + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb__fig')) closeLb(); });
  window.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') openLb(lbI - 1); else if (e.key === 'ArrowRight') openLb(lbI + 1);
  });

  /* ==================================================================
     PROOF videos (click to load, so the page stays light)
     ================================================================== */
  $('#proofGrid').innerHTML = PROOF.map((p, i) => `
    <div class="pv reveal" data-i="${i}" tabindex="0" role="button" aria-label="Play ${p.name} video">
      <img src="${p.poster}" alt="${p.name}" loading="lazy">
      <span class="pv__play">&#9654;</span>
      <div class="pv__meta"><b>${p.name}</b><span>${p.role}</span></div>
    </div>`).join('');
  $$('.pv').forEach((el) => {
    const play = () => {
      if (el.classList.contains('playing')) return;
      $$('.pv video').forEach((v) => v.pause());
      const p = PROOF[+el.dataset.i], v = document.createElement('video');
      v.src = p.vid; v.controls = true; v.playsInline = true; v.autoplay = true;
      el.appendChild(v); el.classList.add('playing'); v.play().catch(() => {});
    };
    el.addEventListener('click', play);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });

  /* ==================================================================
     CONTACT FORM (Web3Forms)
     ================================================================== */
  const form = $('#form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#formErr'), btn = $('#formSend');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    data.append('access_key', WEB3FORMS_KEY);
    data.append('from_name', 'Paperview Productions website');
    data.append('subject', `New inquiry: ${data.get('industry') || 'General'} from ${data.get('name')}`);
    data.append('replyto', data.get('email'));
    btn.disabled = true; btn.textContent = 'Sending'; err.hidden = true;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, signal: ctl.signal });
      clearTimeout(t);
      const json = await res.json();
      if (!json.success) throw new Error('rejected');
      form.hidden = true; $('#formDone').hidden = false;
    } catch (_) {
      err.innerHTML = 'That did not send. Try again, or email <a href="mailto:conor.hews@gmail.com">conor.hews@gmail.com</a>.';
      err.hidden = false; btn.disabled = false; btn.textContent = 'Send it';
    }
  });

  /* ==================================================================
     PAGE CHROME: nav, timecode, reveals, counters, reticle
     ================================================================== */
  const nav = $('#nav'), burger = $('#burger'), navLinks = $('#navLinks'), tc = $('#timecode');
  burger.addEventListener('click', () => { const o = navLinks.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));
  $('#yr').textContent = new Date().getFullYear();

  const sections = ['results', 'services', 'process', 'industries', 'proof', 'about', 'faq', 'contact'].map((id) => $('#' + id)).filter(Boolean);
  const counted = new WeakSet();
  function countUp(el) {
    const to = +el.dataset.to, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce || document.hidden) return;
    const t0 = performance.now(), dur = 1700;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1), v = Math.round((1 - Math.pow(1 - p, 3)) * to);
      el.textContent = pre + v.toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function onScroll() {
    const y = scrollY, vh = innerHeight;
    nav.classList.toggle('scrolled', y > 20);
    // timecode: 24 frames per second, one "second" per 96px scrolled
    const fr = Math.floor(y / 4), f = fr % 24, s = Math.floor(fr / 24) % 60, m = Math.floor(fr / 1440) % 60;
    tc.textContent = `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    $$('.reveal:not(.in)').forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.9) el.classList.add('in'); });
    $$('.count').forEach((el) => { if (!counted.has(el) && el.getBoundingClientRect().top < vh * 0.85) { counted.add(el); countUp(el); } });
    let here = null;
    sections.forEach((sec) => { if (sec.getBoundingClientRect().top < vh * 0.45) here = sec.id; });
    $$('a', navLinks).forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + here));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // AF reticle that trails the pointer and locks on anything clickable
  if (finePointer && !reduce) {
    const ret = $('#reticle');
    let tx = 0, ty = 0, x = 0, y = 0, raf = null;
    const loop = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      ret.style.transform = `translate(${x}px, ${y}px)`;
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : null;
    };
    addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY; ret.classList.add('on');
      ret.classList.toggle('lock', Boolean(e.target.closest('a, button, .shot, .face, .pv, input, textarea, label')));
      ret.style.display = e.target.closest('.lcd') ? 'none' : '';
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener('pointerleave', () => ret.classList.remove('on'));

    // gold buttons pull slightly toward the pointer
    $$('.btn--gold').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
})();
