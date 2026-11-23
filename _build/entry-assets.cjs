// Lossless engraving caches and the unchanged 630-point note silhouettes.
// Requires Playwright, Chromium, Python + Pillow; serve the repository first.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/entry/cache');
 fs.mkdirSync(out,{recursive:true});const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ma-engraving-'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.route('https://fonts.**/*',r=>r.abort());
  await page.goto(new URL('home.html',process.env.ENTRY_TEST_URL||'http://127.0.0.1:4173/').href,{waitUntil:'domcontentloaded'});
  for(let i=1;i<=12;i++){
   const data=await page.evaluate(async i=>{
    const image=new Image();image.src='assets/entry/score-'+i+'.svg';await image.decode();
    const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1188;
    canvas.getContext('2d').drawImage(image,0,0,840,1188);
    return canvas.toDataURL('image/png').split(',')[1];
   },i);
   const png=path.join(temp,i+'.png'),webp=path.join(out,'score-'+i+'.webp');fs.writeFileSync(png,Buffer.from(data,'base64'));
   execFileSync('python',['-c','from PIL import Image; import sys; a=Image.open(sys.argv[1]); a.save(sys.argv[2],lossless=True,method=6); b=Image.open(sys.argv[2]); assert a.convert("RGBA").tobytes()==b.convert("RGBA").tobytes()',png,webp]);
  }
  const points=await page.evaluate(async()=>{
   const {noteCloud}=await import('./assets/js/entry-notes.js');let seed=83;
   const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
   return ['eighth','beamed','quarter','sixteenth'].flatMap(kind=>noteCloud(kind,random).flatMap(p=>[p.x,p.y,p.phase,p.size,p.drift,p.tone]));
  });
  fs.writeFileSync(path.join(out,'note-points.bin'),Buffer.from(new Float32Array(points).buffer));
  console.log('12 lossless 840×1188 engravings verified; 4 × 630 note points cached');
 }finally{await browser.close();fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
