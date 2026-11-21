import * as T from 'three';
import { roundedPath, indexedSurface } from './construction.js';

const ivory='#fff0de', peach='#f79e88', umber='#81513f';

function catEar(b,side) {
  const ear=new T.Shape();
  ear.moveTo(-.31,0); ear.quadraticCurveTo(-.25,.22,-.09,.52);
  ear.quadraticCurveTo(-.035,.6,.02,.51); ear.quadraticCurveTo(.22,.28,.31,.04);
  ear.quadraticCurveTo(0,-.12,-.31,0);
  b.group('ear',[side*.52,1.84,-.04],0,g=>{
    g.rotation.z=-side*.35;
    b.shape(ear,0,0,0,.23,ivory,.06,'ceramic');
    const inner=new T.Shape();
    inner.moveTo(-.19,.055); inner.quadraticCurveTo(-.12,.28,-.045,.39);
    inner.quadraticCurveTo(.015,.43,.19,.075); inner.quadraticCurveTo(0,.02,-.19,.055);
    b.shape(inner,0,0,.168,.012,'#ef927e',.005,'ceramic');
  });
}

export function buildCat(b) {
  const profile=[[.39,0],[.59,.04],[.77,.22],[.90,.52],[.94,.93],
    [.9,1.29],[.79,1.61],[.67,1.88],[.48,2.06],[.23,2.12],[0,2.125]];
  const outline=new T.SplineCurve(profile.map(v=>new T.Vector2(...v))).getPoints(70);
  function radiusAt(y) {
    for(let i=1;i<outline.length;i++){
      if(outline[i].y<y)continue;
      const a=outline[i-1],c=outline[i];
      return T.MathUtils.lerp(a.x,c.x,T.MathUtils.clamp((y-a.y)/(c.y-a.y),0,1));
    }
    return .04;
  }
  const faceZ=(x,y)=>.82*Math.sqrt(Math.max(.004,radiusAt(y)**2-x*x));
  let body,paw;
  const cat=b.group('maneki-neko',[2.51,8.10,1.96],-.04,()=>{
    body=b.group('ceramic-body',[0,0,0],0,()=>{
      const shell=new T.LatheGeometry(outline,64);
      shell.scale(1,1,.82);
      const pos=shell.getAttribute('position'), colors=[];
      const base=new T.Color('#fff5e6'), biscuit=new T.Color('#d1a487'),shade=new T.Color();
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        const speck=.5+.5*Math.sin(x*11+z*6)*Math.cos(z*8-y*5);
        const foot=(1-T.MathUtils.smoothstep(y,0,.41))*(.33+.57*speck);
        shade.copy(base).lerp(biscuit,foot); colors.push(shade.r,shade.g,shade.b);
      }
      shell.setAttribute('color',new T.Float32BufferAttribute(colors,3));
      b.mesh(shell,'#ffffff',0,0,0,'ceramic');
      catEar(b,-1);catEar(b,1);
      const collarY=a=>1.36-.115*Math.cos(a)+.065*Math.sin(a);
      const vertices=[],index=[];
      for(let i=0;i<=80;i++){
        const angle=i*Math.PI/40;
        for(const offset of [-.072,.072]){
          const y=collarY(angle)+offset,r=radiusAt(y)+.012;
          vertices.push(Math.sin(angle)*r,y,Math.cos(angle)*r*.82);
        }
        if(i){const v=i*2;index.push(v-2,v-1,v,v-1,v+1,v);}
      }
      b.mesh(indexedSurface(vertices,index),'#e96175',0,0,0,'ceramic');
      for(let j=0;j<22;j++){
        const a=j*Math.PI/11,y=collarY(a),r=radiusAt(y)+.021;
        const dot=b.oval(Math.sin(a)*r,y,Math.cos(a)*r*.82,.052,.029,.014,'#f6bb75','ceramic');dot.rotation.y=a;
      }
      b.oval(0,1.15,faceZ(0,1.15)+.055,.133,.143,.122,'#cd494c','ceramic');
      for(const side of [-1,1]){
        const eye=[ [.14,1.72],[.20,1.77],[.27,1.79],[.34,1.76],[.37,1.725] ];
        b.curve(eye.map(([x,y])=>[side*x,y,faceZ(x,y)+.014]),.014,'#b47768','ceramic',14);
        for(let i=0;i<3;i++){
          const x=.34+i*.052,y=1.61+i*.028;
          b.stroke([[side*x,y,faceZ(x,y)+.012],[side*(x+.032),y+.047,faceZ(x+.032,y+.047)+.012]],.009,'#e8a28d');
        }
      }
      b.oval(0,1.663,faceZ(0,1.663)+.012,.053,.033,.018,peach,'ceramic');
      for(const side of [-1,1]){
        const mouth=[[0,1.642],[.016,1.588],[.071,1.561],[.12,1.58],[.15,1.615]];
        b.curve(mouth.map(([x,y])=>[x*side,y,faceZ(x,y)+.013]),.012,'#bd806d','ceramic',12);
      }
      b.oval(-.72,.91,.35,.205,.36,.21,ivory,'ceramic').rotation.z=-.22;
      for(let i=0;i<3;i++)b.curve([[-.82+i*.07,1.02,.50],[-.78+i*.07,.98,.545],[-.75+i*.07,.94,.538]],.013,'#deb79b');
      b.group('koban',[-.07,.54,.73],-.1,g=>{
        g.rotation.x=-.12;g.rotation.z=-.08;
        b.oval(0,0,0,.45,.56,.12,'#995624','metal');
        b.oval(0,0,.07,.415,.535,.087,'#e3a037','metal');
        b.oval(0,-.008,.124,.336,.438,.049,'#b96829','ceramic');
        b.text('招',-.294,-.33,.183,.60,'#f6bf50',{weight:.072});
      });
      b.oval(-.62,.21,-.24,.23,.20,.23,'#e7c6ac','ceramic');
      b.curve([[-.08,.35,-.7],[-.4,.35,-.67],[-.64,.53,-.48],[-.66,.69,-.43]],.11,'#ead1b6','ceramic');
    });
    paw=b.group('beckoning-paw',[.77,.78,.02],0,()=>{
      b.oval(.07,.26,-.024,.21,.38,.21,ivory,'ceramic');
      b.oval(.11,.61,.015,.255,.305,.22,ivory,'ceramic');
      b.oval(.11,.55,.228,.103,.082,.018,'#e1ad91','ceramic').rotation.z=-.32;
      for(const [x,y,a] of [[-.01,.69,-.4],[.08,.742,-.18],[.18,.746,.17],[.256,.68,.43]]){
        b.oval(x,y,.202,.04,.057,.021,'#e3b197','ceramic').rotation.z=a;
      }
    });
  });
  return {cat,body,paw};
}

