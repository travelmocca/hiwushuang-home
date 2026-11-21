import * as T from 'three';
import { indexedSurface } from './construction.js';

const terra=['#d97467','#ef876d','#fb9b7b','#e4816b','#d97362','#ef9578','#f7a17f'];
const green=['#497970','#518477','#53776b','#5d8c79','#426d65'];

function roofFace(b,upperA,upperB,lowerA,lowerB,columns,rows,palette) {
  const a=new T.Vector3(...upperA),c=new T.Vector3(...upperB);
  const d=new T.Vector3(...lowerA),e=new T.Vector3(...lowerB);
  function point(u,v,lift=0) {
    const high=a.clone().lerp(c,u),low=d.clone().lerp(e,u),p=high.lerp(low,v);
    p.y-=.072*Math.sin(Math.PI*v);p.y+=lift;return p;
  }
  const backing=[], faces=[];
  for(let j=0;j<=12;j++){
    backing.push(...point(0,j/12,-.10).toArray(),...point(1,j/12,-.10).toArray());
    const n=j*2;if(j)faces.push(n-2,n-1,n,n,n-1,n+1);
  }
  b.mesh(indexedSurface(backing,faces),palette[0],0,0,0,'tile');
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++) {
    const pts=[],indices=[],colors=[];
    const hue=new T.Color(palette[(row*5+col*3+Math.floor(col/3))%palette.length]);
    for(let j=0;j<4;j++)for(let k=0;k<=6;k++){
      const across=k/6,down=j/3,u=(col+across)/columns;
      const v=(row+down*1.019+.049*down*Math.sin(across*Math.PI))/rows;
      const bulge=.038+.023*Math.cos(across*Math.PI*2)+.021*down;
      const p=point(u,v,bulge);pts.push(p.x,p.y,p.z);
      const light=.68+.27*Math.sin(.14+across*2.7)+.28*down;
      colors.push(hue.r*light,hue.g*light,hue.b*light);
      if(k>0&&j>0){const n=j*7+k;indices.push(n-8,n-7,n,n-8,n,n-1);}
    }
    b.mesh(indexedSurface(pts,indices,colors),'#ffffff',0,0,0,'tile');
  }
  for(let i=0;i<=columns;i+=3){
    const u=i/columns;
    b.curve([0,.32,.65,1.015].map(v=>point(u,v,.073).toArray()),.035,palette[1],'tile',18);
  }
  b.rod(d.toArray(),e.toArray(),.071,'#63493c','wood');
}

export function mansard(b,x,y,z,upperW,upperD,w,d,rise) {
  const top=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([sx,sz])=>[x+sx*upperW/2,y,z+sz*upperD/2]);
  const bottom=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([sx,sz])=>[x+sx*w/2,y-rise,z+sz*d/2]);
  b.box(x,y-.034,z,upperW+.06,.084,upperD+.06,'#8e5248','metal');
  b.box(x,y+.018,z,upperW-.12,.035,upperD-.12,'#736462','metal');
  for(let i=0;i<4;i++)roofFace(b,top[i],top[(i+1)%4],bottom[i],bottom[(i+1)%4],i%2?10:12,5,terra);
}

// The ridge runs fore and aft. Solid gables reach both eaves.
export function gableRoof(b,x,y,z,w,d,rise) {
  const gable=new T.Shape();
  gable.moveTo(-w/2,0);gable.lineTo(0,rise);gable.lineTo(w/2,0);gable.closePath();
  b.shape(gable,x,y-.13,z,d-.18,'#decaab',0,'plaster');
  for(const side of [-1,1]){
    const ridgeA=[x,y+rise,z-d/2],ridgeB=[x,y+rise,z+d/2];
    const eaveA=[x+side*w/2,y,z-d/2],eaveB=[x+side*w/2,y,z+d/2];
    roofFace(b,ridgeA,ridgeB,eaveA,eaveB,9,4,terra);
    b.rod([x,y+rise+.02,z+d/2],[x+side*w/2,y+.03,z+d/2],.045,'#936554','wood');
  }
  b.rod([x,y+rise+.043,z-d/2-.04],[x,y+rise+.043,z+d/2+.04],.06,'#ad765c','tile');
}
export function tileAwning(b,x,y,z,width,depth,color='red') {
  const palette=color==='green'?green:terra;
  roofFace(b,[x-width*.49,y,z-depth*.5],[x+width*.49,y,z-depth*.5],
    [x-width*.51,y-.19,z+depth*.5],[x+width*.51,y-.19,z+depth*.5],Math.max(6,Math.round(width/.245)),2,palette);
  for(const s of [-1,1])b.rod([x+s*width*.49,y-.35,z-depth*.45],[x+s*width*.49,y-.18,z+depth*.34],.032,'#605747','metal');
}
