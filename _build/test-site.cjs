// Main-site regression checks. Run against the static server documented in README.
// SITE_TEST_GROUP=copy|pages|desktop|mobile|motion|nojs selects a focused check.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'site-content-baseline.json'),'utf8'));
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:4173/';
const group=process.env.SITE_TEST_GROUP;
const run=name=>!group||group===name;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const compact=value=>value.replace(/\s+/gu,'');

function containsAll(actual,expected,message){
  const counts=new Map();
  for(const value of actual){const key=JSON.stringify(value);counts.set(key,(counts.get(key)||0)+1);}
  for(const value of expected){const key=JSON.stringify(value),count=counts.get(key)||0;assert.ok(count>0,`${message}: ${key}`);counts.set(key,count-1);}
}

(async()=>{
  assert.equal(hash(fs.readFileSync(path.join(root,'_build/data.py'))),baseline.data_sha256,'The source wording/data file is unchanged');
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const problems=[];
  async function context(options={}){
    const ctx=await browser.newContext(options);
    await ctx.route('https://fonts.**/*',route=>route.abort());
    await ctx.addInitScript(()=>{
      window.siteAudioStarts=0;
      const Original=window.AudioContext||window.webkitAudioContext;
      if(Original)window.AudioContext=class extends Original{constructor(...args){super(...args);window.siteAudioStarts++;}};
      window.copiedSiteText=null;
      // Exercise the real copy-button handler without depending on OS clipboard permissions.
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedSiteText=text;}}});
    });
    const page=await ctx.newPage();
    page.on('pageerror',error=>problems.push(`${page.url()}: ${error.stack||error.message}`));
    page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400&&!response.url().endsWith('favicon.ico'))problems.push(`${response.status()} ${response.url()}`);});
    return {ctx,page};
  }
  async function visit(page,file){
    await page.goto(new URL(file,base).href,{waitUntil:'domcontentloaded'});
    await page.locator('main').waitFor();
    await page.evaluate(()=>document.fonts.ready);
  }
  async function noOverflow(page,label){
    const sizes=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    assert.ok(sizes.document<=sizes.width+1&&sizes.body<=sizes.width+1,`${label} has no horizontal overflow: ${JSON.stringify(sizes)}`);
  }
  async function chooseImage(page,button,image){
    const expected=await button.getAttribute('data-set-img');
    await button.click();
    await page.waitForFunction(({selector,expected})=>document.querySelector(selector)?.getAttribute('src')===expected,{selector:image,expected});
    assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  async function homeControls(page){
    const stages=page.locator('.stages');
    await stages.locator('[data-tab="2"]').click();
    assert.equal(await stages.locator('[data-panel="2"]').isVisible(),true,'Recital hall panel opens');
    await chooseImage(page,stages.locator('[data-panel="2"] [data-pick]').last(),'.stages [data-panel="2"] [data-out="img"]');
    assert.equal(await stages.locator('[data-tab="2"]').getAttribute('aria-pressed'),'true','Nested image selection leaves the parent tab active');
    const react=page.locator('[data-react]').first();
    const names=JSON.parse(await react.getAttribute('data-names'));
    for(const button of await react.locator('[data-r]').all()){
      const states=(await button.getAttribute('data-r')).split(',');
      const note=await button.getAttribute('data-note');
      await button.click();
      assert.deepEqual(await react.locator('[data-state]').evaluateAll(nodes=>nodes.map(n=>n.dataset.state)),states);
      assert.deepEqual(await react.locator('[data-state]').allTextContents(),states.map(s=>names[s]));
      assert.equal(await react.locator('[data-react-note]').textContent(),note,'Salon feedback uses the existing copy');
    }
    await page.locator('.cal > .seg [data-tab="1"]').click();
    const week=page.locator('.cal [data-panel="1"] [data-set-week="14주차"]');
    const expected=await week.getAttribute('data-set-name');
    await week.click();
    assert.equal(await page.locator('.cal [data-panel="1"] [data-out="name"]').textContent(),expected);
    assert.equal(await page.evaluate(()=>siteAudioStarts),0,'Main-site interaction does not unexpectedly start audio');
  }
  try{
    if(run('copy')){
      const {ctx,page}=await context();
      await visit(page,'home.html');
      for(const [file,expected] of Object.entries(baseline.pages)){
        const response=await page.request.get(new URL(file,base).href);assert.equal(response.status(),200,file);
        const content=await page.evaluate(source=>{
          const doc=new DOMParser().parseFromString(source,'text/html');
          doc.querySelectorAll('script,style,template,[aria-hidden="true"]').forEach(el=>el.remove());
          const compact=value=>value.replace(/\s+/gu,'');
          const attrs=[];
          for(const el of doc.body.querySelectorAll('*'))for(const a of el.attributes){
            if(a.value&&(['alt','title','aria-label','placeholder','data-note','data-names','data-label','data-done'].includes(a.name)||(a.name.startsWith('data-set-')&&!['data-set-img','data-set-link','data-set-srcset'].includes(a.name))))attrs.push([a.name,a.value]);
          }
          return {text:compact(doc.body.textContent),attrs,links:[...doc.body.querySelectorAll('a[href]')].map(a=>[a.getAttribute('href'),compact(a.textContent)])};
        },await response.text());
        assert.equal(hash(content.text),expected.text_sha256,`${file}: original wording and order are preserved (${expected.characters} → ${content.text.length} characters)`);
        containsAll(content.attrs,expected.copy_attributes,`${file}: preserved copy attribute`);
        containsAll(content.links,expected.links,`${file}: preserved link and label`);
      }
      await ctx.close();console.log('PASS unchanged source data, wording, accessible labels and links across all 17 pages');
    }
    if(run('pages')){
      for(const viewport of [{width:1440,height:900},{width:375,height:812}]){
        const {ctx,page}=await context({viewport});
        for(const file of Object.keys(baseline.pages)){
          await visit(page,file);
          assert.ok(compact(await page.locator('main').textContent()).length>0,`${file}: main content exists`);
          assert.equal(await page.locator('.top nav a').count(),4,`${file}: all navigation destinations remain available`);
          await noOverflow(page,`${file} at ${viewport.width}px`);
          await page.locator('main > section').last().scrollIntoViewIfNeeded();
          await noOverflow(page,`${file} bottom at ${viewport.width}px`);
        }
        await ctx.close();
      }
      console.log('PASS all 17 pages at desktop/mobile widths, navigation and overflow');
    }
    if(run('desktop')){
      const {ctx,page}=await context({viewport:{width:1440,height:900}});
      await visit(page,'home.html');await homeControls(page);
      const gallery=page.locator('.slides');await gallery.scrollIntoViewIfNeeded();
      await gallery.evaluate(el=>{el.scrollLeft=0;});
      const box=await gallery.boundingBox();
      const before=await gallery.evaluate(el=>el.scrollLeft);
      const dragStart=box.x+Math.min(box.width*.75,620),dragDistance=Math.min(380,box.width*.5),dragY=box.y+Math.min(box.height*.4,180);
      // Pass the midpoint of one card so the existing scroll snap advances a card.
      await page.mouse.move(dragStart,dragY);
      await page.mouse.down();await page.mouse.move(dragStart-dragDistance,dragY,{steps:14});await page.mouse.up();
      assert.equal(new URL(page.url()).pathname,new URL('home.html',base).pathname,'Dragging a cast card does not navigate');
      await page.waitForFunction(before=>document.querySelector('.slides').scrollLeft>before+50,before);
      const castLink=page.locator('.slide').nth(1),href=await castLink.getAttribute('href');
      await castLink.click();await page.waitForURL(new URL(href,base).href);
      const expression=page.locator('.looks [data-pick]').nth(3);
      const cap=await expression.getAttribute('data-set-cap');
      await chooseImage(page,expression,'.looks [data-out="img"]');
      assert.equal(await page.locator('.looks [data-out="cap"]').textContent(),cap);
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.looks [data-pick]').nth(4).getAttribute('aria-pressed'),'true');
      await page.locator('.top [data-key="1"]').click();await page.waitForURL('**/world.html');
      const place=page.locator('.atlas [data-pick]').nth(15);
      await chooseImage(page,place,'.atlas [data-out="img"]');
      assert.equal(await page.locator('.atlas [data-out="cap"]').textContent(),await place.getAttribute('data-set-cap'));
      await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.atlas [data-pick]').nth(16).getAttribute('aria-pressed'),'true');
      await visit(page,'characters.html#b');
      assert.equal(await page.locator('.stagebox [data-panel="B"]').isVisible(),true,'Character hash selects the matching panel');
      await page.locator('[data-filter="교수"]').click();
      assert.equal(await page.locator('.roster button:visible').count(),2,'Faculty filter contains two teachers');
      const selected=await page.locator('.roster [aria-pressed="true"]').getAttribute('data-tab');
      assert.ok(['I','J'].includes(selected),'Filtering selects a visible character, never a hidden student');
      assert.equal(await page.locator(`.stagebox [data-panel="${selected}"]`).isVisible(),true);
      await page.locator('[data-filter=""]').click();
      await page.evaluate(()=>{location.hash='k';});
      await page.waitForFunction(()=>!document.querySelector('.stagebox [data-panel="K"]').hidden);
      await visit(page,'start.html#mode-1');
      assert.equal(await page.locator('.slots [data-tab="1"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('select[name="모드"]').inputValue(),'수석 입학');
      await page.locator('[name="이름"]').fill('테스트 연주자');await page.locator('[name="전공"]').fill('첼로');
      await page.locator('[name="국적"]').fill('한국');await page.locator('[name="경력"]').fill('실내악 경험');
      const draft=await page.locator('[data-note-out]').textContent();assert.match(draft,/\[전공\] 첼로/);assert.match(draft,/\[이름\] 테스트 연주자/);
      await page.locator('[data-copy]').click();assert.equal(await page.evaluate(()=>copiedSiteText),draft,'Copy uses the generated note');
      await page.locator('.slots [data-tab="2"]').click();assert.equal(await page.locator('select[name="모드"]').inputValue(),'자유');
      await page.evaluate(()=>{location.hash='mode-0';});await page.waitForFunction(()=>document.querySelector('select[name="모드"]').value==='추첨 입학');
      await visit(page,'academy.html');assert.equal(await page.locator('[data-major]').textContent(),'첼로','Stored major appears in the status example');
      await ctx.close();console.log('PASS desktop controls, nested pickers, drag/click, keyboard, filters/hashes, note copy and stored major');
    }
    if(run('mobile')){
      const {ctx,page}=await context({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2});
      await visit(page,'home.html');await homeControls(page);await noOverflow(page,'Mobile home with active panels');
      await page.locator('.top [data-key="3"]').tap();await page.waitForURL('**/characters.html');
      await page.locator('.roster [data-tab="K"]').tap();assert.equal(await page.locator('.stagebox [data-panel="K"]').isVisible(),true);
      await page.locator('.stagebox [data-panel="K"] .more').tap();await page.waitForURL('**/char/k.html');
      await chooseImage(page,page.locator('.looks [data-pick]').last(),'.looks [data-out="img"]');await noOverflow(page,'Mobile character expression');
      await visit(page,'start.html');await page.locator('.slots [data-tab="2"]').tap();await page.locator('[name="전공"]').fill('피아노');
      await noOverflow(page,'Mobile start form');await ctx.close();console.log('PASS mobile touch, character/profile flow, expressions and forms');
    }
    if(run('motion')){
      const {ctx,page}=await context({viewport:{width:390,height:844},reducedMotion:'reduce'});
      await visit(page,'home.html');await homeControls(page);
      const running=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&Number(a.effect?.getTiming().duration)>1).length);
      assert.equal(running,0,'Reduced motion does not leave decorative animations running');
      await page.locator('main > section').last().scrollIntoViewIfNeeded();await noOverflow(page,'Reduced-motion home');
      await ctx.close();console.log('PASS reduced motion keeps content and controls available');
    }
    if(run('nojs')){
      const {ctx,page}=await context({viewport:{width:375,height:812},javaScriptEnabled:false});
      for(const file of ['home.html','world.html','characters.html','char/a.html','start.html']){
        await visit(page,file);
        const first=page.locator('main > section').first();assert.equal(await first.isVisible(),true,`${file}: initial content without JavaScript`);
        assert.equal(await first.evaluate(el=>getComputedStyle(el).opacity),'1',`${file}: no hidden reveal without JavaScript`);
        const last=page.locator('main > section').last();await last.scrollIntoViewIfNeeded();assert.equal(await last.isVisible(),true);
        assert.equal(await last.evaluate(el=>getComputedStyle(el).opacity),'1');await noOverflow(page,`${file} without JavaScript`);
      }
      await ctx.close();console.log('PASS content remains visible without JavaScript');
    }
    assert.deepEqual(problems,[],'No uncaught JavaScript exceptions or missing local assets');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