// The horizontal rings give the car a continuous curved nose, waist and roof.
function tramShell(b,rings,color) {
  const pts=[],indices=[],n=72;
  rings.forEach(([y,w,l,r],row)=>{
    const perimeter=roundedPath(w,l,r).getSpacedPoints(n);
    for(let j=0;j<n;j++){
      const v=perimeter[j];pts.push(v.x,y,v.y);
      if(!row)continue;
      const a=(row-1)*n+j,c=(row-1)*n+(j+1)%n;
      indices.push(a,a+n,c,c,a+n,c+n);
    }
  });
  for(const row of [0,rings.length-1]){
    const center=pts.length/3; pts.push(0,rings[row][0],0);
    for(let j=0;j<n;j++){
      const a=row*n+j,c=row*n+(j+1)%n;
      if(row===0)indices.push(center,a,c);else indices.push(center,c,a);
    }
  }
  return b.mesh(indexedSurface(pts,indices),color,0,0,0,'metal');
}

export function buildTrain(b) {
  let car;
  const train=b.group('train',[0,0,0],0,()=>{
    car=b.group('tramcar',[0,0,0],0,group=>{
      group.scale.y=1.10;
      const green='#356952', cream='#efcb80',gasket='#3b3934',window='#56767a';
      tramShell(b,[[.25,1.12,3.12,.23],[.32,1.28,3.27,.24],[.49,1.39,3.34,.27],
        [.91,1.43,3.38,.27],[1.085,1.43,3.38,.27]],green);
      tramShell(b,[[1.081,1.431,3.382,.27],[1.62,1.42,3.37,.29],
        [1.89,1.37,3.31,.32],[2.01,1.28,3.23,.36],[2.084,1.07,3.04,.37],[2.096,.67,2.94,.24]],cream);
      tramShell(b,[[.27,1.22,3.22,.24],[.32,1.31,3.29,.25],[.36,1.32,3.30,.25]],'#62665b');
      tramShell(b,[[.51,1.4,3.353,.27],[.54,1.41,3.358,.27]],'#295746');
      b.box(0,.22,0,1.05,.16,2.5,'#3b3d40','metal');
      for(const side of [-1,1]){
        for(const z of [-1.00,-.72,.72,1.00]){
          const wheel=b.cylinder(side*.46,.20,z,.19,.19,.14,'#30363a',16,'metal');wheel.rotation.z=Math.PI/2;
        }
        b.group('passenger-side',[side*.71,0,0],side*Math.PI/2,()=>{
          for(const x of [-1.02,1.02]){
            b.plate(x,1.12,0,.48,1.30,.032,.08,'#665b42','metal');
            b.plate(x,1.12,.024,.435,1.25,.025,.064,'#e2bd75','metal');
            b.plate(x,.79,.041,.423,.58,.018,.033,green,'metal');
            b.plate(x,1.46,.047,.307,.43,.032,.055,gasket);
            b.plate(x,1.46,.067,.269,.383,.014,.041,'#526867','glass');
            b.box(x+.15,1.12,.056,.025,.11,.018,'#f2d79a','metal');
            b.box(x,1.81,.021,.17,.041,.025,'#c19b60','metal');
          }
          for(const x of [-.48,0,.48]){
            b.plate(x,1.45,.008,.414,.66,.042,.082,gasket);
            b.plate(x,1.45,.033,.371,.6,.018,.066,window,'glass');
            b.box(x,1.58,.046,.364,.025,.014,'#94b4a7','metal');
            b.box(x,1.72,.043,.33,.032,.012,'#b2ba9b');
          }
          for(let i=0;i<6;i++)b.box(-.48+i*.061,.403,.011,.027,.079,.016,'#383c36','metal');
        });
        b.group('cab-end',[0,0,side*1.675],side<0?Math.PI:0,()=>{
          for(const x of [-.385,0,.385]){
            b.plate(x,1.46,.004,.305,.56,.052,.07,'#b99e64','metal');
            b.plate(x,1.46,.034,.267,.501,.031,.052,'#303c3d');
            b.plate(x,1.47,.051,.236,.454,.012,.045,'#4b6b69','glass');
            b.rod([x-.068,1.27,.064],[x+.061,1.48,.065],.009,'#333e3d');
          }
          b.plate(0,1.863,-.032,.78,.205,.10,.061,'#443d36','metal');
          b.plate(0,1.863,.025,.665,.137,.018,.031,'#f7ddad');
          b.text('北野',-.115,1.807,.043,.11,'#504239',{weight:.072});
          b.ring(0,.838,.024,.102,.020,'#c79842','metal');
          b.oval(0,.838,.021,.079,.080,.029,'#e9d09b','glass');
          for(let i=0;i<16;i++)b.box(-.43+i*.057,.34,.001,.014,.065,.027,'#393d39','metal');
        });
      }
      for(const s of [-1,1]){
        b.rod([s*.54,1.81,1.27],[s*.78,1.77,1.52],.018,'#4b4c45','metal');
        b.plate(s*.79,1.63,1.52,.105,.23,.055,.038,'#4a4840','metal');
        b.plate(s*.79,1.63,1.555,.073,.19,.013,.028,'#dac490','glass');
      }
      b.group('roof-equipment',[0,2.09,-.51],0,()=>{
        const vent=b.plate(0,.065,0,.8,1.20,.24,.12,'#303944','metal');vent.rotation.x=Math.PI/2;
        for(let i=0;i<9;i++)b.box(0,.19,-.45+i*.11,.67,.016,.023,'#4a5355','metal');
      });
      b.box(0,2.105,.64,.54,.085,.48,'#454a49','metal');
      b.rod([0,2.14,.62],[0,2.53,1.18],.039,'#99865d','metal');
      b.rod([0,2.51,1.16],[0,2.62,1.04],.036,'#6f705a','metal');
      b.rod([-.39,2.62,1.03],[.39,2.62,1.03],.023,'#434c4a','metal');
    });
  });
  return {train,car};
}

