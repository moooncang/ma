// Keep texture generation, shader compilation and paper animation off the UI thread.
// The fallback uses the exact same renderer, resolution, geometry and shadows.
export async function createPaperScene(original, layout, signal) {
  const viewport = () => ({width:innerWidth,height:innerHeight,dpr:devicePixelRatio});
  let canvas = original;
  if (canvas.transferControlToOffscreen && typeof Worker !== 'undefined') {
    let worker;
    try {
      worker = new Worker(new URL('./entry-paper-worker.js?v=perf-3',import.meta.url),{type:'module'});
      const offscreen = canvas.transferControlToOffscreen();
      await new Promise((resolve,reject) => {
        const abort = () => {worker.terminate();reject(new DOMException('Aborted','AbortError'));};
        signal?.addEventListener('abort',abort,{once:true});
        const cleanup = () => signal?.removeEventListener('abort',abort);
        worker.onmessage = ({data}) => {
          if(data.type === 'ready'){cleanup();resolve();}
          if(data.type === 'error'){cleanup();reject(new Error(data.message));}
        };
        worker.onerror = event => {cleanup();reject(new Error(event.message));};
        worker.postMessage({type:'init',canvas:offscreen,layout,viewport:viewport()},[offscreen]);
        if(signal?.aborted)abort();
      });
      let stopped = false, finishFlight;
      const resize = () => worker.postMessage({type:'resize',viewport:viewport()});
      addEventListener('resize',resize);
      const dispose = () => {
        if(stopped)return;stopped=true;
        finishFlight?.(); finishFlight = null;
        removeEventListener('resize',resize);signal?.removeEventListener('abort',dispose);
        worker.terminate();
      };
      signal?.addEventListener('abort',dispose,{once:true});
      worker.onmessage = ({data}) => {
        if(data.type==='flown'){finishFlight?.();finishFlight=null;}
        if(data.type==='error'){dispose();canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));}
      };
      worker.onerror = () => {dispose();canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));};
      canvas.dataset.renderer = 'worker';
      return {fly(){return new Promise(resolve=>{if(stopped)return resolve();finishFlight=resolve;worker.postMessage({type:'fly'});});},dispose};
    } catch(error) {
      worker?.terminate();
      if(signal?.aborted)throw error;
      // A transferred canvas cannot get a main-thread context; replace its node.
      canvas=original.cloneNode(false);original.replaceWith(canvas);
      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();original.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
      });
    }
  }
  const {createPaperRenderer} = await import('./entry-paper-renderer.js?v=perf-3');
  const renderer = await createPaperRenderer(canvas,layout,viewport());
  if(signal?.aborted){renderer.dispose();throw new DOMException('Aborted','AbortError');}
  const resize = () => renderer.resize(viewport());
  addEventListener('resize',resize);canvas.dataset.renderer='main';
  return {fly:renderer.fly,dispose(){removeEventListener('resize',resize);renderer.dispose();}};
}
