import * as T from 'three';
import { indexedSurface } from './construction.js';

const railHeight=.235;
const v=(x,z)=>new T.Vector3(x,railHeight,z);
const track=new T.CurvePath();
track.add(new T.LineCurve3(v(5.68,-4.12),v(-.64,-4.12)));
track.add(new T.QuadraticBezierCurve3(v(-.64,-4.12),v(-1.44,-4.12),v(-2.02,-3.55)));
track.add(new T.LineCurve3(v(-2.02,-3.55),v(-3.82,-1.79)));
track.add(new T.QuadraticBezierCurve3(v(-3.82,-1.79),v(-4.48,-1.16),v(-4.48,-.30)));
track.add(new T.LineCurve3(v(-4.48,-.30),v(-4.48,5.02)));
export const cycleSeconds=10;

export function trainPose(phase) {
  const loop=T.MathUtils.euclideanModulo(phase,1), leg=loop<.5 ? loop*2 : (1-loop)*2;
  // The cab keeps its orientation when the tram reverses at each end of the open track.
  const ease=.085;
  let distance;
  if(leg<ease)distance=leg*leg/(2*ease);
  else if(leg>1-ease)distance=1-ease-(1-leg)*(1-leg)/(2*ease);
  else distance=leg-ease*.5;
  distance/=1-ease;
  const u=T.MathUtils.lerp(.108,.891,T.MathUtils.clamp(distance,0,1));
  return {position:track.getPointAt(u),direction:track.getTangentAt(u)};
}

function pathSolid(b,shape,top,depth,color,finish) {
  const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:10,steps:1});
  g.rotateX(-Math.PI/2);return b.mesh(g,color,0,top-depth,0,finish);
}

function island(b,x,z,w,d,r,top,color) {
  const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,s=new T.Shape();
  s.moveTo(x0+r,-z0);s.lineTo(x1-r,-z0);s.quadraticCurveTo(x1,-z0,x1,-z0-r);
  s.lineTo(x1,-z1+r);s.quadraticCurveTo(x1,-z1,x1-r,-z1);s.lineTo(x0+r,-z1);
  s.quadraticCurveTo(x0,-z1,x0,-z1+r);s.lineTo(x0,-z0-r);s.quadraticCurveTo(x0,-z0,x0+r,-z0);
  pathSolid(b,s,top,.08,color,'asphalt');
}
function railPoint(u,offset,y) {
  const p=track.getPointAt(u),t=track.getTangentAt(u);
  return [p.x-t.z*offset,y,p.z+t.x*offset];
}
function ribbon(b,start,end,y,color) {
  const pos=[],ix=[],n=170;
  for(let i=0;i<=n;i++){
    pos.push(...railPoint(i/n,start,y),...railPoint(i/n,end,y));const k=i*2;
    if(i)ix.push(k-2,k,k-1,k-1,k,k+1);
  }
  b.mesh(indexedSurface(pos,ix),color,0,0,0,'metal');
}

