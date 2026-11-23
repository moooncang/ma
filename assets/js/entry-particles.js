// Additive, tapered trails, orbiting sparks and four-point glints. Kept separate
// from the paper renderer so that particle light sits in front of the shadow.
export function createParticles(host) {
  const canvas = document.createElement('canvas'); host.append(canvas);
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  const ctx = canvas.getContext('2d');
  if (!ctx) return {pulse(){},wind(){},dispose(){canvas.remove();}};
  let width, height, frame, stopped=false, gust=false, hovered=false;
  let focus={x:.5,y:.48}, last=0;
  const sparks=[];
  function resize() { width=innerWidth; height=innerHeight; const dpr=Math.min(devicePixelRatio,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0); }
  resize();addEventListener('resize',resize);
  const start=document.getElementById('entry-start');
  const hover=()=>{hovered=true;},leave=()=>{hovered=false;};
  start.addEventListener('pointerenter',hover);start.addEventListener('pointerleave',leave);
  function pulse(x,y,strength=1) {
    focus={x,y};
    for(let i=0;i<30*strength;i++) {
      const a=Math.random()*Math.PI*2, velocity=35+Math.random()*115;
      sparks.push({x:x*width,y:y*height,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity,life:0,max:.6+Math.random()*1.3,size:.6+Math.random()*1.5,trail:[]});
    }
  }
  function glint(x,y,r,alpha,blue=false) {
    ctx.globalAlpha=alpha;ctx.fillStyle=blue?'#e9f4ff':'#fff3cc';
    ctx.beginPath();ctx.moveTo(x,y-r*2.5);ctx.quadraticCurveTo(x+r*.15,y-r*.15,x+r*1.5,y);ctx.quadraticCurveTo(x+r*.15,y+r*.15,x,y+r*2.5);ctx.quadraticCurveTo(x-r*.15,y+r*.15,x-r*1.5,y);ctx.quadraticCurveTo(x-r*.15,y-r*.15,x,y-r*2.5);ctx.fill();
  }
  function draw(now) {
    if(stopped)return;frame=requestAnimationFrame(draw);if(now-last<30)return;
    const dt=Math.min((now-last)/1000,.05);last=now;const t=now/1000;
    ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';
    const cx=focus.x*width,cy=focus.y*height,r=Math.min(width,height)*(hovered?.15:.13);
    if(!gust) {
      // Two incomplete, crossing orbits. Trails recede in depth instead of rings.
      for(let k=0;k<3;k++) {
        const a=t*(k%2?-.65:.45)+k*2.2;
        const tilt=[-.48,.5,-.1][k];
        const point=q=>{
          const x=Math.cos(q)*r*(1+k*.2),y=Math.sin(q)*r*.32;
          return [cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy+x*Math.sin(tilt)+y*Math.cos(tilt)];
        };
        for(let j=0;j<24;j++) {
          const p=point(a-j*.018),n=point(a-(j+1)*.018);
          ctx.globalAlpha=(1-j/24)*.32;ctx.strokeStyle=k===1?'#9dd4e8':'#e9b756';ctx.lineWidth=(1-j/24)*1.8;
          ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...n);ctx.stroke();
        }
        const p=point(a);glint(...p,2.4,.8,k===1);
      }
      for(let i=0;i<24;i++) {
        const a=i*2.399+t*.05, distance=r*(.5+(i%8)/6);
        const x=cx+Math.cos(a)*distance, y=cy+Math.sin(a)*distance*.8-Math.sin(t*.5+i)*12;
        const flicker=Math.pow(Math.max(0,Math.sin(t*(.7+i%3*.1)+i)),7);
        glint(x,y,1+(i%3)*.6,flicker*.65,i%5===0);
      }
    }
    for(let i=sparks.length-1;i>=0;i--) {
      const p=sparks[i];p.life+=dt;if(p.life>p.max){sparks.splice(i,1);continue;}
      p.trail.unshift([p.x,p.y]);p.trail.length=Math.min(7,p.trail.length);
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=12*dt;p.vx*=.985;
      const alpha=Math.pow(1-p.life/p.max,1.4);
      for(let j=0;j<p.trail.length-1;j++) {
        ctx.globalAlpha=alpha*(1-j/p.trail.length)*.7;ctx.strokeStyle='#f3c577';ctx.lineWidth=p.size*(1-j/p.trail.length);
        ctx.beginPath();ctx.moveTo(...p.trail[j]);ctx.lineTo(...p.trail[j+1]);ctx.stroke();
      }
      glint(p.x,p.y,p.size,alpha);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  frame=requestAnimationFrame(draw);
  return {pulse,wind(){gust=true;},dispose(){stopped=true;cancelAnimationFrame(frame);removeEventListener('resize',resize);start.removeEventListener('pointerenter',hover);start.removeEventListener('pointerleave',leave);canvas.remove();}};
}
