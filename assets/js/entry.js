import {noteMarkup} from './entry-notes.js?v=light-2';
import {preloadSamples, createEntranceSound} from './entry-audio.js?v=light-2';

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
    el.style.setProperty('--score', `url('${new URL(`assets/entry/score-${i%12+1}.svg`, location.href)}')`);
    document.getElementById('paper-fallback').append(el);
  }
  if (!reduced.matches) {
    import('./entry-scene.js').then(module => module.createPaperScene(document.getElementById('paper-scene'), layout)).then(renderer => {
      if (finished || reduced.matches || phase === 'flight') return renderer.dispose();
      scene = renderer;
      entry.classList.add('has-webgl');
    }).catch(() => { /* CSS papers remain usable when WebGL is unavailable. */ });
  }
  document.getElementById('paper-scene').addEventListener('webglcontextlost', event => {
    event.preventDefault();
    entry.classList.remove('has-webgl');
    scene?.dispose(); scene = null;
  }, {signal:lifetime.signal});

  let particles = null;
  if (!reduced.matches) import('./entry-particles.js?v=light-2').then(({createParticles}) => {
    if (!finished && !reduced.matches && phase !== 'flight') {
      particles = createParticles(document.getElementById('entry-atmosphere'));
      if (particles) {
        entry.classList.add('has-particle-notes');
        if (phase === 'playing' || phase === 'tutti') particles.begin();
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
  entry.addEventListener('pointermove', event => {
    if (phase !== 'idle' || event.pointerType === 'touch' || reduced.matches) return;
    cursor.style.setProperty('--x', `${event.clientX}px`);
    cursor.style.setProperty('--y', `${event.clientY}px`);
    cursor.classList.add('live');
  }, {signal:lifetime.signal});
  entry.addEventListener('pointerleave', () => cursor.classList.remove('live'), {signal:lifetime.signal});

  // Fetch the actual home, rather than showing an imitation or an iframe.
  // It is already painted beneath the papers when they lift away.
  const homeController = new AbortController();
  const homeTimeout = setTimeout(() => homeController.abort(), 15000);
  const homeReady = fetch('home.html', {signal:homeController.signal}).then(async response => {
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

  async function finish() {
    if (finished) return;
    finished = true;
    setPhase('done');
    scene?.dispose(); scene = null;
    sound?.close(); sound = null;
    lifetime.abort();
    particles?.dispose(); particles = null;
    if (!await homeReady) { location.replace('home.html'); return; }
    document.body.classList.remove('entry-active');
    site.inert = false;
    site.removeAttribute('aria-hidden');
    history.replaceState(null, '', new URL('home.html', location.href));
    const script = document.createElement('script');
    script.src = 'assets/js/main.js'; document.body.append(script);
    entry.remove();
    document.querySelector('meta[name="theme-color"]').content = '#f6f1e3';
    const main = site.querySelector('main');
    main.tabIndex = -1; main.focus({preventScroll:true});
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), {once:true});
  }
  start.addEventListener('click', async () => {
    if (phase !== 'idle') return;
    start.disabled = true;
    setPhase('loading');
    start.setAttribute('aria-busy', 'true');
    // Reduced motion gets the content immediately, without a flashing sequence.
    if (reduced.matches) { await finish(); return; }
    try { sound = createEntranceSound(samples ??= preloadSamples(lifetime.signal)); } catch { /* Silent mode. */ }
    if (sound) await Promise.race([sound.ready, pause(3000)]);
    if (finished) return;
    start.removeAttribute('aria-busy');
    setPhase('playing');
    particles?.begin();
    for (const instrument of instruments) {
      if (finished) return;
      instrument.light.classList.add('on'); instrument.glyph.classList.add('on');
      particles?.pulse(instrument.x / 100, instrument.y / 100, 1, instrument.symbol);
      sound?.play(instrument.type);
      await pause(1450);
    }
    if (finished) return;
    // A slow or failed document request must not expose an empty backdrop.
    if (!await homeReady) { await finish(); return; }
    if (finished) return;
    setPhase('tutti');
    particles?.tutti(instruments);
    instruments.forEach(instrument => sound?.play(instrument.type, true));
    await pause(550);
    if (finished) return;
    setPhase('flight');
    particles?.wind();
    scene?.fly();
    await pause(2950);
    if (finished) return;
    sound?.fadeOut(.4);
    await pause(400);
    if (!finished) await finish();
  }, {signal:lifetime.signal});
  skip.addEventListener('click', event => { event.preventDefault(); finish(); }, {signal:lifetime.signal});
  addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }, {signal:lifetime.signal});
  reduced.addEventListener('change', event => {
    if (!event.matches) return;
    scene?.dispose(); scene = null; entry.classList.remove('has-webgl');
    particles?.dispose(); particles = null; entry.classList.remove('has-particle-notes');
    if (phase !== 'idle') finish();
  }, {signal:lifetime.signal});
  addEventListener('pagehide', () => { scene?.dispose(); sound?.close(); particles?.dispose(); }, {once:true});
  addEventListener('pageshow', event => { if (event.persisted && !finished) location.reload(); });
})();