export function buildRoad(b) {
  const s=new T.Shape();
  s.moveTo(-5.38,-4.96);s.quadraticCurveTo(-5.38,-5.07,-5.23,-5.07);
  s.lineTo(5.29,-5.07);s.quadraticCurveTo(5.73,-5.07,5.73,-4.62);
  s.lineTo(5.73,4.74);s.quadraticCurveTo(5.73,4.94,5.48,4.94);
  s.lineTo(-2.28,4.94);s.quadraticCurveTo(-2.60,4.94,-2.88,4.68);
  s.lineTo(-5.19,2.46);s.quadraticCurveTo(-5.38,2.26,-5.38,1.97);s.closePath();
  pathSolid(b,s,.126,.12,'#24222a','asphalt');
  island(b,-1.47,1.60,3.52,4.38,.32,.186,'#6e635f');
  island(b,-1.47,1.60,3.41,4.28,.28,.23,'#554a42');
  island(b,2.57,1.91,3.92,4.80,.32,.186,'#80726a');
  island(b,2.57,1.91,3.82,4.70,.29,.23,'#615044');
  island(b,1.33,-1.6,5.55,2.78,.24,.19,'#5a5149');
  ribbon(b,-.77,.77,.144,'#4f443d');
  ribbon(b,-.61,.61,.153,'#756158');
  for(const d of [-.46,.46]){
    ribbon(b,d-.052,d+.052,.170,'#383a3a');
    ribbon(b,d-.030,d+.030,.207,'#909398');
    ribbon(b,d-.017,d+.007,.221,'#b0abad');
  }
  for(let i=1;i<32;i++){
    const t=i/32;
    const a=railPoint(t,-.70,.164),c=railPoint(t,.7,.164);
    b.rod(a,c,.012,'#544b46','metal');
  }
  const mark='#dfd6cb',h=.138;
  function roadLine(pts,w=.022){b.stroke(pts.map(([x,z])=>[x,h,z]),w,mark);}
  roadLine([[-3.10,3.22],[-3.10,3.52],[-2.88,3.83],[-2.51,3.88],[-.02,3.88],[.39,3.64],[.39,1.7]],.017);
  roadLine([[.46,2.30],[.46,3.83],[.79,4.36],[4.18,4.40],[4.60,4.12],[4.69,3.72],[4.69,1.30]],.02);
  roadLine([[4.69,1.00],[4.72,.51],[4.99,-.10],[4.99,-2.27]],.025);
  roadLine([[-2.53,4.52],[-1.94,4.24],[-1.30,4.51],[-1.94,4.79],[-2.53,4.52]],.038);
  for(let i=0;i<5;i++){
    b.box(4.12,.141,4.47+i*.115,.90,.013,.046,mark);
    const stripe=b.box(5.10,.14,2.02+i*.20,.72,.014,.09,mark);stripe.rotation.y=-.19;
  }
  for(const x of [-2.91,-.26,.72,2.23,3.79])b.box(x,.142,4.79,.025,.008,.28,'#b4acaa');
  b.group('road-lettering',[5.14,.143,-.18],-Math.PI/2,g=>{
    g.rotation.order='YXZ';g.rotation.x=-Math.PI/2;
    b.text('止まれ',-.72,-.18,0,.43,'#e1d9d6',{spacing:1.10,weight:.048});
  });
  for(const [x,z] of [[-.13,3.72],[4.16,1.22],[.57,2.11]]){
    b.cylinder(x,.148,z,.15,.15,.018,'#4a4646',24,'metal');
    for(let i=-2;i<=2;i++)b.box(x+i*.038,.161,z,.012,.008,.18,'#817c76','metal');
  }
}

function random(seed) {
  let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}

