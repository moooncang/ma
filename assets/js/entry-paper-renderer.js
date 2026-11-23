import * as THREE from '../vendor/three.module.min.js';
import {createRipplePass} from './entry-ripple-pass.js?v=ripple-7';

// Real tessellated sheets: both faces, curling edges, changing surface normals,
// grazing light and shadows between the sheets. All resources are local.
export async function createPaperRenderer(canvas, layout, viewport) {
  const makeCanvas = () => typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(1, 1) : document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(viewport.dpr, 1.5));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, viewport.width / viewport.height, 1, 6000);
  const ambient = new THREE.HemisphereLight(0xfffdf5, 0x707a88, 1.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff7e8, 2.2);
  key.position.set(-450, 700, 950);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left:-1600, right:1600, top:1600, bottom:-1600, near:1, far:4000 });
  key.shadow.bias = -.001;
  key.shadow.normalBias = 2.5;
  key.shadow.radius = 3;
  scene.add(key);
  // Lossless raster caches avoid parsing thousands of SVG paths on arrival.
  // Texture grain is generated off the UI thread; the pixels/material are unchanged.
  const bitmaps = await Promise.all(Array.from({length:12}, async (_, i) => {
    const response = await fetch(new URL('../entry/cache/score-' + (i+1) + '.webp', import.meta.url));
    if (!response.ok) throw new Error('Missing engraving');
    return createImageBitmap(await response.blob());
  })).catch(error => { renderer.dispose(); throw error; });
  const textures = [];
  let noiseSeed = 83;
  for (const bitmap of bitmaps) {
    const paper=makeCanvas();paper.width=840;paper.height=1188;
    const context=paper.getContext('2d', {willReadFrequently:true});context.drawImage(bitmap,0,0,840,1188);
    bitmap.close();
    const image=context.getImageData(0,0,840,1188);
    for(let i=0;i<image.data.length;i+=4) {
      noiseSeed=noiseSeed*16807%2147483647;
      const fibreNoise=(noiseSeed/2147483647-.5)*3.5;
      for(let channel=0;channel<3;channel++) image.data[i+channel]=Math.max(14,image.data[i+channel]+fibreNoise);
    }
    context.putImageData(image,0,0);
    const texture=new THREE.CanvasTexture(paper);
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    textures.push(texture);
    renderer.initTexture(texture);
    // Also keep the non-worker compatibility path responsive between pages.
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  // A subtle fibre bump catches grazing light without obscuring the notation.
  const grain = makeCanvas(); grain.width=grain.height=256;
  const grainContext=grain.getContext('2d');
  const pixels=grainContext.createImageData(256,256);
  for(let i=0;i<pixels.data.length;i+=4) {
    const value=120+Math.random()*18;
    pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;
  }
  grainContext.putImageData(pixels,0,0);
  const fibre = new THREE.CanvasTexture(grain); fibre.wrapS=fibre.wrapT=THREE.RepeatWrapping; fibre.repeat.set(4,6);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:.16}));
  ground.position.z=-80; ground.receiveShadow=true;scene.add(ground);
  const segments=32;
  const papers = layout.map((sheet, i) => {
    const geometry = new THREE.PlaneGeometry(1, 1, 20, segments);
    const material = new THREE.MeshStandardMaterial({ map:textures[i % 12], bumpMap:fibre, bumpScale:.22, color:0xffffff, side:THREE.DoubleSide, roughness:.94, metalness:0 });
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>',
        '#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb = mix(vec3(0.91, 0.89, 0.83), diffuseColor.rgb, 0.045);');
    };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return { mesh, sheet, original:geometry.attributes.position.array.slice(), curveY:new Float32Array(segments+1),curveZ:new Float32Array(segments+1) };
  });
  let width, height, stopped = false, frame = 0, flightStart = null, finishFlight;
  let ripple = null, rippleReady = null, rippleStart = null, sceneDirty = true;
  let lastRippleFrame=-Infinity;
  function resize() {
    width = viewport.width; height = viewport.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(21)));
    camera.updateProjectionMatrix();
    ground.scale.set(width*4,height*4,1);
    ripple?.resize(width,height);sceneDirty=true;
  }
  resize();

  const smooth = x => x * x * (3 - 2 * x);
  function render(now) {
    if (stopped) return;
    frame=0;
    // Worker RAF timestamps can belong to a different animation timeline.
    now = performance.now();
    const rippleAge=rippleStart===null ? 0 : (now-rippleStart)/1000;
    const refracting=rippleStart!==null && ripple!==null && rippleAge<.8 && flightStart===null;
    // Reuse the resting image during the ripple instead of re-rendering 3D sheets.
    if(flightStart===null && rippleStart!==null && ripple!==null && !sceneDirty) {
      // Match the light canvas cadence and finish before the paper flight starts.
      if(now-lastRippleFrame>=30 || !refracting){ripple.render(rippleAge);lastRippleFrame=now;}
      if(refracting)frame=requestAnimationFrame(render);
      return;
    }
    for (const [i, { mesh, sheet, original,curveY,curveZ }] of papers.entries()) {
      const elapsed = flightStart === null ? 0 : Math.max(0, (now - flightStart) / 1000 - sheet.delay);
      const p = Math.min(1, elapsed / 2.65);
      const lift = smooth(Math.min(1, p * 4));
      const sweep = Math.pow(p,1.7);
      const w = Math.max(width * (sheet.mobile?.9:.39), height * (sheet.mobile?.43:.63))*sheet.scale;
      const h = w * 1.414;
      mesh.visible = p < 1;
      if (!mesh.visible) continue;
      mesh.position.set(
        (sheet.x - .5) * width + sweep * width * (sheet.direction * 2.3) + Math.sin(p*Math.PI)*sheet.direction*width*.12,
        (.5 - sheet.y) * height + sweep * height * (1.75 + sheet.random * .7),
        i * 3.5 + lift * Math.sin(p * Math.PI) * camera.position.z * .16
      );
      mesh.rotation.set(lift * (.25 + Math.sin(p * 4 + sheet.random*6) * .34),
        lift * (Math.sin(p * 5 + sheet.random * 4) * .32 + p * .45),
        sheet.angle + sweep * sheet.direction * .85);
      // Integrate the centreline tangent, preserving length as paper bends.
      // Waves travel down the sheet; the free edge lags and twists separately.
      curveY[0]=h*.5;curveZ[0]=0;
      const phase=sheet.random*6.28;
      const time=elapsed*(6.2+sheet.random*2);
      for(let row=1;row<=segments;row++) {
        const v=row/segments;
        const bend=lift*(.8*Math.sin(v*5.3-time+phase)+.3*Math.sin(v*10.5-time*1.4+phase))*(.45+v*.55);
        curveY[row]=curveY[row-1]-h/segments*Math.cos(bend);
        curveZ[row]=curveZ[row-1]-h/segments*Math.sin(bend);
      }
      const centerY=(curveY[0]+curveY[segments])/2, centerZ=(curveZ[0]+curveZ[segments])/2;
      const positions = mesh.geometry.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        const u = original[j * 3], v = original[j * 3 + 1];
        const row=Math.round((.5-v)*segments);
        const twist=lift*.26*Math.sin(v*5-time*.75+phase);
        const edge=lift*Math.pow(Math.abs(u)*2,3)*w*.035*Math.sin(v*9-time*1.5+phase);
        const restingCurl=Math.pow(u+.5,4)*2.5;
        positions.setXYZ(j, u*w*Math.cos(twist),curveY[row]-centerY,curveZ[row]-centerZ+u*w*Math.sin(twist)+edge+restingCurl);
      }
      positions.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    }
    if(refracting) {ripple.capture(scene,camera);ripple.render(rippleAge);}
    else renderer.render(scene, camera);
    sceneDirty=false;
    if(ripple!==null && flightStart!==null) {
      rippleStart=null;ripple?.dispose();ripple=null;rippleReady=null;
    }
    if (flightStart !== null && papers.every(({mesh}) => !mesh.visible)) {
      cancelAnimationFrame(frame); frame = 0; finishFlight?.(); finishFlight = null;
    } else if(flightStart!==null || refracting)frame=requestAnimationFrame(render);
  }
  await renderer.compileAsync(scene, camera);
  render(performance.now());
  // Do not reveal a WebGL surface whose first GPU frame is still queued.
  // Poll the fence asynchronously instead of making the compositor wait for it.
  const gl = renderer.getContext(), fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  if (fence) {
    gl.flush();
    await new Promise(resolve => {
      const deadline = performance.now() + 5000;
      const check = () => {
        const status = gl.clientWaitSync(fence, 0, 0);
        if (status !== gl.TIMEOUT_EXPIRED || performance.now() > deadline) { gl.deleteSync(fence); resolve(); }
        else setTimeout(check, 8);
      };
      check();
    });
  }
  function prepareRipple() {
    if(stopped)return Promise.resolve();
    if(rippleReady)return rippleReady;
    try {
      const pass=createRipplePass(renderer,width,height);ripple=pass;
      rippleReady=pass.ready.then(()=>{if(!stopped && ripple===pass)pass.capture(scene,camera);}).catch(()=>{
        if(ripple===pass){pass.dispose();ripple=null;rippleStart=null;rippleReady=null;}
      });
    } catch {ripple?.dispose();ripple=null;rippleStart=null;return Promise.resolve();}
    return rippleReady;
  }
  return {
    prepareRipple,
    ripple() {
      if(stopped)return;
      rippleStart=performance.now();
      prepareRipple().then(()=>{if(!stopped && !frame)frame=requestAnimationFrame(render);});
    },
    resize(next) { viewport = next; resize(); if (flightStart === null && !frame) render(performance.now()); },
    fly() {
      rippleStart=null;
      flightStart = performance.now();
      return new Promise(resolve => { finishFlight = resolve; if(!frame)frame = requestAnimationFrame(render); });
    },
    dispose() {
      if (stopped) return;
      stopped = true;
      finishFlight?.(); finishFlight = null;
      cancelAnimationFrame(frame);
      ripple?.dispose();ripple=null;
      papers.forEach(({mesh}) => { mesh.geometry.dispose(); mesh.material.dispose(); });
      textures.forEach(texture => texture.dispose());fibre.dispose();ground.geometry.dispose();ground.material.dispose();
      key.shadow.dispose(); renderer.dispose();
    }
  };
}
