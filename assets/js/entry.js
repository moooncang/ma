import {noteMarkup} from './entry-notes.js?v=perf-3';
import {preloadSamples, createEntranceSound} from './entry-audio.js?v=impact-5';

/* Entrance controller. No external services, autoplay or duplicated home markup. */
(() => {
  const entry = document.getElementById('entry');
  const start = document.getElementById('entry-start');
  const skip = document.getElementById('entry-skip');
  const site = document.getElementById('site');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lifetime = new AbortController();
  let phase = 'idle', scene = null, sound = null, finished = false;
  let seed = 71;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const setPhase = value => { phase = value; entry.dataset.phase = value; };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  // Gradually tighten the phrase, from the opening key to the final chord.
  const cueGaps = [1200, 1200, 900, 600, 450];
  let samples = reduced.matches ? null : preloadSamples(lifetime.signal);
  start.querySelector('.note-art').innerHTML = noteMarkup('eighth');

  // The same page layout exists in both the GPU renderer and its CSS fallback.
  const mobile = innerWidth < 700;
  const layout = Array.from({length:mobile ? 14 : 18}, (_, i) => ({
    // Buried pages cover the desk; upper pages are genuinely scattered, not a grid.
    x: i < 6 ? (i % 3) * .5 + (random()-.5)*.2 : -.08 + random()*1.16,
    y: i < 6 ? Math.floor(i/3)*.65+.18 : -.12 + random()*1.24,
    angle: (random() * 2 - 1) * Math.PI,
    scale: .78 + random() * .48,
    mobile,
    delay: i * .018 + random() * .19,
    direction: random() > .43 ? 1 : -1,
    random: random()
  }));
  for (const [i, sheet] of layout.entries()) {
    const el = document.createElement('i');
    el.className = 'entry-paper';
    el.style.cssText = `--x:${sheet.x*100}%;--y:${sheet.y*100}%;--r:${-sheet.angle}rad;--w:max(${(mobile?90:39)*sheet.scale}vw,${(mobile?43:63)*sheet.scale}vh);--h:max(${(mobile?90:39)*sheet.scale*1.414}vw,${(mobile?43:63)*sheet.scale*1.414}vh);--delay:${sheet.delay}s;--direction:${sheet.direction}`;
    // Absolute URLs also work under a GitHub Pages repository subpath.
    el.style.setProperty('--score', `url('${new URL(`assets/entry/cache/score-${i%12+1}.webp`, location.href)}')`);
    document.getElementById('paper-fallback').append(el);
  }
  if (!reduced.matches) {
    import('./entry-scene.js?v=ripple-7').then(module => module.createPaperScene(document.getElementById('paper-scene'), layout, lifetime.signal)).then(renderer => {
      if (finished || reduced.matches || phase === 'flight') return renderer.dispose();
      scene = renderer;
      entry.classList.add('has-webgl');
      // Keep the already visible papers underneath until the GPU fade-in ends.
      const markSettled = () => {
        if (!finished && entry.classList.contains('has-webgl')) entry.classList.add('webgl-settled');
      };
      document.getElementById('paper-scene').addEventListener('transitionend', event => {
        if (event.propertyName === 'opacity') markSettled();
      }, {signal:lifetime.signal});
      const settleTimer = setTimeout(markSettled, 420);
      lifetime.signal.addEventListener('abort', () => clearTimeout(settleTimer), {once:true});
    }).catch(() => { /* CSS papers remain usable when WebGL is unavailable. */ });
  }
  document.getElementById('paper-scene').addEventListener('webglcontextlost', event => {
    event.preventDefault();
    entry.classList.remove('has-webgl','webgl-settled');
    scene?.dispose(); scene = null;
  }, {signal:lifetime.signal});

  let particles = null;
  if (!reduced.matches) import('./entry-particles.js?v=ripple-7').then(async ({createParticles}) => {
    if (!finished && !reduced.matches && phase !== 'flight') {
      particles = await createParticles(document.getElementById('entry-atmosphere'), lifetime.signal);
      if (finished || reduced.matches) { particles?.dispose(); particles=null; return; }
      if (particles) {
        entry.classList.add('has-particle-notes');
        if (phase === 'intro' || phase === 'playing' || phase === 'tutti') particles.begin();
        if (entry.classList.contains('entry-gathering')) particles.gather();
      }
    }
  }).catch(() => {});
  const instruments = [
    {x:24,y:29,symbol:'eighth',type:'violin'},
    {x:75,y:25,symbol:'beamed',type:'piano'},
    {x:29,y:73,symbol:'quarter',type:'cello'},
    {x:77,y:70,symbol:'sixteenth',type:'flute'}
  ].map(instrument => {
    const light = document.createElement('i');
    light.className = 'voice-light';
    const glyph = document.createElement('div');
    glyph.className = 'voice-note';
    glyph.innerHTML = noteMarkup(instrument.symbol);
    for (const el of [light, glyph]) el.style.cssText = `--x:${instrument.x}%;--y:${instrument.y}%`;
    document.getElementById('entry-shade').append(light);
    document.getElementById('entry-notes').append(glyph);
    return {...instrument,light,glyph};
  });
  const cursor = document.getElementById('entry-cursor');
  let pointerFrame = 0, pointerX = 0, pointerY = 0;
  entry.addEventListener('pointermove', event => {
    if (phase !== 'idle' || event.pointerType === 'touch' || reduced.matches) return;
    pointerX = event.clientX; pointerY = event.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      cursor.style.transform = 'translate3d(' + pointerX + 'px,' + pointerY + 'px,0) translate(-50%,-50%)';
      cursor.classList.add('live');
    });
  }, {signal:lifetime.signal});
  entry.addEventListener('pointerleave', () => {
    cancelAnimationFrame(pointerFrame); pointerFrame = 0; cursor.classList.remove('live');
  }, {signal:lifetime.signal});

  // Prepare the real home on intent, not while the visitor is just watching
  // the first note. The instrument sequence leaves time to decode it.
  let homeReady;
  function loadHome() {
    if (homeReady) return homeReady;
    const homeController = new AbortController();
    const homeTimeout = setTimeout(() => homeController.abort(), 15000);
    homeReady = fetch('home.html', {signal:homeController.signal}).then(async response => {
      if (!response.ok) throw new Error(`Home: ${response.status}`);
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (!doc.querySelector('main.home')) throw new Error('Home markup missing');
      for (const child of doc.body.children) {
        if (child.tagName !== 'SCRIPT') site.append(document.importNode(child, true));
      }
      const images = [...site.querySelectorAll('.hero img')];
      await Promise.race([Promise.allSettled(images.map(img => img.decode())), pause(2500)]);
      return true;
    }).catch(() => false).finally(() => clearTimeout(homeTimeout));

    return homeReady;
  }
  start.addEventListener('pointerenter', loadHome, {signal:lifetime.signal,once:true});
  start.addEventListener('focus', loadHome, {signal:lifetime.signal,once:true});

  async function finish(allowTail = false) {
    if (finished) return;
    finished = true;
    if (!allowTail) sound?.close();
    if (!await loadHome()) {
      scene?.dispose(); sound?.close(); particles?.dispose(); lifetime.abort();
      location.replace('home.html'); return;
    }
    // Remove the overlay before disposing the renderer; never repaint its dark
    // resting state over a home that is already visible through the flying papers.
    setPhase('done');
    document.body.classList.remove('entry-active');
    site.inert = false;
    site.removeAttribute('aria-hidden');
    history.replaceState(null, '', new URL('home.html', location.href));
    entry.remove();
    scene?.dispose(); scene = null;
    if (allowTail) sound?.retire(); else sound?.close();
    lifetime.abort();
    cancelAnimationFrame(pointerFrame);
    particles?.dispose(); particles = null;
    const script = document.createElement('script');
    script.src = 'assets/js/main.js'; document.body.append(script);
    document.querySelector('meta[name="theme-color"]').content = '#f6f1e3';
    const main = site.querySelector('main');
    main.tabIndex = -1; main.focus({preventScroll:true});
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), {once:true});
  }
  start.addEventListener('click', async () => {
    if (phase !== 'idle') return;
    start.disabled = true;
    loadHome();
    setPhase('loading');
    start.setAttribute('aria-busy', 'true');
    // Reduced motion gets the content immediately, without a flashing sequence.
    if (reduced.matches) { await finish(); return; }
    try { sound = createEntranceSound(samples ??= preloadSamples(lifetime.signal)); } catch { /* Silent mode. */ }
    if (sound) await Promise.race([sound.readyFor('piano'), pause(1500)]);
    if (finished) return;
    start.removeAttribute('aria-busy');
    // Continue from the breathing light's actual frame; do not snap to darkness.
    const glow = document.getElementById('entry-glow');
    const glowStyle = getComputedStyle(glow);
    const glowFrame = {opacity:glowStyle.opacity,transform:glowStyle.transform};
    glow.style.animation = 'none';
    glow.animate([
      {...glowFrame,offset:0},
      {opacity:.86,transform:'translate(-50%,-50%) scale(1.12)',offset:.12},
      {opacity:.48,transform:'translate(-50%,-50%) scale(1.4)',offset:.55},
      {opacity:0,transform:'translate(-50%,-50%) scale(1.65)',offset:1}
    ], {duration:2400,easing:'ease-in-out',fill:'forwards'});
    setPhase('intro');
    sound?.play('piano', {cue:'intro'});
    particles?.begin();
    await pause(cueGaps[0]);
    if (finished) return;
    setPhase('playing');
    for (const [i, instrument] of instruments.entries()) {
      await new Promise(requestAnimationFrame);
      if (finished) return;
      instrument.light.classList.add('on'); instrument.glyph.classList.add('on');
      particles?.pulse(instrument.x / 100, instrument.y / 100, 1, instrument.symbol);
      sound?.play(instrument.type);
      if (i === instruments.length - 1) {
        entry.classList.add('entry-gathering');
        particles?.gather();
        scene?.prepareRipple();
      }
      await pause(cueGaps[i + 1]);
    }
    if (finished) return;
    // A slow or failed document request must not expose an empty backdrop.
    if (!await loadHome()) { await finish(); return; }
    if (finished) return;
    setPhase('tutti');
    entry.classList.remove('entry-gathering');
    entry.classList.add('entry-finale');
    particles?.reveal(instruments);
    scene?.ripple();
    sound?.ensemble();
    await pause(850);
    if (finished) return;
    setPhase('flight');
    particles?.wind();
    const flightDone = scene?.fly();
    await pause(3350);
    if (flightDone) await Promise.race([flightDone, pause(2500)]);
    if (!finished) await finish(true);
  }, {signal:lifetime.signal});
  skip.addEventListener('click', event => { event.preventDefault(); finish(); }, {signal:lifetime.signal});
  addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }, {signal:lifetime.signal});
  reduced.addEventListener('change', event => {
    if (!event.matches) return;
    scene?.dispose(); scene = null; entry.classList.remove('has-webgl','webgl-settled');
    particles?.dispose(); particles = null; entry.classList.remove('has-particle-notes');
    if (phase !== 'idle') finish();
  }, {signal:lifetime.signal});
  addEventListener('pagehide', () => { scene?.dispose(); sound?.close(); particles?.dispose(); }, {once:true});
  addEventListener('pageshow', event => { if (event.persisted && !finished) location.reload(); });
})();
