// Measure the main UI thread in one browser at a time. GPU/software renderer affects wall-clock gaps.
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const output=process.env.ENTRY_PROFILE_DIR||'/tmp/ma-entry-profile';fs.mkdirSync(output,{recursive:true});
const label=process.argv[2]||'current';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const result=[];
 try {
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]) {
  const ctx=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1});
  await ctx.route('https://fonts.**/*',r=>r.abort());
  await ctx.addInitScript(()=>{
   const state=()=>document.querySelector('#entry')?.dataset.phase||'done';
   window.profile={raf:{},long:[],gaps:{},painted:0};
   const native=requestAnimationFrame;let previous;
   requestAnimationFrame=function(callback){return native.call(window,now=>{
    const phase=state(),name=callback.name||'anonymous',start=performance.now();
    callback(now);
    (profile.raf[phase+':'+name]??=[]).push(performance.now()-start);
   });};
   const clock=now=>{const phase=state();if(previous)(profile.gaps[phase]??=[]).push(now-previous);previous=now;native.call(window,clock);};native.call(window,clock);
   new PerformanceObserver(list=>list.getEntries().forEach(e=>profile.long.push({at:e.startTime,duration:e.duration,phase:state()}))).observe({type:'longtask',buffered:true});
   new MutationObserver(()=>{if(document.querySelector('.has-webgl')&&!profile.painted)profile.painted=performance.now();}).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});
  });
  const page=await ctx.newPage();const cdp=await ctx.newCDPSession(page);
  await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  await page.goto(process.env.ENTRY_TEST_URL||'http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('#entry.has-webgl.has-particle-notes').waitFor();
  await page.waitForTimeout(2000);await page.locator('#entry-start').click();await page.waitForURL('**/home.html');
  const cpu=await cdp.send('Profiler.stop');fs.writeFileSync(path.join(output,'cpu-'+label+'-'+viewport.width+'.json'),JSON.stringify(cpu.profile));
  const data=await page.evaluate(()=>{
   const stats=a=>{a.sort((a,b)=>a-b);return{count:a.length,avg:a.reduce((s,v)=>s+v,0)/a.length,p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
   return{ready:profile.painted,raf:Object.fromEntries(Object.entries(profile.raf).map(([k,v])=>[k,stats(v)])),gaps:Object.fromEntries(Object.entries(profile.gaps).map(([k,v])=>[k,stats(v)])),long:profile.long,bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.transferSize,0),decodedImages:[...document.images].filter(i=>i.complete).reduce((s,i)=>s+i.naturalWidth*i.naturalHeight*4,0)};
  });
  result.push({viewport,...data});console.log(JSON.stringify(result.at(-1)));await ctx.close();
 }
 fs.writeFileSync(path.join(output,'profile-'+label+'.json'),JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
