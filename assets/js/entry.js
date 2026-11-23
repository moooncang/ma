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
  const note = symbol => `<img src="assets/entry/note-${symbol}.png" alt="" width="480" height="640" draggable="false">`;
  start.querySelector('.note-art').innerHTML = note('beamed');

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
  if (!reduced.matches) import('./entry-particles.js').then(({createParticles}) => {
    if (!finished && !reduced.matches) particles = createParticles(document.getElementById('entry-atmosphere'));
  }).catch(() => {});
  const instruments = [
    {x:24,y:29,symbol:'eighth',type:'violin',frequency:440},
    {x:75,y:25,symbol:'beamed',type:'piano',frequency:293.665},
    {x:29,y:73,symbol:'quarter',type:'cello',frequency:146.832},
    {x:77,y:70,symbol:'sixteenth',type:'flute',frequency:739.989}
  ].map(instrument => {
    const light = document.createElement('i');
    light.className = 'voice-light';
    const glyph = document.createElement('div');
    glyph.className = 'voice-note';
    glyph.innerHTML = note(instrument.symbol);
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

  // Soft instrument-specific harmonics, with a small room tail. Created only
  // inside the click handler; unavailable audio never blocks entry.
  function createSound() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    const ctx = new Audio();
    ctx.resume().catch(() => {});
    const output = ctx.createGain(); output.gain.value = .35; output.connect(ctx.destination);
    const convolver = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, ctx.sampleRate * 1.4, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*Math.pow(1-i/data.length,3)*.18;
    }
    convolver.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = .32;
    convolver.connect(wet).connect(output);
    return {
      play(instrument, duration, volume = 1) {
        if (ctx.state === 'closed') return;
        const harmonics = { violin:[1,.43,.22,.12,.06], piano:[1,.35,.16,.09], cello:[1,.48,.25,.13,.07], flute:[1,.12,.035] }[instrument.type];
        const real = new Float32Array(harmonics.length + 1);
        const imag = new Float32Array([0,...harmonics]);
        const oscillator = ctx.createOscillator();
        oscillator.setPeriodicWave(ctx.createPeriodicWave(real, imag));
        oscillator.frequency.value = instrument.frequency;
        const gain = ctx.createGain(), t = ctx.currentTime;
        const attack = instrument.type === 'piano' ? .012 : .16;
        gain.gain.setValueAtTime(0,t);
        gain.gain.linearRampToValueAtTime(.15 * volume,t+attack);
        gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
        oscillator.connect(gain); gain.connect(output); gain.connect(convolver);
        oscillator.start(t); oscillator.stop(t+duration+.02);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      },
      close() { if (ctx.state !== 'closed') ctx.close().catch(() => {}); }
    };
  }

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
    setPhase('playing');
    // Reduced motion gets the content immediately, without a flashing sequence.
    if (reduced.matches) { await finish(); return; }
    try { sound = createSound(); } catch { /* Silent mode. */ }
    for (const instrument of instruments) {
      if (finished) return;
      instrument.light.classList.add('on'); instrument.glyph.classList.add('on');
      particles?.pulse(instrument.x / 100, instrument.y / 100);
      sound?.play(instrument, 1.1);
      await pause(1150);
    }
    if (finished) return;
    // A slow or failed document request must not expose an empty backdrop.
    if (!await homeReady) { await finish(); return; }
    if (finished) return;
    setPhase('tutti');
    particles?.pulse(.5, .48, 2);
    instruments.forEach(instrument => sound?.play(instrument, 2.7, .55));
    await pause(430);
    if (finished) return;
    setPhase('flight');
    particles?.wind();
    scene?.fly();
    await pause(3350);
    if (!finished) await finish();
  }, {signal:lifetime.signal});
  skip.addEventListener('click', event => { event.preventDefault(); finish(); }, {signal:lifetime.signal});
  addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }, {signal:lifetime.signal});
  reduced.addEventListener('change', event => {
    if (!event.matches) return;
    scene?.dispose(); scene = null; entry.classList.remove('has-webgl');
    particles?.dispose(); particles = null;
    if (phase !== 'idle') finish();
  }, {signal:lifetime.signal});
  addEventListener('pagehide', () => { scene?.dispose(); sound?.close(); particles?.dispose(); }, {once:true});
  addEventListener('pageshow', event => { if (event.persisted && !finished) location.reload(); });
})();
