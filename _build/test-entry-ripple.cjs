// Verify the actual GPU refraction: changes travel outward, not across the whole image.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage();
    await page.route('https://fonts.**/*',route=>route.abort());
    await page.goto(new URL('home.html',process.env.ENTRY_TEST_URL||'http://127.0.0.1:4173/').href,{waitUntil:'domcontentloaded'});
    const result=await page.evaluate(async()=>{
      const THREE=await import('./assets/vendor/three.module.min.js');
      const {createRipplePass}=await import('./assets/js/entry-ripple-pass.js?v=ripple-7');
      const size=384,renderer=new THREE.WebGLRenderer({preserveDrawingBuffer:true,alpha:true});
      renderer.setSize(size,size);renderer.setPixelRatio(1);
      const grid=document.createElement('canvas');grid.width=grid.height=size;
      const c=grid.getContext('2d');c.fillStyle='#f5efdf';c.fillRect(0,0,size,size);
      c.fillStyle='#182431';for(let i=0;i<size;i+=12){c.fillRect(i,0,2,size);c.fillRect(0,i,size,2);}
      const texture=new THREE.CanvasTexture(grid);texture.colorSpace=THREE.SRGBColorSpace;
      const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);
      const geometry=new THREE.PlaneGeometry(2,2),material=new THREE.MeshBasicMaterial({map:texture});
      scene.add(new THREE.Mesh(geometry,material));
      const pass=createRipplePass(renderer,size,size);await pass.ready;pass.capture(scene,camera);
      const gl=renderer.getContext();
      renderer.render(scene,camera);
      const original=new Uint8Array(size*size*4);gl.readPixels(0,0,size,size,gl.RGBA,gl.UNSIGNED_BYTE,original);
      const pixels=age=>{pass.render(age);const p=new Uint8Array(size*size*4);gl.readPixels(0,0,size,size,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
      const baseline=pixels(-1);
      let colourDelta=0;for(let i=0;i<original.length;i++)colourDelta=Math.max(colourDelta,Math.abs(original[i]-baseline[i]));
      const measure=age=>{
        const p=pixels(age);let changed=0,radius=0,centre=0,far=0;
        for(let y=0;y<size;y++)for(let x=0;x<size;x++){
          const k=(y*size+x)*4;
          const difference=Math.max(...[0,1,2].map(c=>Math.abs(p[k+c]-baseline[k+c])));
          if(difference<12)continue;
          const r=Math.hypot(x-size*.5,y-size*.52);changed++;radius+=r;
          if(r<16)centre++;if(r>250)far++;
        }
        return {changed,meanRadius:radius/changed,centre,far};
      };
      const early=measure(.3),late=measure(.42),settled=measure(1.5),error=gl.getError();
      pass.dispose();geometry.dispose();material.dispose();texture.dispose();renderer.dispose();
      return {early,late,settled,error,colourDelta};
    });
    assert.equal(result.error,0,'GPU pass completes without WebGL errors');
    assert.ok(result.colourDelta<=2,'The cached image preserves the original paper colours');
    assert.ok(result.early.changed>1000 && result.late.changed>1000,'Visible refraction is rendered');
    assert.ok(result.late.meanRadius>result.early.meanRadius+35,'The wavefront moves outward');
    assert.equal(result.early.centre+result.late.centre,0,'The centre stays still after the wave passes');
    assert.equal(result.early.far+result.late.far,0,'Pixels beyond the wavefront stay still');
    assert.equal(result.settled.changed,0,'The image returns exactly to its undistorted state');
    console.log('PASS localized outward water refraction',JSON.stringify(result));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
