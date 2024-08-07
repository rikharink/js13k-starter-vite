var Stackie = ( ()=> {
    var random;    
    var M=Math;
    var intHash = x => {
      x *= 0xed5ad4bb;
      x ^= x >> 11;
      x = M.imul(x,0xac4c1b51);
      x ^= x >> 15;
      x = M.imul(x,0x31848bab);
      x ^= x >> 14;
      return x;
    }
   
    var makeRandom = seed => {
      let index=0;
      let random = (x=index) => {
        let pattern = intHash( (x + seed) & 0x7fffffff)
        let intValue = intHash( (x + pattern)  & 0x7fffffff);
        index=++x;
        return intValue / 0x7fffffff;
      }
      return random;
    }
  
  /*
    var bit30=1<<30;
    var makeRandom=seed=>{
      var mw = seed & (bit30-1);
      var mz = 173;
      var random=()=>{
        mz=36969 * (mz&0xffff) + (mz >> 16);
        mw=18000 * (mw&0xffff) + (mw >> 16);
        return (((mz<<16) + mw) & (bit30-1) ) / (bit30);
      }
      return random;
    }
  */
    var setSeed=seed=>{
      random=makeRandom(seed);
    };
  
  /**
   * @constructor 
  */
    function Field(w=256,h=w) {
      var data=new Float32Array(w*h);
      var getValue=(x,y)=>data[y*w+x];
      var setValue=(x,y,value)=>data[y*w+x]=value;
      
      var generate = fn=>{
        for (var tx=0, ty=0; ty<h ;tx=tx+1<w?tx+1:0, ty+=tx?0:1) {
          setValue(tx,ty,fn(tx/w,ty/h));
        }
      }    
      /*
      function generate(fn) {
        for (var ty=0;ty<h; ty++) {
          for (var tx=0;tx<w; tx++) {
            var x=tx/w;
            var y=ty/h;
            setValue(tx,ty,fn(x,y));
          }
        }    
      }
      */    
      var getImageData=(map = makePaletteMapper("x"))=>{
        var image=new ImageData(w,h);
        var pixels= new Uint32Array(image.data.buffer);
        data.forEach((m,i)=>pixels[i]=map(m));
        return image;
      }
      var t=this;
      t.get = getValue;
      t.set = setValue;
      t.getImageData = getImageData;
      t.generate=generate;
    }
    var ss=(v,a=0,b=1,w=v*v*v*(v*(v*6-15)+10))=>(1.0-w)*a+(w*b); 
    var positiveMod=(v,size,q=v%size)=>q<0?size-q:q;
    var clamp = a=> a<0?0:a>1?1:a;
  
    var makeOp= ()=>{
      var state;
      var push=v=>state.push(v);
      var pop=()=>state.pop();
      
      var stackOp=(argc,fn)=>()=>push(fn(...state.splice(-argc,argc))) ;
  
      var bi= fn=>(()=>{var b=pop(); push(fn(pop(),b));});
      var un= fn=>( ()=>push(fn(pop())) );
      var p= v=>( ()=>push(v));
  
      var pushStateVar=name=>(()=>push(state[name]));
      
      var ops={
        "*": bi((a,b)=>a*b),    
        "/": bi((a,b)=>a/b),    
        "-": bi((a,b)=>a-b),
        "+": bi((a,b)=>a+b),
        "p": bi(perlin),
        "w": stackOp(3,wrapPerlin),
        "W": stackOp(4,wrapPerlin),
        "e": stackOp(1,ss),
        "E": stackOp(3,ss),      
        "s": un(M.sin),
        "c": un(M.cos),
        "q": un(M.sqrt),
        "a": bi(M.atan2),
        "r": stackOp(0,random),
        "<": bi(M.min),
        ">": bi(M.max),
        "l": un(M.log),
        "^": bi(M.pow),
        "P": p(M.PI),
        "~": un(M.abs),
        "#": un(M.round),
        "$": un(M.floor),
        "C": un(clamp),
        "%": stackOp(2,positiveMod),
        "!": un(x=>1-x),
        "?": un(x=>x<=0?0:1),
        ":": ()=> state.push(pop(),pop()),
        ";": ()=> state.push(pop(),pop(),pop()),
        "d": ()=> {var a=pop(); state.push(a,a)}
      }
      
      for (var v of "tuvxyz") ops[v]=pushStateVar(v);
      for (var i=0; i<10;ops[""+i]=p(i++));
  
      return (programState,opcode)=>{ state=programState; ops[opcode](); };
    }
  
    var program =code=>{
        var op=makeOp();
        return (x,y,state = [])=>{
          state.x=x;
          state.y=y;
          for (var c of code) op(state,c);
          return state.pop();
        }
    }
    var byteSize=v=>0|(clamp(v)*255);
  
    var makePaletteMapper=code=>{
        var paletteProgram=program(code);
        var palette=[];
        for (var i=0;i<1;i+=1/256){
          var r= byteSize(paletteProgram(i,0.0));
          var g= byteSize(paletteProgram(i,0.5));
          var b= byteSize(paletteProgram(i,1.0));
          palette.push(0xff<<24|b<<16|g<<8|r);
        }
        return v=>palette[byteSize(v)];
    }
    
    var perlin=(x,y,wrapX=256,wrapY=wrapX)=> {    
      
  
      var dg=(ix,iy,gi=random(positiveMod(iy,wrapY)*wrapX+positiveMod(ix,wrapX)*2)*M.PI*2)  =>
              ((x-ix)*M.sin(gi)) + ((y-iy)*M.cos(gi));
  
      var u=0|x;
      var v=0|y;
      var sx=x-u; 
      var sy=y-v;
      var u1=(u+1);
      var v1=(v+1);
      return ss(sy,ss(sx,dg(u,v),dg(u1,v)),ss(sx,dg(u,v1),dg(u1,v1)));
    }
  
    var wrapPerlin=(x,y,wrapX=2,wrapY=wrapX)=>perlin(x*wrapX,y*wrapY,wrapX,wrapY);
  
    var generate=(imageCode,paletteCode,size=256) => {
      var f = new Field(size);
      var paletteMapper = makePaletteMapper(paletteCode||"x");
      f.generate(program(imageCode));
      return f.getImageData(paletteMapper);
    }
  
    setSeed(42);
  
    let API = {
      makeField : (w,h)=>new Field(w,h),
      program,
      makeRandom,
      setSeed,
      makePaletteMapper,
      generate,
      perlin,
      wrapPerlin,
      random,
    }
   
    return API;
  })();
  
  
  