export function shrub(b,x,y,z,rx,ry,rz,options={}) {
  const {blossoms=false,seed=11,count=110}=options,rand=random(seed);
  const inner=blossoms?'#809640':'#597a3c';
  const core=new T.IcosahedronGeometry(1,1), positions=core.getAttribute('position');
  for(let i=0;i<positions.count;i++){
    const a=positions.getX(i),c=positions.getY(i),d=positions.getZ(i);
    const s=.75+.14*Math.sin(11*a+c*9+seed)*Math.cos(d*13+seed);
    positions.setXYZ(i,a*rx*s,c*ry*s,d*rz*s);
  }
  core.computeVertexNormals();b.mesh(core,inner,x,y,z,'leaf');
  const verts=[],idx=[],colors=[];
  const greens=['#7b9e55','#98b861','#b1c663','#b5d078','#d2d988','#9bb85b'];
  const flowers=['#fff3cb','#f5eabb','#f5f5d5','#fff4d5'];
  for(let i=0;i<count;i++){
    const u=rand()*2-1,phi=rand()*2*Math.PI,rr=Math.sqrt(1-u*u);
    const a=rr*Math.cos(phi),d=rr*Math.sin(phi),scale=.75+rand()*.27;
    const cx=a*rx*scale,cy=u*ry*scale,cz=d*rz*scale;
    const size=(.054+rand()*.066)*Math.max(.63,Math.min(1.4,rx+ry));
    const angle=rand()*2*Math.PI,dx=Math.cos(angle)*size,dz=Math.sin(angle)*size,up=(.35+rand()*.75)*size;
    const width=size*(.38+rand()*.23),wx=Math.sin(angle)*width,wz=-Math.cos(angle)*width;
    const k=verts.length/3;
    verts.push(cx-dx,cy-up*.4,cz-dz,cx+wx,cy+up*.3,cz+wz,cx,cy+up*.65,cz,cx-wx,cy+up*.29,cz-wz,cx+dx,cy+up,cz+dz);
    idx.push(k,k+1,k+2,k+2,k+1,k+4,k,k+2,k+3,k+3,k+2,k+4);
    const palette=blossoms&&rand()<.45+(u*.12)?flowers:greens;
    const col=new T.Color(palette[Math.floor(rand()*palette.length)]);
    for(const factor of [.77,.90,1.07,.97,1.12])colors.push(col.r*factor,col.g*factor,col.b*factor);
  }
  b.mesh(indexedSurface(verts,idx,colors),'#ffffff',x,y,z,'leaf');
}

export function potted(b,x,y,z,s=.7,seed=12) {
  b.cylinder(x,y+.14*s,z,.22*s,.15*s,.28*s,'#956d4c',12,'ceramic');
  b.cylinder(x,y+.277*s,z,.23*s,.23*s,.06*s,'#b17f55',12,'ceramic');
  shrub(b,x,y+.48*s,z,.28*s,.27*s,.24*s,{seed,count:50});
}
export function planter(b,x,y,z,width,seed=21) {
  b.box(x,y+.14,z,width,.25,.40,'#69594b','wood');
  b.box(x,y+.255,z,width+.025,.045,.42,'#9b8462','wood');
  const count=Math.max(2,Math.round(width/.38));
  for(let i=0;i<count;i++){
    shrub(b,x+width*((i+.5)/count-.5),y+.42,z,width/count*.72,.235,.24,{count:84,seed:seed+i*13});
  }
}
export function flowerTree(b,x,z,s,seed) {
  b.group('flowering-street-tree',[x,.23,z],0,g=>{
    g.scale.setScalar(s);
    b.cylinder(0,.68,0,.036,.068,1.36,'#816341',10,'wood');
    for(const [dx,y,dz] of [[-.19,1.52,-.1],[.22,1.59,.07],[.08,1.78,-.10]]){
      b.rod([0,.94,0],[dx,y,dz],.025,'#765c3f','wood');
      shrub(b,dx,y,dz,.265,.27,.245,{seed:seed+Math.round(y*40),blossoms:true,count:110});
    }
    b.cylinder(0,.023,0,.225,.225,.044,'#514d3d',16,'asphalt');
  });
}