export function pandaSign(b) {
  const silhouette=new T.Shape();
  silhouette.moveTo(-1.12,-.93);silhouette.quadraticCurveTo(-1.27,-.92,-1.25,-.72);
  silhouette.lineTo(-1.25,-.25);silhouette.quadraticCurveTo(-1.24,-.06,-1.04,-.08);
  silhouette.lineTo(-.98,.41);silhouette.bezierCurveTo(-1.34,.55,-1.3,1.22,-.92,1.34);
  silhouette.bezierCurveTo(-.64,1.5,-.35,1.39,-.21,1.21);
  silhouette.bezierCurveTo(.52,1.35,1.10,1.02,1.15,.35);
  silhouette.lineTo(1.15,-.72);silhouette.quadraticCurveTo(1.12,-.92,.95,-.94);silhouette.closePath();
  b.shape(silhouette,0,0,0,.22,'#252c3b',.045,'metal');
  b.group('panda-illustration',[0,0,.147],0,g=>{
    const back=b.shape(silhouette,0,0,0,.026,'#a9d9d2',.012,'ceramic');back.scale.set(.935,.931,1);
    b.oval(-.14,.65,.03,.145,.177,.016,'#51574d');b.oval(.72,.62,.03,.15,.183,.016,'#51574d');
    b.oval(.23,.13,.054,.745,.696,.034,'#fff2db','ceramic');
    for(const side of [-1,1]){
      const patch=b.oval(.23+side*.394,.22,.095,.154,.19,.019,'#474d43');patch.rotation.z=side*.43;
      b.oval(.23+side*.394-.025,.279,.119,.043,.049,.009,'#fff9e9');
      for(let j=0;j<3;j++)b.oval(.23+side*(.39+j*.043),-.016+j*.018,.096,.027,.046,.008,'#ec9f9a').rotation.z=side*-.7;
    }
    b.oval(.23,.07,.105,.08,.057,.025,'#565744');
    for(const s of [-1,1])b.curve([[.23,-.015,.101],[.23+s*.053,-.108,.102],[.23+s*.12,-.114,.102],[.23+s*.175,-.057,.1]],.023,'#57574b');
    b.oval(-.722,.974,.047,.337,.335,.028,'#fff9ed');
    const heart=new T.Shape();heart.moveTo(0,-.18);heart.bezierCurveTo(-.032,-.1,-.25,.043,-.17,.135);
    heart.quadraticCurveTo(-.085,.24,0,.11);heart.quadraticCurveTo(.11,.25,.19,.12);heart.quadraticCurveTo(.235,.03,0,-.18);
    b.shape(heart,-.72,.97,.09,.02,'#eea2a0');
    b.plate(-.898,-.5,.044,.49,.49,.025,.042,'#eddec5');
    b.text('興',-1.11,-.70,.068,.413,'#4c5147',{weight:.042});
  });
}
