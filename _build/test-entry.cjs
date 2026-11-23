// Browser checks against a running static server. See README for tool setup.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.ENTRY_TEST_URL || 'http://127.0.0.1:4173/';

(async () => {
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless:true, args:['--no-sandbox','--enable-unsafe-swiftshader'] });
  const problems = [];
  async function open(options = {}, init, setup) {
    const context = await browser.newContext(options);
    if (setup) await setup(context);
    // Existing Google Fonts are unrelated to entry and may be blocked in CI.
    await context.route('https://fonts.**/*', route => route.abort());
    if (init) await context.addInitScript(init);
    await context.addInitScript(() => {
      window.audioStarts = 0;
      window.sampleStarts = [];
      window.oscillatorStarts = 0;
      if (window.AudioContext) {
        const Original = window.AudioContext;
        window.AudioContext = class extends Original {
          constructor(...args) { super(...args); window.audioStarts++; }
          createOscillator() { window.oscillatorStarts++; return super.createOscillator(); }
          createBufferSource() {
            const source = super.createBufferSource(), start = source.start.bind(source);
            source.start = (...args) => {
              window.sampleStarts.push({at:args[0],duration:source.buffer?.duration, fingerprint:source.buffer?.getChannelData(0)[1000], phase:document.querySelector('#entry')?.dataset.phase, appearances:document.querySelectorAll('.voice-note.on').length});
              return start(...args);
            };
            return source;
          }
        };
      }
    });
    const page = await context.newPage();
    page.on('pageerror', error => problems.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400 && !response.url().endsWith('favicon.ico')) problems.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(base, {waitUntil:'domcontentloaded'});
    await page.locator('#entry-start svg').waitFor({state:'attached'});
    assert.equal(await page.evaluate(() => window.audioStarts), 0, 'No sound before user gesture');
    return {context,page};
  }
  async function checkHome(page) {
    await page.waitForURL('**/home.html');
    await page.locator('#entry').waitFor({state:'detached'});
    assert.equal(await page.locator('h1').textContent(), '명문 음악 아카데미의 추첨 입학생');
    assert.equal(await page.locator('#site').getAttribute('inert'), null);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'visible');
    await page.waitForFunction(() => [...document.scripts].some(s => s.src.endsWith('/assets/js/main.js')));
    await page.locator('.stages [data-tab="2"]').click();
    assert.equal(await page.locator('.stages [data-panel="2"]').isVisible(), true, 'Home controls initialized');
    await page.locator('.stages [data-panel="2"] [data-pick]').last().click();
    assert.match(await page.locator('.stages [data-panel="2"] img').getAttribute('src'), /T2.webp$/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal overflow');
  }
  try {
    {
      const {context,page} = await open({viewport:{width:1440,height:900}});
      await page.evaluate(() => {
        window.paperHandoff = [];
        const watch = () => {
          const entry=document.querySelector('#entry');
          if(entry?.classList.contains('has-webgl')) paperHandoff.push({opacity:+getComputedStyle(document.getElementById('paper-scene')).opacity,fallback:getComputedStyle(document.getElementById('paper-fallback')).visibility});
          if(entry && !entry.classList.contains('webgl-settled'))requestAnimationFrame(watch);
        };
        watch();
      });
      await page.locator('#entry.webgl-settled').waitFor();
      const handoff=await page.evaluate(() => paperHandoff);
      assert.ok(handoff.length>0,'Observed the initial paper handoff');
      assert.ok(handoff.every(s=>s.opacity>=.99||s.fallback==='visible'),'No blank frame while 3D papers fade in');
      assert.equal(await page.locator('#site .hero img').count(), 0, 'Home image decoding waits for entry intent');
      assert.equal(await page.locator('#paper-scene').getAttribute('data-renderer'), 'worker', 'Paper renderer runs off the UI thread');
      await page.locator('#entry.has-particle-notes').waitFor();
      assert.equal(await page.locator('#entry-start img').count(), 0, 'Light particles replace the metal PNG');
      await page.evaluate(() => {
        window.entrancePhases = [];
        window.openingLight = [];
        window.finaleFrames = [];
        const entry = document.querySelector('#entry');
        const watchFinale = () => {
          if(!entry.isConnected)return;
          const gathering=entry.classList.contains('entry-gathering'),finale=entry.classList.contains('entry-finale');
          if(gathering||finale)finaleFrames.push({
            gathering,phase:entry.dataset.phase,
            shadow:+getComputedStyle(document.getElementById('entry-pressure')).opacity,
            scale:new DOMMatrixReadOnly(getComputedStyle(document.getElementById('entry-visual')).transform).a
          });
          requestAnimationFrame(watchFinale);
        };
        requestAnimationFrame(watchFinale);
        let openingAt;
        const watchLight = now => {
          if(entry.dataset.phase==='intro' && openingAt===undefined)openingAt=now;
          if(openingAt!==undefined)openingLight.push({age:now-openingAt,opacity:+getComputedStyle(document.getElementById('entry-glow')).opacity});
          if(openingAt===undefined || now-openingAt<2600)requestAnimationFrame(watchLight);
        };
        requestAnimationFrame(watchLight);
        new MutationObserver(() => entrancePhases.push(entry.dataset.phase))
          .observe(entry, {attributes:true,attributeFilter:['data-phase']});
      });
      await page.locator('#entry-start').click();
      await page.waitForFunction(() => document.querySelector('#entry')?.dataset.phase === 'tutti');
      assert.equal(await page.locator('#entry').evaluate(el => el.classList.contains('entry-finale')), true, 'The final chord triggers its light bloom');
      await page.waitForFunction(() => document.querySelector('#entry')?.dataset.phase === 'flight');
      assert.equal(await page.locator('#entry').evaluate(el=>el.classList.contains('has-webgl')),true,'The GPU renderer survives the ripple and continues into flight');
      assert.equal(await page.locator('#site .hero img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)), true, 'Hero images ready before paper reveal');
      assert.equal(await page.locator('#site').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(246, 241, 227)', 'Actual home background under flying sheets');
      await checkHome(page);
      const light=await page.evaluate(() => openingLight);
      assert.ok(light.filter(s=>s.age<1000).every(s=>s.opacity>.45),'The opening light does not snap shut as the note breaks apart');
      assert.ok(light.some(s=>s.age>1450 && s.age<1700 && s.opacity>.2),'Opening afterglow overlaps the next note');
      assert.ok(light.at(-1).opacity<.01,'Opening illumination eventually fades away');
      const finale=await page.evaluate(() => finaleFrames);
      assert.ok(finale.some(f=>f.gathering && f.shadow>.7),'Shadows press inward before the chord');
      assert.ok(finale.every(f=>Math.abs(f.scale-1)<.001),'Water ripples never stretch or zoom the whole paper layer');
      assert.ok(finale.at(-1).shadow<.01 && Math.abs(finale.at(-1).scale-1)<.001,'The impact settles before the home is revealed');
      assert.deepEqual(await page.evaluate(() => entrancePhases), ['loading','intro','playing','tutti','flight','done']);
      const audio = await page.evaluate(() => ({starts:sampleStarts,oscillators:oscillatorStarts}));
      assert.equal(audio.oscillators, 0, 'Recorded instruments, no oscillator imitations');
      assert.equal(audio.starts.length, 9, 'Opening piano + four solo attacks + four simultaneous final notes');
      assert.deepEqual(audio.starts.map(s=>s.phase),['intro','playing','playing','playing','playing','tutti','tutti','tutti','tutti']);
      assert.deepEqual(audio.starts.slice(1,5).map(s => s.appearances), [1,2,3,4], 'One sound starts with each new solo appearance');
      const gaps = audio.starts.slice(1,6).map((s,i) => s.at-audio.starts[i].at);
      assert.ok(gaps.every((gap,i) => Math.abs(gap-[1.2,1.2,.9,.6,.45][i])<.12),'The phrase follows its accelerating rhythm');
      assert.ok(Math.abs(gaps[0]-gaps[1])<.12 && gaps.slice(2).every((gap,i) => gap<gaps[i+1]),'Two opening beats lead into progressively shorter intervals');
      console.log('Measured cue gaps (s):', gaps.map(gap=>gap.toFixed(3)).join(', '));
      assert.ok(audio.starts.slice(5).every(s=>s.at===audio.starts[5].at),'The final four voices start at exactly the same audio time');
      assert.equal(audio.starts[0].fingerprint,audio.starts[2].fingerprint,'The opening key uses the actual piano recording');
      assert.equal(new Set(audio.starts.map(s => s.fingerprint)).size, 4, 'Four distinct recorded instruments');
      assert.ok(audio.starts.every(s => s.duration > 3.8), 'Full recordings decoded successfully');
      assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation').length), 1, 'No second document navigation');
      await page.locator('header a[href="world.html"]').click();
      await page.waitForURL('**/world.html'); await page.goBack();
      await page.waitForURL('**/home.html');
      assert.equal(await page.locator('#entry').count(), 0, 'Back does not replay entrance');
      await context.close(); console.log('PASS desktop: WebGL, flight, seamless reveal, home controls, history');
    }
    {
      const {context,page} = await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
      await page.locator('#entry.has-webgl').waitFor();
      await page.locator('#entry-start').tap();
      await checkHome(page);
      await context.close(); console.log('PASS mobile: touch, full sequence, home controls, overflow');
    }
    {
      const {context,page} = await open({reducedMotion:'reduce',viewport:{width:375,height:812}});
      assert.equal(await page.locator('#entry').getAttribute('class'), null, 'Reduced motion avoids WebGL');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('#entry-start').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter'); await checkHome(page);
      assert.equal(await page.evaluate(() => window.audioStarts), 0, 'Reduced motion skips the sequence and sound');
      await context.close(); console.log('PASS reduced motion and keyboard activation');
    }
    {
      const {context,page} = await open({}, () => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type,...args) {
          return type.startsWith('webgl') ? null : getContext.call(this,type,...args);
        };
        window.AudioContext = undefined; window.webkitAudioContext = undefined;
        window.Worker = undefined;
      });
      const url = await page.locator('.entry-paper').first().evaluate(el => getComputedStyle(el).backgroundImage.match(/url\("?([^"\)]+)/)[1]);
      const response = await page.request.get(url); assert.equal(response.status(), 200, 'Fallback has actual notation assets');
      await page.locator('#entry-start').click(); await checkHome(page);
      await context.close(); console.log('PASS unavailable WebGL/audio: CSS flight and entry');
    }
    {
      const {context,page} = await open();
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
      assert.equal(await page.locator('#entry-skip').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter'); await checkHome(page);
      assert.equal(await page.evaluate(() => window.audioStarts), 0);
      await context.close(); console.log('PASS focus-only silent skip');
    }
    {
      const {context,page} = await open();
      await page.locator('#entry-start').click(); await page.keyboard.press('Escape');
      await checkHome(page); await context.close(); console.log('PASS Escape cancels active sequence');
    }
    {
      const {context,page} = await open({}, null, context => context.route('**/entry/audio/*.mp3', route => route.abort()));
      await page.locator('#entry-start').click(); await checkHome(page);
      assert.equal(await page.evaluate(() => sampleStarts.length), 0);
      await context.close(); console.log('PASS missing recordings: silent entry still completes');
    }
    {
      const {context,page} = await open({}, null, context => context.route('**/entry/audio/*.mp3', () => {}));
      await page.locator('#entry-start').click();
      assert.equal(await page.locator('#entry').getAttribute('data-phase'), 'loading');
      await page.keyboard.press('Escape'); await checkHome(page);
      assert.equal(await page.evaluate(() => sampleStarts.length), 0);
      await context.close(); console.log('PASS pending audio: Escape cancels loading immediately');
    }
    {
      const {context,page} = await open({}, () => { window.Worker = undefined; });
      await page.locator('#entry.has-webgl').waitFor();
      assert.equal(await page.locator('#paper-scene').getAttribute('data-renderer'), 'main');
      await page.locator('#entry-start').click(); await checkHome(page);
      assert.equal(await page.evaluate(() => sampleStarts.length), 9);
      await context.close(); console.log('PASS no worker support: same-quality WebGL renderer and complete audio sequence');
    }
    assert.deepEqual(problems, [], 'No page exceptions or missing local assets');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
