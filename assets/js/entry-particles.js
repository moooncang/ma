async function loadClouds(signal) {
  const response=await fetch(new URL('../entry/cache/note-points.bin',import.meta.url),{signal});
  if(!response.ok)throw new Error('Missing light points');
  const data=new Float32Array(await response.arrayBuffer());
  if(data.length!==4*630*6)throw new Error('Invalid light points');
  return Object.fromEntries(['eighth','beamed','quarter','sixteenth'].map((kind,index)=>{
    const points=[];
    for(let i=0;i<630;i++){const n=(index*630+i)*6;points.push({x:data[n],y:data[n+1],phase:data[n+2],size:data[n+3],drift:data[n+4],tone:data[n+5]});}
    return [kind,points];
  }));
}

// A single additive canvas for the notes themselves and the drifting light.
export async function createParticles(host,signal) {
  const clouds = await loadClouds(signal);
  const canvas = document.createElement('canvas'); host.append(canvas);
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return null; }
  let seed = 83;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const colors = ['#e8fcff','#c1e8ff','#e6d8ff','#fff6df','#ffffff'];
  const blooms = colors.map(color => {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    const c = sprite.getContext('2d'), gradient = c.createRadialGradient(16,16,0,16,16,16);
    gradient.addColorStop(0, color); gradient.addColorStop(.12, color + 'd0');
    gradient.addColorStop(.4, color + '30'); gradient.addColorStop(1, color + '00');
    c.fillStyle = gradient; c.fillRect(0,0,32,32); return sprite;
  });
  // Cache each glow + core together, preserving all 630 particles and DPR.
  const dots=colors.map((color,tone)=>{
    const sprite=document.createElement('canvas');sprite.width=sprite.height=64;
    const c=sprite.getContext('2d');c.globalCompositeOperation='lighter';
    c.globalAlpha=.52;c.drawImage(blooms[tone],0,0,64,64);
    c.globalAlpha=1;c.fillStyle=color;c.beginPath();c.arc(32,32,6.4,0,Math.PI*2);c.fill();return sprite;
  });
  let width, height, frame, stopped = false, gust = false, hovered = false, last = -Infinity;
  let focus = {x:.5,y:.48}, idle = true, dissolveAt = null, gatheringAt = null;
  let left=0,top=0,paintWidth=0,paintHeight=0;
  const notes = [], sparks = [];
  function resize() {
    width = innerWidth; height = innerHeight;
    const halfWidth=Math.max(170,Math.min(width,height)*.16*2.1+24);
    const halfHeight=Math.max(200,halfWidth*.9);
    left=idle?Math.max(0,width*.5-halfWidth):0;
    top=idle?Math.max(0,height*.48-halfHeight):0;
    paintWidth=idle?Math.min(width-left,halfWidth*2):width;
    paintHeight=idle?Math.min(height-top,halfHeight*2):height;
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width=Math.ceil(paintWidth*dpr);canvas.height=Math.ceil(paintHeight*dpr);
    Object.assign(canvas.style,{position:'absolute',left:left+'px',top:top+'px',width:paintWidth+'px',height:paintHeight+'px'});
    ctx.setTransform(dpr,0,0,dpr,-left*dpr,-top*dpr);
  }
  resize(); addEventListener('resize', resize);
  const start = document.getElementById('entry-start');
  const hover = () => { hovered = true; }, leave = () => { hovered = false; };
  start.addEventListener('pointerenter', hover); start.addEventListener('pointerleave', leave);
  start.addEventListener('focus', hover); start.addEventListener('blur', leave);
  function burst(x,y,strength=1,speed=1) {
    for (let i=0;i<26*strength;i++) {
      const a=random()*Math.PI*2, velocity=(20+random()*75)*speed;
      sparks.push({x:x*width,y:y*height,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity-16,life:0,max:.7+random()*1.2,size:.5+random(),tone:Math.floor(random()*5),trail:[]});
    }
  }
  function pulse(x,y,strength=1,kind='eighth',{duration=1.6,scale=.68,attack=.16}={}) {
    focus={x,y}; burst(x,y,strength);
    notes.push({x,y,kind,born:performance.now()/1000,duration,scale,attack});
  }
  function glint(x,y,r,alpha,tone=0) {
    ctx.globalAlpha=alpha;ctx.fillStyle=colors[tone];
    ctx.beginPath();ctx.moveTo(x,y-r*3);ctx.quadraticCurveTo(x+r*.12,y-r*.12,x+r*1.5,y);ctx.quadraticCurveTo(x+r*.12,y+r*.12,x,y+r*3);ctx.quadraticCurveTo(x-r*.12,y+r*.12,x-r*1.5,y);ctx.quadraticCurveTo(x-r*.12,y-r*.12,x,y-r*3);ctx.fill();
  }
  function drawNote(kind,cx,cy,scale,t,alpha,spread=0) {
    const breathe=1+Math.sin(t*1.25)*.018;
    const bob=Math.sin(t*1.1)*4;
    const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,72*scale);
    halo.addColorStop(0,'#b1e2ff0c');halo.addColorStop(.55,'#b8c3ff06');halo.addColorStop(1,'#adcfff00');
    ctx.globalAlpha=alpha;ctx.fillStyle=halo;ctx.fillRect(cx-75*scale,cy-75*scale,150*scale,150*scale);
    for (const p of clouds[kind]) {
      const drift=Math.sin(t*(.65+p.drift*.35)+p.phase);
      const scatter=spread*(25+p.drift*85);
      const x=cx+(p.x*breathe+drift*1.8+Math.cos(p.phase)*scatter)*scale;
      const y=cy+(p.y*breathe+Math.cos(t*.8+p.phase)*1.5+bob-Math.sin(p.phase)*scatter-spread*30)*scale;
      const brightness=(.42+.58*Math.sin(t*1.6+p.phase)**2)*alpha;
      const radius=(p.size+(hovered&&idle?.18:0))*scale;
      ctx.globalAlpha=brightness;
      const glow=radius*10;
      ctx.drawImage(dots[p.tone],x-glow/2,y-glow/2,glow,glow);
      if(p.drift>.982)glint(x,y,1.2*scale,brightness*.8,p.tone);
    }
    // Light continuously sheds from the silhouette into a loose ascending wake.
    for(let i=0;i<44;i++) {
      const age=(t*.15+i/44)%1, a=i*2.399+age*.7;
      const x=cx+Math.cos(a)*(27+age*58)*scale;
      const y=cy+(74-age*235+Math.sin(a)*20)*scale;
      const opacity=Math.sin(age*Math.PI)*alpha*.42;
      ctx.globalAlpha=opacity;ctx.drawImage(blooms[i%5],x-3,y-3,6,6);
      if(i%9===0)glint(x,y,.75,opacity,i%5);
    }
  }
  function draw(now) {
    if(stopped)return;
    frame=requestAnimationFrame(draw);if(now-last<30)return;
    const dt=Math.min((now-last)/1000,.05);last=now;const t=now/1000;
    ctx.clearRect(left,top,paintWidth,paintHeight);ctx.globalCompositeOperation='lighter';
    const mainScale=width<600?.9:1.08;
    if(idle)drawNote('eighth',width*.5,height*.48,mainScale,t,1);
    else if(dissolveAt!==null) {
      const p=Math.min(1,(t-dissolveAt)/2.4), fade=p*p*(3-2*p);
      if(p<1)drawNote('eighth',width*.5,height*.48,mainScale,t,1-fade,p*1.9);
    }
    for(let i=notes.length-1;i>=0;i--) {
      const n=notes[i],age=t-n.born,p=age/n.duration;
      if(p>=1){notes.splice(i,1);continue;}
      const fade=Math.min(1,age/n.attack)*Math.min(1,(1-p)*3.3);
      drawNote(n.kind,n.x*width,n.y*height,n.scale,t,fade,Math.max(0,n.attack-age)*3+Math.max(0,p-.65)*2.7);
    }
    const gather = gatheringAt===null ? 0 : Math.min(1,(t-gatheringAt)/.45);
    const cx=focus.x*width,cy=focus.y*height,r=Math.min(width,height)*(hovered?.12:.105)*(1-gather*.7);
    if(!gust) {
      for(let k=0;k<2;k++) {
        const a=t*(k?-.38:.3)+k*2.2,tilt=k?.48:-.55;
        const point=q=>{const x=Math.cos(q)*r*(1+k*.18),y=Math.sin(q)*r*.4;return[cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy+x*Math.sin(tilt)+y*Math.cos(tilt)];};
        for(let j=0;j<30;j++) {
          ctx.globalAlpha=(1-j/30)*.22;ctx.strokeStyle=colors[k];ctx.lineWidth=(1-j/30)*1.1;
          ctx.beginPath();ctx.moveTo(...point(a-j*.018));ctx.lineTo(...point(a-(j+1)*.018));ctx.stroke();
        }
        glint(...point(a),1.5,.65,k);
      }
      for(let i=0;i<28;i++) {
        const a=i*2.399+t*.04,d=r*(.7+(i%9)/6);
        const flicker=Math.max(0,Math.sin(t*(.5+i%3*.1)+i))**5;
        glint(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.85-Math.sin(t*.4+i)*12,.6+(i%3)*.4,flicker*.5,i%5);
      }
    }
    for(let i=sparks.length-1;i>=0;i--) {
      const p=sparks[i];p.life+=dt;if(p.life>p.max){sparks.splice(i,1);continue;}
      p.trail.unshift([p.x,p.y]);p.trail.length=Math.min(6,p.trail.length);
      if(gatheringAt!==null) {
        p.vx+=(width*.5-p.x)*dt*16;
        p.vy+=(height*.48-p.y)*dt*16;
      }
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=10*dt;p.vx*=.985;
      const alpha=(1-p.life/p.max)**1.4;
      for(let j=0;j<p.trail.length-1;j++) {
        ctx.globalAlpha=alpha*(1-j/p.trail.length)*.5;ctx.strokeStyle=colors[p.tone];ctx.lineWidth=p.size*(1-j/p.trail.length);
        ctx.beginPath();ctx.moveTo(...p.trail[j]);ctx.lineTo(...p.trail[j+1]);ctx.stroke();
      }
      glint(p.x,p.y,p.size,alpha,p.tone);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  // Paint before the SVG fallback is hidden, avoiding a blank first frame.
  draw(performance.now());
  return {
    pulse,
    begin(){
      idle=false;resize();dissolveAt=performance.now()/1000;burst(.5,.48,1.5);
      // Resizing clears the canvas; repaint in the same task to preserve the note.
      cancelAnimationFrame(frame);last=-Infinity;draw(performance.now());
    },
    gather(){gatheringAt=performance.now()/1000;focus={x:.5,y:.48};},
    reveal(instruments){
      gatheringAt=null;notes.length=0;
      instruments.forEach(i=>pulse(i.x/100,i.y/100,.8,i.symbol,{duration:2.2,scale:1,attack:.045}));
      // The same number of sparks, with faster radial trails for the impact.
      focus={x:.5,y:.48};burst(.5,.48,2.4,5);
    },
    wind(){gust=true;},
    dispose(){stopped=true;cancelAnimationFrame(frame);removeEventListener('resize',resize);start.removeEventListener('pointerenter',hover);start.removeEventListener('pointerleave',leave);start.removeEventListener('focus',hover);start.removeEventListener('blur',leave);canvas.remove();}
  };
}
