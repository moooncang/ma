import {createPaperRenderer} from './entry-paper-renderer.js?v=ripple-7';
let renderer, pendingViewport;
self.onmessage = async ({data}) => {
  try {
    if(data.type==='init'){
      data.canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();self.postMessage({type:'error',message:'WebGL context lost'});
      });
      renderer=await createPaperRenderer(data.canvas,data.layout,data.viewport);
      if(pendingViewport)renderer.resize(pendingViewport);
      self.postMessage({type:'ready'});
    }
    if(data.type==='resize'){
      if(renderer)renderer.resize(data.viewport);else pendingViewport=data.viewport;
    }
    if(data.type==='prepare-ripple')await renderer?.prepareRipple();
    if(data.type==='ripple')renderer?.ripple();
    if(data.type==='fly')await renderer?.fly().then(()=>self.postMessage({type:'flown'}));
  } catch(error){self.postMessage({type:'error',message:error.message});}
};
