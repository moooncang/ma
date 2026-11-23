// Actual CC0 orchestral recordings; no oscillator imitations. See audio/README.md.
const names = ['violin', 'piano-d', 'piano-fs', 'piano-a', 'cello', 'flute'];

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
  let closed = false;
  const buffers = new Map(), playing = new Set();
  const master = ctx.createGain(); master.gain.value = .72;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -12; limiter.knee.value = 14; limiter.ratio.value = 4;
  limiter.attack.value = .008; limiter.release.value = .22;
  master.connect(limiter).connect(ctx.destination);
  const reverb = ctx.createConvolver(), predelay = ctx.createDelay(.2);
  predelay.delayTime.value = .035;
  const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 5800;
  const wet = ctx.createGain(); wet.gain.value = .26;
  // A diffuse stereo hall, with a clear dry onset and no metallic feedback.
  const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.8), ctx.sampleRate);
  let seed = 29;
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c); let smooth = 0;
    for (let i = 0; i < data.length; i++) {
      seed = seed * 16807 % 2147483647;
      smooth = smooth * .63 + (seed / 2147483647 * 2 - 1) * .37;
      data[i] = smooth * Math.exp(-i / ctx.sampleRate * 2.5) * Math.min(1, i / (ctx.sampleRate * .025));
    }
  }
  reverb.buffer = impulse;
  predelay.connect(damp).connect(reverb).connect(wet).connect(master);
  const ready = Promise.resolve(sampleData).then(async samples => {
    await Promise.all(names.map(async name => {
      const data = await samples[name];
      if (!data || closed) return;
      try {
        const buffer = await ctx.decodeAudioData(data.slice(0));
        if (!closed) buffers.set(name, buffer);
      } catch { /* One unavailable recording does not block the other voices. */ }
    }));
  }).catch(() => {});

  function voice(name, at, duration, gain, pan, attack = .06) {
    if (closed || ctx.state === 'closed' || !buffers.has(name)) return;
    const source = ctx.createBufferSource(); source.buffer = buffers.get(name);
    const envelope = ctx.createGain(), stereo = ctx.createStereoPanner();
    stereo.pan.value = pan;
    const end = at + Math.min(duration, source.buffer.duration);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(gain, at + attack);
    envelope.gain.setValueAtTime(gain, Math.max(at + attack, end - .32));
    envelope.gain.linearRampToValueAtTime(0, end);
    source.connect(envelope).connect(stereo);
    stereo.connect(master); stereo.connect(predelay);
    playing.add(source);
    source.onended = () => { playing.delete(source); source.disconnect(); envelope.disconnect(); stereo.disconnect(); };
    source.start(at); source.stop(end + .01);
  }
  function play(type, ensemble = false, when = ctx.currentTime + .015) {
    const gain = ensemble ? .57 : 1;
    const duration = ensemble ? 2.5 : 1.25;
    if (type === 'violin') voice('violin', when, duration, .56 * gain, -.4, .1);
    if (type === 'cello') voice('cello', when, duration, .6 * gain, -.16, .1);
    if (type === 'flute') voice('flute', when, duration, .3 * gain, .4, .07);
    if (type === 'piano') {
      ['piano-d', 'piano-fs', 'piano-a'].forEach((name, i) => {
        voice(name, when + i * .135, ensemble ? 2.75 : 1.9, (.58 - i * .08) * gain, .08 + i * .12, .006);
      });
    }
  }
  return {
    ready, play,
    fadeOut(duration = .4, when = ctx.currentTime) {
      if (closed) return;
      master.gain.setValueAtTime(.72, when);
      master.gain.linearRampToValueAtTime(0, when + duration);
    },
    close() {
      if (closed) return;
      closed = true;
      playing.forEach(source => { try { source.stop(); } catch {} });
      playing.clear(); buffers.clear();
      if (ctx.close && ctx.state !== 'closed') ctx.close().catch(() => {});
    }
  };
}
