import * as THREE from '../vendor/three.module.min.js';

// A cached paper image is refracted only along three outward-moving wavefronts.
// No full-screen zoom, sheet deformation, or idle animation is involved.
export function createRipplePass(renderer, width, height) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type:THREE.HalfFloatType,
    samples:Math.min(2, renderer.capabilities.maxSamples)
  });
  const uniforms = {
    paper:{value:target.texture},
    resolution:{value:new THREE.Vector2(width,height)},
    age:{value:0}
  };
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest:false, depthWrite:false,
    vertexShader:`varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,
    fragmentShader:`
      uniform sampler2D paper;
      uniform vec2 resolution;
      uniform float age;
      varying vec2 vUv;
      void main(){
        vec2 delta=(vUv-vec2(.5,.52))*resolution;
        float distance=max(length(delta),.001);
        float reach=length(resolution*vec2(.5,.52));
        float band=clamp(min(resolution.x,resolution.y)*.028,12.,28.);
        float amplitude=clamp(min(resolution.x,resolution.y)*.015,6.,12.);
        float displacement=0.;
        float slope=0.;
        for(int i=0;i<3;i++){
          float elapsed=age-float(i)*.1;
          float radius=elapsed*reach*1.12/.58;
          float x=(distance-radius)/band;
          float window=max(0.,1.-x*x);
          float envelope=window*window*step(0.,elapsed)*(1.-float(i)*.22)
            *(1.-smoothstep(.5,.8,age));
          float wave=x*3.5*envelope;
          displacement+=wave*amplitude;
          slope+=wave;
        }
        vec2 uv=clamp(vUv+delta/distance*displacement/resolution,vec2(.001),vec2(.999));
        gl_FragColor=texture2D(paper,uv);
        gl_FragColor.rgb*=1.+slope*.035;
        #include <colorspace_fragment>
      }`
  });
  const scene = new THREE.Scene(), camera = new THREE.Camera();
  const geometry = new THREE.PlaneGeometry(2,2);
  scene.add(new THREE.Mesh(geometry,material));
  function resize(w,h) {
    uniforms.resolution.value.set(w,h);
    const dpr=renderer.getPixelRatio();
    target.setSize(Math.round(w*dpr),Math.round(h*dpr));
  }
  resize(width,height);
  return {
    ready:renderer.compileAsync(scene,camera), resize,
    capture(papers,paperCamera) {
      renderer.setRenderTarget(target);renderer.render(papers,paperCamera);renderer.setRenderTarget(null);
    },
    render(age) {uniforms.age.value=age;renderer.render(scene,camera);},
    dispose() {target.dispose();geometry.dispose();material.dispose();}
  };
}
