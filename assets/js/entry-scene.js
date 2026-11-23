import * as THREE from '../vendor/three.module.min.js';

// Real tessellated sheets: both faces, curling edges, changing surface normals,
// grazing light and shadows between the sheets. All resources are local.
export async function createPaperScene(canvas, layout) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 1, 6000);
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
  const loader = new THREE.TextureLoader();
  let textures;
  try {
    textures = await Promise.all(Array.from({length:12}, (_, i) => loader.loadAsync(`assets/entry/score-${i+1}.svg`)));
  } catch (error) { renderer.dispose(); throw error; }
  textures = textures.map(source => {
    // Rasterise the engraving onto subtly uneven paper stock, retaining sharp ink.
    const paper=document.createElement('canvas');paper.width=840;paper.height=1188;
    const context=paper.getContext('2d');context.drawImage(source.image,0,0,840,1188);
    const image=context.getImageData(0,0,840,1188);
    for(let i=0;i<image.data.length;i+=4) {
      const fibreNoise=(Math.random()-.5)*3.5;
      for(let channel=0;channel<3;channel++) image.data[i+channel]=Math.max(14,image.data[i+channel]+fibreNoise);
    }
    context.putImageData(image,0,0);
    const texture=new THREE.CanvasTexture(paper);
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    source.dispose();return texture;
  });
  // A subtle fibre bump catches grazing light without obscuring the notation.
  const grain = document.createElement('canvas'); grain.width=grain.height=256;
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
  let width, height, stopped = false, frame = 0, flightStart = null;
  function resize() {
    width = innerWidth; height = innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(21)));
    camera.updateProjectionMatrix();
    ground.scale.set(width*4,height*4,1);
  }
  resize();
  function onResize() { resize(); if (flightStart === null) render(performance.now()); }
  addEventListener('resize', onResize);
  const smooth = x => x * x * (3 - 2 * x);
  function render(now) {
    if (stopped) return;
    // The resting papers need no GPU loop. CSS handles the light and note.
    if (flightStart !== null) frame = requestAnimationFrame(render);
    for (const [i, { mesh, sheet, original,curveY,curveZ }] of papers.entries()) {
      const elapsed = flightStart === null ? 0 : Math.max(0, (now - flightStart) / 1000 - sheet.delay);
      const p = Math.min(1, elapsed / 2.65);
      const lift = smooth(Math.min(1, p * 4));
      const sweep = Math.pow(p,1.7);
      const w = Math.max(width * (sheet.mobile?.9:.39), height * (sheet.mobile?.43:.63))*sheet.scale;
      const h = w * 1.414;
      mesh.visible = p < 1;
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
    renderer.render(scene, camera);
  }
  render(performance.now());
  return {
    fly() { flightStart = performance.now(); frame = requestAnimationFrame(render); },
    dispose() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      removeEventListener('resize', onResize);
      papers.forEach(({mesh}) => { mesh.geometry.dispose(); mesh.material.dispose(); });
      textures.forEach(texture => texture.dispose());fibre.dispose();ground.geometry.dispose();ground.material.dispose();
      key.shadow.dispose(); renderer.dispose();
    }
  };
}
