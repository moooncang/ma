// Main-site regression checks. Run against the static server documented in README.
// SITE_TEST_GROUP=copy|assets|pages|desktop|mobile|motion|nojs selects a focused check.
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
const originalCastLinks=baseline.pages['home.html'].links.filter(([href])=>/^char\/[a-l]\.html$/.test(href));
const castLabels=new Map(originalCastLinks);
const addedHeroLinks=[...castLabels.keys()].filter(href=>originalCastLinks.filter(([original])=>original===href).length===1);
const originalAllCastLink=baseline.pages['home.html'].links.find(([href,label])=>href==='characters.html'&&label.includes('열두'));

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
  async function chooseImage(page,button,image,attribute='data-set-img'){
    const expected=await button.getAttribute(attribute);
    const group=button.locator('xpath=ancestor::details[1]');
    if(await group.count()&&(await group.getAttribute('open'))===null)await group.locator('summary').first().click();
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
    const salonButtons=await react.locator('[data-salon-select]').all();
    assert.equal(salonButtons.length,4,'All four salon artworks are interactive');
    for(const salon of salonButtons){
      const index=Number(await salon.getAttribute('data-salon-select'));
      const choices=await react.locator('[data-r]').all();
      let expected;
      for(const choice of choices)if((await choice.getAttribute('data-r')).split(',')[index]==='1'){expected=choice;break;}
      assert.ok(expected,'Each salon artwork maps to an existing positive performance');
      await salon.click();assert.equal(await expected.getAttribute('aria-pressed'),'true','Selecting salon artwork activates its matching performance');
    }
    await page.mouse.move(0,0);
    for(const salon of salonButtons)assert.equal(await salon.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)','Salon controls keep the artwork visible after selection and pointer leave');
    await page.locator('.cal > .seg [data-tab="1"]').click();
    const week=page.locator('.cal [data-panel="1"] [data-set-week="14주차"]');
    const expected=await week.getAttribute('data-set-name');
    await week.click();
    assert.equal(await page.locator('.cal [data-panel="1"] [data-out="name"]').textContent(),expected);
    assert.equal(await page.evaluate(()=>siteAudioStarts),0,'Main-site interaction does not unexpectedly start audio');
  }
  async function calendarSelection(panel,number){
    const button=panel.locator(`[data-week-number="${number}"]`);
    assert.equal(await button.getAttribute('aria-pressed'),'true',`Calendar week ${number} is selected`);
    for(const key of ['week','name','text','scene']){
      const expected=await button.getAttribute(`data-set-${key}`),output=panel.locator(`[data-out="${key}"]`);
      assert.equal(key==='scene'?await output.getAttribute('src'):await output.textContent(),expected,`Week ${number} keeps ${key} synchronized`);
    }
  }
  async function detailedCalendar(page){
    const panel=page.locator('.cal [data-panel="1"]');
    await calendarSelection(panel,14);
    await panel.locator('[data-week-step="-1"]').click();await calendarSelection(panel,13);
    await panel.locator('[data-week-step="1"]').click();await calendarSelection(panel,14);
    await panel.locator('[data-week-number="14"]').focus();
    await page.keyboard.press('ArrowRight');await calendarSelection(panel,15);
    await page.keyboard.press('ArrowRight');await calendarSelection(panel,15);
    await page.keyboard.press('Home');await calendarSelection(panel,1);
    await page.keyboard.press('End');await calendarSelection(panel,15);
    await panel.locator('.weeks').scrollIntoViewIfNeeded();
    const first=await panel.locator('[data-week-number="2"]').boundingBox(),last=await panel.locator('[data-week-number="6"]').boundingBox();
    await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();
    await page.mouse.move(last.x+last.width/2,last.y+last.height/2,{steps:14});await page.mouse.up();
    await calendarSelection(panel,6);
    await panel.locator('[data-out="scene"]').evaluate(img=>img.decode());
    const opener=panel.locator('.calendar-scene [data-zoom-open]'),scene=await panel.locator('[data-out="scene"]').getAttribute('src');
    await opener.click();
    const dialog=page.locator('dialog[data-image-viewer]');
    assert.equal(await dialog.isVisible(),true,'Calendar artwork opens in the image viewer');
    assert.equal(new URL(await dialog.locator('img').getAttribute('src'),page.url()).href,new URL(scene,page.url()).href,'Viewer displays the currently selected event image');
    const before=page.url();await page.keyboard.press('1');assert.equal(page.url(),before,'Open image viewer takes precedence over navigation shortcuts');
    await page.keyboard.press('Tab');
    const focus=await dialog.evaluate(el=>({inside:el.contains(document.activeElement),browserChrome:document.activeElement===document.body&&!document.hasFocus()}));
    assert.ok(focus.inside||focus.browserChrome,'Tab cannot focus the underlying page while the modal is open');
    // Native dialogs allow browser chrome after their last control; the next Tab returns to the modal.
    if(focus.browserChrome)await page.keyboard.press('Tab');
    assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'Tab returns to a modal control');
    await page.locator('.top a').first().evaluate(el=>el.focus());
    assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'The underlying page remains inert to focus');
    await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false,'Escape closes the viewer');
    assert.equal(await opener.evaluate(el=>document.activeElement===el),true,'Closing the viewer returns focus to its opener');
  }
  try{
    if(run('copy')){
      const {ctx,page}=await context();
      await visit(page,'home.html');
      const castPage=await page.request.get(new URL('characters.html',base).href);
      assert.equal(castPage.status(),200);
      const originalCastFilters=await page.evaluate(source=>{
        const doc=new DOMParser().parseFromString(source,'text/html');
        return [...doc.querySelectorAll('[data-filter]')].map(button=>({value:button.getAttribute('data-filter'),text:button.textContent.replace(/\s+/gu,'')}));
      },await castPage.text());
      for(const [file,expected] of Object.entries(baseline.pages)){
        const response=await page.request.get(new URL(file,base).href);assert.equal(response.status(),200,file);
        const content=await page.evaluate(source=>{
          const doc=new DOMParser().parseFromString(source,'text/html');
          doc.querySelectorAll('script,style,template,[aria-hidden="true"]').forEach(el=>el.remove());
          const compact=value=>value.replace(/\s+/gu,'');
          const hero=[...doc.querySelectorAll('.hero a.fig')].map(el=>({href:el.getAttribute('href'),text:compact(el.textContent)}));
          const additions=[...doc.querySelectorAll('[data-cast-addition]')].map(el=>({href:el.getAttribute('href'),text:compact(el.textContent),isHero:el.matches('.hero a.fig')}));
          const castOverview=[...doc.querySelectorAll('[data-hero-cast-link]')].map(el=>({href:el.getAttribute('href'),text:compact(el.textContent),isHero:el.matches('.hero a')}));
          const reuse=[...doc.querySelectorAll('[data-copy-reuse]')].map(el=>el.getAttribute('data-copy-reuse'));
          const feature=[...doc.querySelectorAll('[data-copy-reuse="hero-feature"]')].map(el=>({
            text:compact(el.textContent),role:compact(el.querySelector('.hero-feature-role')?.textContent||''),name:compact(el.querySelector('.hero-feature-name')?.textContent||''),
            href:el.querySelector('.hero-feature-link')?.getAttribute('href'),isHero:el.matches('.hero .hero-feature-info')
          }));
          const index=[...doc.querySelectorAll('[data-copy-reuse="home-index"]')].map(el=>({
            text:compact(el.textContent),isIndex:el.matches('.home-index'),items:[...el.querySelectorAll('[data-home-jump]')].map(link=>{
              const target=doc.getElementById((link.getAttribute('href')||'').slice(1));
              return {href:link.getAttribute('href'),jump:link.getAttribute('data-home-jump'),text:compact(link.textContent),heading:compact(target?.querySelector('.hd > span')?.textContent||'')};
            })
          }));
          const castFilters=[...doc.querySelectorAll('[data-copy-reuse="cast-filters"]')].map(el=>({
            text:compact(el.textContent),isCast:!!el.closest('.section-cast'),items:[...el.querySelectorAll('button')].map(button=>({value:button.getAttribute('data-cast-filter')??button.getAttribute('data-filter'),text:compact(button.textContent)}))
          }));
          // Validate these exact reused labels below before excluding their duplicate occurrences.
          doc.querySelectorAll('[data-copy-reuse="hero-feature"],[data-copy-reuse="home-index"],[data-copy-reuse="cast-filters"]').forEach(el=>el.remove());
          // Only the six expressly requested additional hero portraits are excluded.
          doc.querySelectorAll('.hero a.fig[data-cast-addition]').forEach(el=>el.remove());
          // The approved hero shortcut reuses the existing cast-overview link verbatim.
          doc.querySelectorAll('.hero a[data-hero-cast-link]').forEach(el=>el.remove());
          const attrs=[];
          for(const el of doc.body.querySelectorAll('*'))for(const a of el.attributes){
            if(a.value&&(['alt','title','aria-label','placeholder','data-note','data-names','data-label','data-done'].includes(a.name)||(a.name.startsWith('data-set-')&&!['data-set-img','data-set-link','data-set-srcset'].includes(a.name))))attrs.push([a.name,a.value]);
          }
          return {text:compact(doc.body.textContent),attrs,links:[...doc.body.querySelectorAll('a[href]')].map(a=>[a.getAttribute('href'),compact(a.textContent)]),hero,additions,castOverview,reuse,feature,index,castFilters};
        },await response.text());
        if(file==='home.html'){
          assert.equal(content.hero.length,12,'The hero contains all twelve people');
          assert.deepEqual(content.hero.map(({href})=>href).sort(),[...castLabels.keys()].sort(),'Every original cast identity appears exactly once in the hero');
          for(const person of content.hero)assert.equal(person.text,castLabels.get(person.href),`Hero name and role reuse original copy: ${person.href}`);
          assert.deepEqual(content.additions.map(({href})=>href).sort(),[...addedHeroLinks].sort(),'Only the six newly requested hero identities are marked as additions');
          assert.ok(content.additions.every(person=>person.isHero),'No other content is excluded through a hero-addition marker');
          assert.equal(content.castOverview.length,1,'The hero has one approved cast-overview shortcut');
          assert.deepEqual([content.castOverview[0].href,content.castOverview[0].text],originalAllCastLink,'The new hero shortcut reuses the existing destination and label');
          assert.equal(content.castOverview[0].isHero,true,'The shortcut exception applies only inside the hero');
          assert.deepEqual(content.reuse.sort(),['cast-filters','hero-feature','home-index'],'Only three narrowly scoped groups reuse existing labels');
          assert.equal(content.feature.length,1);assert.equal(content.feature[0].isHero,true);
          assert.equal(content.feature[0].href,content.hero[0].href,'Initial hero feature links to the first original identity');
          assert.equal(content.feature[0].role+content.feature[0].name,content.hero[0].text,'Hero feature only repeats its original name and role');
          assert.equal(content.feature[0].text,content.feature[0].role+content.feature[0].name,'Hero feature adds no extra prose');
          assert.equal(content.index.length,1);assert.equal(content.index[0].isIndex,true);
          assert.deepEqual(content.index[0].items.map(item=>item.href),['#stages','#salons','#cast','#calendar','#beginnings'],'The section index targets the five existing chapters');
          for(const item of content.index[0].items){assert.equal(item.jump,item.href);assert.equal(item.text,item.heading,'Index labels repeat their existing section heading');assert.ok(item.text);}
          assert.equal(content.index[0].text,content.index[0].items.map(item=>item.text).join(''),'The index adds no extra prose');
          assert.equal(content.castFilters.length,1);assert.equal(content.castFilters[0].isCast,true);
          assert.deepEqual(content.castFilters[0].items,originalCastFilters,'Home filters reuse the original character-page categories');
          assert.equal(content.castFilters[0].text,originalCastFilters.map(item=>item.text).join(''),'Cast filters add no extra prose');
        }else assert.equal(content.additions.length+content.castOverview.length+content.reuse.length,0,`${file}: home exceptions never hide other page content`);
        assert.equal(hash(content.text),expected.text_sha256,`${file}: original wording and order are preserved (${expected.characters} → ${content.text.length} characters)`);
        containsAll(content.attrs,expected.copy_attributes,`${file}: preserved copy attribute`);
        containsAll(content.links,expected.links,`${file}: preserved link and label`);
      }
      await ctx.close();console.log('PASS original data, wording, labels and links across 17 pages; approved twelve-person hero expansion');
    }
    if(run('assets')){
      const {ctx,page}=await context();
      await visit(page,'home.html');
      const editorialFiles=new Set(),resources=new Map();
      let editorialCount=0,salonCount=0,modeCount=0;
      for(const file of Object.keys(baseline.pages)){
        const response=await page.request.get(new URL(file,base).href);assert.equal(response.status(),200,file);
        const panels=await page.evaluate(source=>{
          const doc=new DOMParser().parseFromString(source,'text/html');
          return {
            editorial:[...doc.querySelectorAll('img[data-editorial]')].map(img=>({src:img.getAttribute('src'),srcset:img.getAttribute('srcset'),sizes:img.getAttribute('sizes'),width:img.width,height:img.height,loading:img.loading,decoding:img.decoding,framed:!!img.closest('.art-frame[data-art]')})),
            salon:[...doc.querySelectorAll('.salon-art img')].map(img=>({src:img.getAttribute('src'),loading:img.loading,width:img.width,height:img.height})),
            mode:[...doc.querySelectorAll('.mode-art img')].map(img=>({src:img.getAttribute('src'),loading:img.loading,width:img.width,height:img.height}))
          };
        },await response.text());
        for(const img of panels.editorial){
          editorialFiles.add(file);editorialCount++;
          assert.ok(img.width>0&&img.height>0,`${file}: editorial image reserves its aspect ratio`);
          assert.equal(img.loading,'lazy',`${file}: editorial images load near the viewport`);
          assert.equal(img.decoding,'async',`${file}: editorial decoding is asynchronous`);
          assert.ok(img.sizes&&img.srcset,`${file}: editorial image declares responsive candidates and sizes`);
          assert.ok(img.framed,`${file}: editorial art retains its frame`);
          const candidates=img.srcset.split(',').map(part=>part.trim().split(/\s+/));
          assert.ok(candidates.length>=2,`${file}: editorial image has a smaller responsive candidate`);
          const add=(source,width)=>{
            const url=new URL(source,new URL(file,base)).href;
            resources.set(url,{width,heightRatio:img.height/img.width});
          };
          add(img.src,img.width);
          for(const [source,width] of candidates){assert.match(width,/^\d+w$/,`${file}: responsive width descriptor`);add(source,parseInt(width,10));}
        }
        for(const [kind,images] of [['salon',panels.salon],['mode',panels.mode]])for(const img of images){
          if(kind==='salon')salonCount++;else modeCount++;
          assert.ok(img.width>0&&img.height>0,`${file}: ${kind} image reserves space`);
          assert.equal(img.loading,'lazy',`${file}: ${kind} art is deferred`);
          const url=new URL(img.src,new URL(file,base)).href;
          if(!resources.has(url))resources.set(url,{heightRatio:img.height/img.width});
        }
      }
      assert.ok(editorialCount>=2,'The new editorial panels are present');
      assert.ok(salonCount>=4,'All four salons have visual panels');
      assert.ok(modeCount>=3,'All three starting modes have visual panels');
      for(const [url,expected] of resources){
        const decoded=await page.evaluate(async url=>{
          const response=await fetch(url);if(!response.ok)return{status:response.status};
          const bitmap=await createImageBitmap(await response.blob());
          const size={status:response.status,width:bitmap.width,height:bitmap.height};bitmap.close();return size;
        },url);
        assert.equal(decoded.status,200,`New art resolves: ${url}`);
        assert.ok(decoded.width>0&&decoded.height>0,`New art decodes: ${url}`);
        if(expected.width)assert.equal(decoded.width,expected.width,`Responsive width matches the actual image: ${url}`);
        assert.ok(Math.abs(decoded.height/decoded.width-expected.heightRatio)<.02,`Image metadata matches the actual aspect ratio: ${url}`);
      }
      await ctx.close();
      for(const options of [{viewport:{width:1440,height:900},deviceScaleFactor:1},{viewport:{width:375,height:812},deviceScaleFactor:2,isMobile:true,hasTouch:true}]){
        const {ctx,page}=await context(options);
        for(const file of editorialFiles){
          await visit(page,file);
          for(const img of await page.locator('img[data-editorial]').all()){
            await img.scrollIntoViewIfNeeded();
            await img.evaluate(async img=>{await img.decode();});
            const selected=await img.evaluate(img=>({current:img.currentSrc,width:img.getBoundingClientRect().width,dpr:devicePixelRatio,candidates:img.srcset.split(',').map(part=>{const [src,width]=part.trim().split(/\s+/);return{src:new URL(src,document.baseURI).href,width:parseInt(width,10)};})}));
            const candidate=selected.candidates.find(candidate=>candidate.src===selected.current);
            assert.ok(candidate,`${file}: browser selects a declared responsive image`);
            assert.ok(candidate.width>=Math.min(Math.max(...selected.candidates.map(candidate=>candidate.width)),selected.width*selected.dpr*.8),`${file}: chosen artwork is sharp at the rendered size`);
          }
          await noOverflow(page,`${file} after editorial images decode at ${options.viewport.width}px`);
        }
        await ctx.close();
      }
      console.log('PASS new art dimensions, responsive candidates, deferred loading and decoded desktop/mobile layout');
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
      await visit(page,'home.html');await homeControls(page);await detailedCalendar(page);
      const gallery=page.locator('.slides');await gallery.scrollIntoViewIfNeeded();
      await page.locator('[data-gallery-step="1"]').click();
      await page.waitForFunction(()=>document.querySelector('.slides').scrollLeft>50);
      await page.locator('[data-gallery-step="-1"]').click();
      await page.waitForFunction(()=>document.querySelector('.slides').scrollLeft<5);
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
      const firstPlaceGroup=page.locator('.atlas details.placegroup').first();
      await chooseImage(page,firstPlaceGroup.locator('[data-pick]').last(),'.atlas [data-out="img"]');
      await page.keyboard.press('ArrowRight');
      const nextPlaceGroup=page.locator('.atlas details.placegroup').nth(1),firstPlace=nextPlaceGroup.locator('[data-pick]').first();
      assert.notEqual(await nextPlaceGroup.getAttribute('open'),null,'Keyboard navigation opens the selected place group');
      assert.equal(await firstPlace.getAttribute('aria-pressed'),'true');
      const thumbPlace=nextPlaceGroup.locator('[data-pick]').nth(1);
      await thumbPlace.locator('img.place-thumb').click();
      assert.equal(await page.locator('.atlas [data-out="img"]').getAttribute('src'),await thumbPlace.getAttribute('data-set-img'),'World thumbnails select their full-size scene');
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
      const eye=page.locator('.eyes [data-pick][data-set-portrait]').nth(2);
      await chooseImage(page,eye,'.eye-portrait [data-out="portrait"]','data-set-portrait');
      assert.equal(await page.locator('.eyes [data-out="name"]').textContent(),await eye.getAttribute('data-set-name'),'Portrait selection keeps the existing prose synchronized');
      await ctx.close();console.log('PASS desktop controls, calendar scrub/keys, viewer focus, gallery arrows/drag, world thumbnails, filters/hashes and form copy/storage');
    }
    if(run('mobile')){
      const {ctx,page}=await context({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2});
      await visit(page,'home.html');await homeControls(page);await noOverflow(page,'Mobile home with active panels');
      await page.locator('.cal [data-panel="1"] .calendar-scene [data-zoom-open]').tap();
      const viewer=page.locator('dialog[data-image-viewer]');assert.equal(await viewer.isVisible(),true);
      await viewer.locator('[data-zoom-close]').tap();assert.equal(await viewer.isVisible(),false,'Touch can close the image viewer');
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
