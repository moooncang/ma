// Render the entrance's original sculpted musical symbols. Needs Playwright,
// Chromium and the static server (ENTRY_TEST_URL, default localhost:4173).
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage();
    await page.goto(new URL('home.html', process.env.ENTRY_TEST_URL || 'http://127.0.0.1:4173/').href, {waitUntil:'domcontentloaded'});
    for (const type of ['eighth','beamed','quarter','sixteenth']) {
      const png = await page.evaluate(async type => {
        const T = await import('./assets/vendor/three.module.min.js');
        const renderer = new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
        renderer.setSize(480,640); renderer.setPixelRatio(1);
        renderer.setClearColor(0,0); renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
        const room = new T.Scene(); room.background = new T.Color('#514331');
        function panel(x,y,z,w,h,color,intensity) {
          const p = new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));
          p.position.set(x,y,z); p.lookAt(0,0,0); room.add(p);
        }
        panel(-5,4,6,3,8,'#fff4dc',6); panel(5,1,3,2,9,'#d8e8ff',5);
        panel(0,6,-3,7,3,'#fff2d0',4); panel(0,-3,6,7,2,'#b8853d',1);
        const pmrem=new T.PMREMGenerator(renderer); const environment=pmrem.fromScene(room).texture;
        const scene = new T.Scene(); scene.environment=environment;
        scene.add(new T.HemisphereLight(0xffefd0,0x49381a,2));
        const light=new T.DirectionalLight(0xfff3d9,4); light.position.set(-50,100,100); scene.add(light);
        const rim=new T.DirectionalLight(0xcfe4ff,2); rim.position.set(80,20,-20); scene.add(rim);
        const face=new T.MeshPhysicalMaterial({color:0xffe3a4,metalness:.86,roughness:.23,clearcoat:1,clearcoatRoughness:.16});
        const side=new T.MeshStandardMaterial({color:0xaf7727,metalness:.95,roughness:.24});
        const group=new T.Group(); scene.add(group);
        function shape(points) {
          const s = new T.Shape();
          for(const [i,p] of points.entries()) {
            if(p.length===2) { if(i===0)s.moveTo(p[0]-40,60-p[1]);else s.lineTo(p[0]-40,60-p[1]); }
            else s.bezierCurveTo(p[0]-40,60-p[1],p[2]-40,60-p[3],p[4]-40,60-p[5]);
          }
          s.closePath();
          const g=new T.ExtrudeGeometry(s,{depth:6,bevelEnabled:true,bevelThickness:1.6,bevelSize:1.25,bevelSegments:5,curveSegments:40});
          group.add(new T.Mesh(g,[face,side]));
        }
        function head(x,y,rx,ry) {
          const mesh=new T.Mesh(new T.SphereGeometry(1,48,32),face);
          mesh.scale.set(rx,ry,5.8); mesh.position.set(x-40,60-y,3); mesh.rotation.z=.4; group.add(mesh);
        }
        if(type==='beamed') {
          shape([[26,35],[69,22],[69,88],[63,90],[63,38],[32,47],[32,100],[26,102]]);
          head(17,100,16,10); head(54,88,16,10);
        } else {
          shape([[44,15],[49,13],[49,94],[44,97]]); head(31,95,19,12);
          if(type!=='quarter') shape([[48,14],[49,26,73,28,70,45],[68,53,63,58,60,60],[66,47,62,40,48,36]]);
          if(type==='sixteenth') shape([[48,38],[50,48,70,50,68,65],[66,72,62,76,58,79],[63,67,60,61,48,57]]);
        }
        group.rotation.set(-.17,-.35,type==='beamed' ? -.12 : -.08);
        const camera=new T.PerspectiveCamera(32,480/640,1,1000); camera.position.set(0,0,235); camera.lookAt(0,0,0);
        renderer.render(scene,camera);
        const result=renderer.domElement.toDataURL('image/png');
        scene.traverse(o=>{o.geometry?.dispose();});face.dispose();side.dispose();environment.dispose();pmrem.dispose();renderer.dispose();
        return result.split(',')[1];
      }, type);
      fs.writeFileSync(path.join(__dirname,`../assets/entry/note-${type}.png`),Buffer.from(png,'base64'));
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
