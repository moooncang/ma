// Render the same sampler used by the entrance; detect silence and clipping.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try {
    const page = await browser.newPage();
    await page.route('https://fonts.**/*', route => route.abort());
    await page.goto(new URL('home.html',process.env.ENTRY_TEST_URL || 'http://127.0.0.1:4173/').href,{waitUntil:'domcontentloaded'});
    const result = await page.evaluate(async () => {
      const {createSampler} = await import('./assets/js/entry-audio.js?v=perf-3');
      const names = ['violin','piano-d','cello','flute'];
      const samples = Object.fromEntries(await Promise.all(names.map(async name => [name,await (await fetch('assets/entry/audio/'+name+'.mp3')).arrayBuffer()])));
      const ctx = new OfflineAudioContext(2,44100*11,44100);
      const sampler = createSampler(ctx,samples); await sampler.ready;
      ['violin','piano','cello','flute'].forEach((type,i) => sampler.play(type,.2+i*1.45));
      // Duplicate calls are ignored; the rendered output must stay silent afterwards.
      ['violin','piano','cello','flute'].forEach(type => sampler.play(type,7));
      sampler.fadeOut(.4,9.5);
      const rendered = await ctx.startRendering();
      const left = rendered.getChannelData(0), right = rendered.getChannelData(1);
      const rms = (a,from,to) => {
        const start=Math.floor(from*44100),end=Math.floor(to*44100);
        let sum=0;for(let i=start;i<end;i++)sum+=a[i]*a[i];return Math.sqrt(sum/(end-start));
      };
      const levels=[.2,1.65,3.1,4.55].map(t => rms(left,t+.1,t+1));
      let peak=0,difference=0;for(let i=0;i<left.length;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));difference+=Math.abs(left[i]-right[i]);}
      // Optional audition artifact, stereo PCM, generated from the actual graph.
      const wav=new ArrayBuffer(44+left.length*4), view=new DataView(wav);
      const word=(offset,s)=>{for(let i=0;i<s.length;i++)view.setUint8(offset+i,s.charCodeAt(i));};
      word(0,'RIFF');view.setUint32(4,wav.byteLength-8,true);word(8,'WAVE');word(12,'fmt ');
      view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,44100,true);view.setUint32(28,44100*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,left.length*4,true);
      for(let i=0;i<left.length;i++){view.setInt16(44+i*4,Math.max(-1,Math.min(1,left[i]))*32767,true);view.setInt16(46+i*4,Math.max(-1,Math.min(1,right[i]))*32767,true);}
      let binary='';const bytes=new Uint8Array(wav);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      return {levels,peak,stereoDifference:difference/left.length,tail:rms(left,7,10.8),wav:btoa(binary)};
    });
    assert.ok(result.levels.every(rms => rms>.008), 'Each of the four single attacks is audible');
    assert.ok(result.peak<.95,'Mix has headroom, no clipped samples');
    assert.ok(result.stereoDifference>.001,'Stereo space survives rendering');
    assert.ok(result.tail<.0001,'No extra notes or final replay');
    if(process.env.ENTRY_AUDIO_REVIEW)fs.writeFileSync(process.env.ENTRY_AUDIO_REVIEW,Buffer.from(result.wav,'base64'));
    delete result.wav;
    console.log('PASS recorded instruments, audible mix, headroom, stereo and graceful end',JSON.stringify(result));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
