// Home-stage interaction checks. Requires the static server documented in README.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:4173/';
const group=process.env.HOME_TEST_GROUP;
const run=name=>!group||group===name;

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const problems=[];
  async function open(options={}){
    const context=await browser.newContext(options);
    await context.addInitScript(()=>{
      const frame=requestAnimationFrame.bind(window);window.homeFrameRequests=0;
      window.requestAnimationFrame=callback=>{window.homeFrameRequests++;return frame(callback);};
    });
    const page=await context.newPage();
    page.on('pageerror',error=>problems.push(error.message));
    page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400&&!response.url().endsWith('favicon.ico'))problems.push(`${response.status()} ${response.url()}`);});
    await page.goto(new URL('home.html',base).href,{waitUntil:'domcontentloaded'});
    await page.locator('.home[data-home-ready="true"]').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    return {context,page};
  }
  async function ensemble(page,index){
    await page.waitForFunction(index=>document.querySelector('.home').dataset.heroIndex===String(index),index);
    const card=page.locator('.hero .fig').nth(index);
    assert.equal(await page.locator('.hero-feature-name').textContent(),await card.locator('b').textContent(),'Feature name matches the selected person');
    assert.equal(await page.locator('.hero-feature-role').textContent(),await card.locator('span').first().textContent(),'Feature role matches the selected person');
    assert.equal(new URL(await page.locator('.hero-feature-link').getAttribute('href'),page.url()).href,new URL(await card.getAttribute('href'),page.url()).href,'Feature detail link matches the selected person');
    const source=await card.getAttribute('data-portrait-feature');
    assert.ok(source,'Each person supplies its original feature portrait');
    await page.waitForFunction(source=>{
      const image=document.querySelector('[data-hero-portrait]');
      return image.complete&&image.naturalWidth>0&&new URL(image.getAttribute('src'),location.href).href===new URL(source,location.href).href;
    },source);
    assert.equal(await page.locator('[data-hero-portrait]').evaluate(image=>image.style.objectPosition),await card.getAttribute('data-portrait-position'),'The selected face keeps its own focal position');
  }
  async function noOverflow(page){
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth+1),true,'The page stays within the viewport');
  }
  async function noIdleLoop(page){
    await page.mouse.move(0,0);await page.waitForTimeout(1800);
    const before=await page.evaluate(()=>homeFrameRequests);await page.waitForTimeout(800);
    assert.equal(await page.evaluate(()=>homeFrameRequests),before,'The idle home page does not request animation frames');
    assert.equal(await page.evaluate(()=>document.getAnimations().some(animation=>animation.playState==='running'&&animation.effect?.getTiming().iterations===Infinity)),false,'The home page has no infinite decorative animations');
  }
  async function filterCast(page,value){
    const button=page.locator(`[data-cast-filter="${value}"]`);await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    const expected=value?await page.locator(`.slides .slide[data-cast-group="${value}"]`).count():12;
    assert.equal(await page.locator('.slides .slide:visible').count(),expected,'Filtering shows exactly the matching people');
    assert.equal(await page.locator('.slides .slide').count(),12,'Filtering retains all twelve original links');
    const gallery=page.locator('.slides');
    await page.waitForFunction(()=>Math.abs(document.querySelector('.slides').scrollLeft)<2);
    const overflows=await gallery.evaluate(el=>el.scrollWidth>el.clientWidth+3);
    const next=page.locator('[data-gallery-step="1"]');
    if(overflows){
      await next.click();await page.waitForFunction(()=>document.querySelector('.slides').scrollLeft>30);
    }else{
      await page.waitForFunction(()=>document.querySelector('[data-gallery-step="1"]').disabled);
      assert.equal(await next.isDisabled(),true,'A complete filtered row cannot be advanced beyond its end');
    }
  }
  async function stageSelection(page,index){
    assert.equal(await page.locator(`.stages > .steps > [data-tab="${index}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator(`.stages > [data-panel="${index}"]`).isVisible(),true);
  }
  try{
    if(run('hero')){
      const {context,page}=await open({viewport:{width:1440,height:900}});
      assert.equal(await page.locator('.hero .fig:visible').count(),12,'All twelve original portrait links are visible');
      await ensemble(page,0);
      await page.locator('.hero .fig').nth(4).hover();await ensemble(page,4);
      await page.locator('.hero .fig').nth(8).hover();await page.locator('.hero .fig').nth(2).hover();await ensemble(page,2);
      await page.locator('[data-hero-step="1"]').click();await ensemble(page,3);
      await page.locator('[data-hero-step="-1"]').click();await ensemble(page,2);
      await page.locator('.hero .fig').nth(11).focus();await ensemble(page,11);
      await page.keyboard.press('ArrowRight');await ensemble(page,0);
      await page.keyboard.press('ArrowLeft');await ensemble(page,11);
      await page.keyboard.press('Home');await ensemble(page,0);
      await page.keyboard.press('End');await ensemble(page,11);
      await noIdleLoop(page);await noOverflow(page);
      const detail=await page.locator('.hero-feature-link').getAttribute('href');
      await page.locator('.hero-feature-link').click();await page.waitForURL(new URL(detail,base).href);
      await context.close();console.log('PASS home hero hover/focus, image race, stepping, keyboard wrap, detail link and idle rendering');
    }
    if(run('stages')){
      const {context,page}=await open({viewport:{width:1440,height:900}});
      for(const control of await page.locator('[data-stage-jump]').all()){
        const index=Number(await control.getAttribute('data-stage-jump'));await control.click();await stageSelection(page,index);
      }
      await page.locator('.stages > .steps > [data-tab="4"]').click();
      await page.locator('[data-stage-step="1"]').click();await stageSelection(page,0);
      await page.locator('[data-stage-step="-1"]').click();await stageSelection(page,4);
      await page.locator('.stages > .steps > [data-tab="2"]').click();
      const frame=page.locator('.stages > [data-panel="2"] [data-stage-compare-frame]');
      const toggle=frame.locator('[data-stage-compare-toggle]'),slider=frame.locator('[data-stage-compare]');
      await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');assert.equal(await slider.isVisible(),true);
      assert.equal(await frame.locator('.stage-compare-layer img').getAttribute('src'),await frame.getAttribute('data-compare-after'),'Comparison reveals the matching full performance image');
      await slider.focus();await page.keyboard.press('End');assert.equal(await slider.inputValue(),'100');
      await page.keyboard.press('Home');assert.equal(await slider.inputValue(),'0');
      await frame.locator('[data-pick]').last().click();assert.equal(await toggle.getAttribute('aria-pressed'),'false','Explicit scene selection exits comparison');
      await filterCast(page,'학생');await filterCast(page,'교수');await filterCast(page,'바깥');await filterCast(page,'');
      for(const target of ['#calendar','#beginnings','#salons']){
        await page.locator(`[data-home-jump="${target}"]`).click();
        await page.waitForFunction(target=>{const rect=document.querySelector(target).getBoundingClientRect();return rect.top>=0&&rect.top<innerHeight*.6;},target);
      }
      await noOverflow(page);await context.close();console.log('PASS home stage navigation/comparison, cast filters/gallery edges and chapter navigation');
    }
    if(run('mobile')){
      const {context,page}=await open({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2});
      await page.locator('[data-hero-step="1"]').tap();await ensemble(page,1);
      const swipe=page.locator('[data-hero-swipe]');await swipe.scrollIntoViewIfNeeded();
      const box=await swipe.boundingBox(),client=await context.newCDPSession(page);
      const start={x:box.x+box.width*.72,y:box.y+box.height*.5},end={x:box.x+box.width*.22,y:start.y};
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
      for(let step=1;step<=6;step++){
        await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*step/6,y:start.y}]});
        await page.waitForTimeout(20);
      }
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await ensemble(page,2);
      await filterCast(page,'교수');await noOverflow(page);
      const portrait=page.locator('.hero .fig').nth(5),destination=await portrait.getAttribute('href');
      await portrait.tap();await page.waitForURL(new URL(destination,base).href);
      await context.close();console.log('PASS mobile hero buttons/native touch swipe and filtered gallery navigation');
    }
    if(run('motion')){
      const {context,page}=await open({viewport:{width:390,height:844},reducedMotion:'reduce'});
      await page.locator('[data-hero-step="1"]').click();await ensemble(page,1);
      await page.locator('[data-home-jump="#calendar"]').click();
      assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running'&&Number(animation.effect?.getTiming().duration)>1).length),0,'Reduced motion keeps the new interactions still');
      await noOverflow(page);await context.close();console.log('PASS reduced-motion home retains navigation and selection');
    }
    assert.deepEqual(problems,[],'No page errors or missing local assets');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
