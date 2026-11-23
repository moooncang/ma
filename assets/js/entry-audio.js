// Actual CC0 orchestral recordings; no oscillator imitations. See audio/README.md.
const names = ['violin', 'piano-d', 'cello', 'flute'];

export function preloadSamples(signal) {
  const controller = new AbortController();
  const stop = () => controller.abort();
  signal.addEventListener('abort', stop, {once:true});
  if (signal.aborted) stop();
  const timeout = setTimeout(stop, 6000);
  const requests = Object.fromEntries(names.map(name => [name, (async () => {
    try {
      const response = await fetch(new URL(`../entry/audio/${name}.mp3`, import.meta.url), {signal:controller.signal});
      if (!response.ok) return null;
      return await response.arrayBuffer();
    } catch { return null; }
  })()]));
  Promise.all(Object.values(requests)).finally(() => {
    clearTimeout(timeout); signal.removeEventListener('abort', stop);
  });
  return requests;
}

// Context construction and resume must happen synchronously inside the gesture,
// including on iOS. Fetching earlier never opens an audio context or plays sound.
export function createEntranceSound(sampleData) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return null;
  const ctx = new Audio();
  ctx.resume().catch(() => {});
  return createSampler(ctx, sampleData);
}

// Accepting an AudioContext also lets the actual mix be checked offline.
export function createSampler(ctx, sampleData) {
  let closed = false, closeTimer = 0;
  const buffers = new Map(), playing = new Set(), played = new Set();
  const master = ctx.createGain(); master.gain.value = .72;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -12; limiter.knee.value = 14; limiter.ratio.value = 4;
  limiter.attack.value = .008; limiter.release.value = .22;
  master.connect(limiter).connect(ctx.destination);
  const reverb = ctx.createConvolver(), predelay = ctx.createDelay(.2);
  predelay.delayTime.value = .035;
  const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 7200;
  const wet = ctx.createGain(); wet.gain.value = .27;
  // A diffuse stereo hall, with a clear dry onset and no metallic feedback.
  const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.6), ctx.sampleRate);
  let seed = 29;
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c); let smooth = 0;
    for (let i = 0; i < data.length; i++) {
      seed = seed * 16807 % 2147483647;
      smooth = smooth * .63 + (seed / 2147483647 * 2 - 1) * .37;
      data[i] = smooth * Math.exp(-i / ctx.sampleRate * 2.35) * Math.min(1, i / (ctx.sampleRate * .025));
    }
  }
  reverb.buffer = impulse;
  predelay.connect(damp).connect(reverb).connect(wet).connect(master);
  // Two quiet stereo echoes of the same attack, never extra played notes.
  const echoInput = ctx.createGain();
  for (const [delay, level, pan] of [[.26,.13,-.35],[.52,.055,.35]]) {
    const tap = ctx.createDelay(1), gain = ctx.createGain(), position = ctx.createStereoPanner();
    const low = ctx.createBiquadFilter(), high = ctx.createBiquadFilter();
    tap.delayTime.value = delay; gain.gain.value = level; position.pan.value = pan;
    low.type = 'lowpass'; low.frequency.value = 7400;
    high.type = 'highpass'; high.frequency.value = 180;
    echoInput.connect(tap).connect(high).connect(low).connect(gain).connect(position);
    position.connect(master); position.connect(predelay);
  }
  const decoding = Promise.resolve(sampleData).then(samples => Object.fromEntries(names.map(name => [name, (async () => {
      const data = await samples[name];
      if (!data || closed) return;
      try {
        const buffer = await ctx.decodeAudioData(data.slice(0));
        if (!closed) buffers.set(name, buffer);
      } catch { /* One unavailable recording does not block the other voices. */ }
  })()])));
  const ready = decoding.then(tasks => Promise.all(Object.values(tasks))).catch(() => {});
  const readyFor = type => decoding.then(tasks => tasks[type === 'piano' ? 'piano-d' : type]).catch(() => {});

  function voice(name, at, duration, gain, pan, attack = .06, release = 1.2) {
    if (closed || ctx.state === 'closed' || !buffers.has(name)) return;
    const source = ctx.createBufferSource(); source.buffer = buffers.get(name);
    const envelope = ctx.createGain(), stereo = ctx.createStereoPanner();
    stereo.pan.value = pan;
    const end = at + Math.min(duration, source.buffer.duration);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(gain, at + attack);
    const releaseStart = Math.max(at + attack, end - release);
    const fade = Float32Array.from({length:96}, (_, i) => gain * (1 - i / 95) ** 2.2);
    envelope.gain.setValueAtTime(gain, releaseStart);
    envelope.gain.setValueCurveAtTime(fade, releaseStart, end - releaseStart);
    source.connect(envelope).connect(stereo);
    stereo.connect(master); stereo.connect(predelay); stereo.connect(echoInput);
    playing.add(source);
    source.onended = () => { playing.delete(source); source.disconnect(); envelope.disconnect(); stereo.disconnect(); };
    source.start(at); source.stop(end + .01);
  }
  function play(type, {when = ctx.currentTime + .015, cue = 'solo:' + type, ensemble = false} = {}) {
    // Distinct cues allow the opening key and final chord without duplicate attacks.
    if (closed || played.has(cue) || !buffers.has(type === 'piano' ? 'piano-d' : type)) return;
    played.add(cue);
    // The final chord has its own accent and wider stage, followed by a long release.
    const level = ensemble ? 1.05 : 1;
    const duration = ensemble ? 3.2 : type === 'piano' ? 2.2 : 1.8;
    const release = ensemble ? 2.2 : type === 'piano' ? 1.45 : 1.25;
    if (type === 'violin') voice('violin', when, duration, .56 * level, ensemble ? -.62 : -.4, .035, release);
    if (type === 'cello') voice('cello', when, duration, (ensemble ? .67 : .6) * level, ensemble ? -.26 : -.16, .04, release);
    if (type === 'flute') voice('flute', when, duration, .3 * level, ensemble ? .62 : .4, .035, release);
    if (type === 'piano') voice('piano-d', when, duration, (ensemble ? .67 : .58) * level, cue === 'intro' ? 0 : ensemble ? .12 : .2, .006, release);
  }
  function close() {
    if (closed) return;
    closed = true; clearTimeout(closeTimer);
    playing.forEach(source => { try { source.stop(); } catch {} });
    playing.clear(); buffers.clear();
    if (ctx.close && ctx.state !== 'closed') ctx.close().catch(() => {});
  }
  function fadeOut(duration = 1.6, when = ctx.currentTime) {
    if (closed) return;
    master.gain.setValueCurveAtTime(Float32Array.from({length:96}, (_, i) => .72 * (1 - i / 95) ** 2), when, duration);
  }
  return {
    ready, readyFor, play, fadeOut, close,
    ensemble(when = ctx.currentTime + .015) {
      ['violin','piano','cello','flute'].forEach(type => play(type,{when,cue:'final:' + type,ensemble:true}));
    },
    retire() {
      if (closed || closeTimer) return;
      fadeOut(1.6);
      closeTimer = setTimeout(close, 1650);
    }
  };
}
