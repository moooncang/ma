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
              window.sampleStarts.push({duration:source.buffer?.duration, fingerprint:source.buffer?.getChannelData(0)[1000]});
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
    await page.locator('#site .hero img').first().waitFor({state:'attached'});
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
      await page.locator('#entry.has-webgl').waitFor();
      await page.locator('#entry.has-particle-notes').waitFor();
      assert.equal(await page.locator('#entry-start img').count(), 0, 'Light particles replace the metal PNG');
      await page.evaluate(() => {
        window.entrancePhases = [];
        new MutationObserver(() => entrancePhases.push(document.querySelector('#entry').dataset.phase))
          .observe(document.querySelector('#entry'), {attributes:true,attributeFilter:['data-phase']});
      });
      await page.locator('#entry-start').click();
      await page.waitForFunction(() => document.querySelector('#entry')?.dataset.phase === 'flight');
      assert.equal(await page.locator('#site .hero img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)), true, 'Hero images ready before paper reveal');
      assert.equal(await page.locator('#site').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(246, 241, 227)', 'Actual home background under flying sheets');
      await checkHome(page);
      assert.deepEqual(await page.evaluate(() => entrancePhases), ['loading','playing','tutti','flight','done']);
      const audio = await page.evaluate(() => ({starts:sampleStarts,oscillators:oscillatorStarts}));
      assert.equal(audio.oscillators, 0, 'Recorded instruments, no oscillator imitations');
      assert.equal(audio.starts.length, 12, 'Six solo/arpeggio samples and six ensemble samples played');
      assert.equal(new Set(audio.starts.map(s => s.fingerprint)).size, 6, 'Six distinct decoded recordings');
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
    assert.deepEqual(problems, [], 'No page exceptions or missing local assets');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