function pole(b,x,z,back) {
  const wood='#986045',iron='#55463e',h=7.80;
  b.cylinder(x,h/2+.22,z,.078,.115,h,wood,16,'wood');
  for(const y of [.66,1.02,1.44,3.1,5.77,6.05,7.68])b.cylinder(x,y,z,.109,.109,.077,iron,14,'metal');
  for(const offset of [-.58,.58]){
    b.rod([x,7.08,z],[x+offset,7.66,z],.048,iron,'metal');
    b.rod([x+offset-.20,7.66,z],[x+offset+.20,7.66,z],.052,wood,'wood');
    for(const dz of [-.16,.13]){
      b.rod([x+offset,7.66,z],[x+offset,7.66,z+dz],.045,iron,'metal');
      for(let i=0;i<3;i++)b.cylinder(x+offset,7.66+i*.046,z+dz,.069-i*.009,.073,.04,'#866346',10,'ceramic');
    }
  }
  const dir=back?1:-1;
  for(const [dy,dz] of [[0,-.15],[.05,.15]]){
    b.curve([[x-.56,7.75+dy,z+dz],[x+dir*2.8,7.62+dy,z+dz],[x+dir*5.7,7.60+dy,z+dz],[x+dir*(back?7.62:9.42),7.70+dy,z+dz]],.019,'#373c41','metal');
  }
  b.curve([[x+.57,7.76,z+.14],[x+.62,7.52,z+.20],[x+.45,7.44,z+.18],[x+.38,7.65,z+.14]],.033,iron);
  b.curve([[x,3.12,z],[x,3.42,z+.12],[x-.20,3.54,z+.22],[x-.34,3.50,z+.26]],.037,'#587052','metal');
  b.oval(x-.34,3.47,z+.26,.153,.067,.10,'#688c60','metal');
}
export function streetFurniture(b) {
  pole(b,4.82,3.60,false);pole(b,-2.30,-4.66,true);
  b.group('fox-street-sign',[4.73,2.05,3.75],.08,()=>{
    b.plate(0,0,0,.78,.36,.09,.035,'#414a52','metal');
    b.plate(0,0,.053,.723,.31,.016,.026,'#668b9c');
    b.text('キタ',-.19,.034,.067,.10,'#dbded1',{weight:.053});
    b.text('Fox St.',-.29,-.108,.069,.087,'#eee4d1',{spacing:1.06,weight:.068});
    b.plate(0,-.39,0,.51,.22,.06,.028,'#e2cbb0');b.text('まれ',-.14,-.469,.038,.13,'#bc5b48');
  });
  for(const [x,z] of [[.90,4.08],[1.92,4.42],[2.44,4.48],[3.27,4.55],[4.10,4.33],[-.05,3.30]]){
    b.box(x,.175,z,.26,.062,.24,'#965939');
    b.cylinder(x,.356,z,.019,.098,.318,'#ce714a',12,'paint');
    b.cylinder(x,.342,z,.062,.071,.048,'#e0ac78',12);
  }
  for(const [x,z] of [[4.40,2.53],[4.40,1.36]]){
    b.stroke([[x,.23,z-.43],[x,.59,z-.43],[x,.65,z-.38],[x,.65,z+.38],[x,.59,z+.43],[x,.23,z+.43]],.035,'#bb914d','metal');
    b.rod([x,.41,z-.40],[x,.41,z+.4],.016,'#99723a','metal');
  }
  b.group('platform-bench',[-3.98,.16,-2.50],Math.PI/4,()=>{
    for(let i=0;i<4;i++)b.box(0,.32,i*.062,1.06,.062,.050,'#93694a','wood');
    for(let i=0;i<3;i++)b.box(0,.41+i*.093,-.055,1.07,.069,.045,'#866043','wood');
    for(const x of [-.41,.41]){b.rod([x,.03,.17],[x,.34,.14],.028,'#45545b','metal');b.rod([x,.03,-.04],[x,.67,-.065],.029,'#45545b','metal');}
  });
  for(const [x,z] of [[-4.82,-1.69],[-2.91,-4.1]])potted(b,x,.17,z,.73,56);
}

export function postbox(b,x,y,z) {
  const red='#a9403b';
  b.cylinder(x,y+.12,z,.272,.30,.22,'#813d35',28,'metal');
  b.cylinder(x,y+.67,z,.233,.245,1.04,red,28,'metal');
  for(const h of [.25,.99,1.18])b.cylinder(x,y+h,z,.25,.25,.052,'#8e3934',28,'metal');
  b.oval(x,y+1.22,z,.278,.112,.276,'#c05649','metal');
  b.plate(x,y+.91,z+.207,.286,.25,.095,.083,'#953b36','metal');
  b.plate(x,y+.94,z+.259,.185,.051,.015,.019,'#513d39');
  b.text('〒',x-.060,y+.71,z+.250,.123,'#e8b4a1',{weight:.059});
}
