import * as T from 'three';
import { indexedSurface } from './construction.js';
import { mansard, gableRoof, tileAwning } from './roofs.js';
import { planter, flowerTree, potted, postbox } from './street.js';
import { pandaSign } from './landmarks.js';

const ink='#373039', iron='#47505a', timber='#935f45', paleWood='#bb8a64';
const plaster='#f1dfc8', paper='#f5e5c9', glass='#384540', salmon='#c4705f';

function sign(b,x,y,z,w,h,fill,word,size,options={}) {
  const {color=ink,border='#4c4240',vertical=false,weight=.05,spacing=1.16}=options;
  b.plate(x,y,z,w+.058,h+.058,.105,.036,border,'metal');
  b.plate(x,y,z+.058,w,h,.038,.027,fill,'ceramic');
  const n=Array.from(word).length, advance=(n-1)*spacing*size;
  b.text(word,x-(vertical?0:advance)/2-size*.50,y+(vertical?advance:0)/2-size*.50,z+.086,size,color,{vertical,weight,spacing});
}
function gradientPanel(b,x,y,z,w,h,stops) {
  const points=[],ix=[],rgb=[];
  stops.forEach(([t,color],j)=>{
    const c=new T.Color(color),yy=y+(t-.5)*h;
    points.push(x-w/2,yy,z,x+w/2,yy,z);rgb.push(c.r,c.g,c.b,c.r,c.g,c.b);
    if(j){const k=j*2;ix.push(k-2,k-1,k,k,k-1,k+1);}
  });
  b.mesh(indexedSurface(points,ix,rgb),'#ffffff',0,0,0,'ceramic');
}
function waves(b,x,y,z,w,h) {
  for(let row=0;row<2;row++)for(let column=-1;column<5;column++)for(let band=1;band<=3;band++){
    const r=band*.072,cx=x-w/2+column*.42+(row?.21:0),cy=y-h/2+row*.093-.074;
    let points=[];
    for(let i=0;i<=16;i++){
      const a=i*Math.PI/16,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
      if(px>x-w/2+.014&&px<x+w/2-.014&&py>y-h/2+.012&&py<y+h/2){
        points.push([px,py,z]);
      }else if(points.length){b.stroke(points,.011,'#749d99');points=[];}
    }
    if(points.length>1)b.stroke(points,.011,'#749d99');
  }
}
function shopWindow(b,x,y,z,w,h,divisions=3) {
  b.box(x,y,z,w+.10,h+.10,.144,'#77523e','wood');
  b.box(x,y,z+.077,w,h,.028,glass,'glass');
  for(let i=0;i<=divisions;i++)b.box(x+w*(i/divisions-.5),y,z+.113,.040,h+.06,.05,paleWood,'wood');
  for(const v of [-.48,.48])b.box(x,y+h*v,z+.119,w+.05,.035,.048,'#b0845f','wood');
}
function shade(b,x,y,z,w,d,colours) {
  const n=Math.round(w/.255);
  for(let i=0;i<n;i++){
    const xx=x-w/2+(i+.5)*w/n,color=colours[i%colours.length];
    const p=[[xx-w/(2*n),y,z],[xx+w/(2*n),y,z],[xx-w/(2*n),y-.19,z+d],[xx+w/(2*n),y-.19,z+d]];
    b.mesh(indexedSurface(p.flat(),[0,2,1,1,2,3]),color,0,0,0,'fabric');
    const end=new T.Shape(),half=w/n/2;end.moveTo(-half,0);end.lineTo(half,0);end.lineTo(half,-.046);
    end.quadraticCurveTo(0,-.14,-half,-.046);end.closePath();
    b.shape(end,xx,y-.19,z+d,.018,color,0,'fabric');
  }
  for(const s of [-1,1])b.rod([x+s*w*.47,y-.55,z],[x+s*w*.47,y-.19,z+d],.023,iron,'metal');
}
function seam(b,x,y,z,w,h,mode=0) {
  const offsets=mode?[[0,0],[-.03,-.24],[.06,-.40],[.02,-.58],[.16,-.73],[.20,-1]]:
    [[0,0],[.02,-.29],[-.06,-.45],[.12,-.64],[.10,-.82],[.28,-1]];
  b.stroke(offsets.map(([dx,dy])=>[x+dx*w,y+dy*h,z]),.0065,'#988a75');
}
function downpipe(b,x,z,h) {
  b.curve([[x,.29,z],[x,1.14,z],[x,h-.56,z],[x-.10,h-.27,z],[x-.1,h-.13,z-.11]],.054,'#434750','metal');
  for(let i=.75;i<h-.35;i+=1.15)b.box(x,i,z,.16,.045,.115,'#68594b','metal');
}
function menu(b,x,y,z,w,h) {
  b.plate(x,y,z,w,h,.047,.014,'#6f5241','wood');
  b.plate(x,y,z+.029,w-.052,h-.06,.015,.009,'#e1c8a3','fabric');
  for(let r=0;r<5;r++)for(let c=0;c<3;c++){
    const a=x-w*.35+c*w*.23,yy=y+h*.31-r*h*.13;
    b.rod([a,yy,z+.044],[a+w*(.09+(c+r)%2*.055),yy-.005,z+.044],.0066,'#8d6652');
  }
}
function crate(b,x,y,z,w=.42) {
  b.box(x,y+.145,z,w,.26,.32,'#555b40','wood');
  for(const h of [.044,.135,.23])b.box(x,y+h,z+.17,w+.02,.044,.029,'#99825b','wood');
  for(const a of [-1,1])b.box(x+a*(w/2-.029),y+.14,z+.19,.04,.27,.025,'#b19265','wood');
}
function lamp(b,x,z,base=0) {
  b.cylinder(x,1.16+base,z,.035,.062,1.87,'#444448',10,'metal');
  b.box(x,2.15+base,z,.227,.035,.22,ink,'metal');
  b.box(x,2.30+base,z,.183,.255,.17,'#edc98c','glass');
  for(const xx of [-1,1])for(const zz of [-1,1])b.rod([x+xx*.09,2.17+base,z+zz*.083],[x+xx*.12,2.44+base,z+zz*.11],.012,ink);
  const cap=b.cylinder(x,2.49+base,z,0,.195,.13,ink,4,'metal');cap.rotation.y=Math.PI/4;
  b.oval(x,2.57+base,z,.027,.038,.027,ink,'metal');
}
function brickwork(b,x,y,z,w,h,cols,rows) {
  const tones=['#805e4b','#785846','#8b6550','#8a6655','#775a49'];
  b.box(x,y,z-.022,w,h,.06,'#bc9b77','plaster');
  for(let row=0;row<rows;row++)for(let col=-1;col<=cols;col++){
    const step=w/cols,left=Math.max(-w/2,-w/2+(col+(row%2)*.5)*step+.009);
    const right=Math.min(w/2,-w/2+(col+1+(row%2)*.5)*step-.009);
    if(right-left<.038)continue;
    b.box(x+(left+right)/2,y-h/2+(row+.5)*h/rows,z+.015,right-left,h/rows-.015,.03,tones[(row*3+col+cols)%tones.length],'plaster');
  }
}
function aircon(b,x,y,z,w=.64) {
  b.plate(x,y,z,w,.34,.245,.035,'#9f9d91','metal');
  b.plate(x,y,z+.13,w-.035,.303,.024,.02,'#c6bfae','metal');
  b.disc(x-w*.19,y,z+.152,.109,.02,'#62696a','metal');
  for(let i=0;i<4;i++)b.ring(x-w*.19,y,z+.171,.028+i*.026,.006,'#b4afa1','metal');
  for(let i=0;i<6;i++)b.box(x+w*.22,y-.092+i*.037,z+.149,w*.27,.012,.014,'#7e7d73','metal');
}
function duct(b,x,z,base,h,w=.41) {
  const tones=['#747578','#646772','#827f78','#5d616b','#7c7a7a'];
  const parts=5;
  for(let i=0;i<parts;i++){
    const y=base+h*(i+.5)/parts;
    b.box(x,y,z,w,h/parts+.016,w*.8,tones[i],'metal');
    b.box(x-w*.34,y,z+w*.411,w*.12,h/parts-.042,.015,'#8e8980','metal');
    b.box(x,base+(i+1)*h/parts,z,w+.062,.052,w*.8+.06,'#48505d','metal');
  }
  const hood=b.cylinder(x,base+h+.105,z,0,w*.80,.214,'#3d4755',4,'metal');hood.rotation.y=Math.PI/4;
}
function waveShop(b) {
  b.box(0,3.99,-1.55,3.03,7.53,3.10,plaster,'plaster');
  b.box(0,1.30,.013,3.02,2.12,.055,'#855f49','wood');
  brickwork(b,0,1.10,.044,3.02,1.74,8,7);
  for(const x of [-1.48,1.48])b.box(x,3.91,.063,.073,7.33,.13,'#8a6a51','wood');
  for(const y of [2.46,5.56,7.70])b.box(0,y,.075,3.16,.085,.17,'#695b50','wood');
  for(const x of [-.78,.025,.83])shopWindow(b,x,1.19,.089,.704,1.74,1);
  for(const x of [-.65,.08,.77])for(let i=0;i<4;i++){
    const xx=x-.25+i*.12;
    b.box(xx,.79,.185,.085,.155,.065,['#ad9473','#c09a69','#748e73','#976850'][i],'ceramic');
    b.box(xx,1.34,.185,.073,.17,.058,['#896c49','#aa9070','#66736c','#bb965f'][i]);
  }
  b.box(.09,1.16,.249,.051,.27,.045,'#c7a460','metal');b.box(-.11,.30,.2,1.37,.078,.35,'#7e7466','asphalt');
  for(const x of [-1.37,1.36])menu(b,x,1.37,.201,.195,.43);
  shade(b,0,2.63,.073,3.11,.61,['#517e6b','#ead8b9']);
  b.plate(0,2.948,.171,3.12,.87,.18,.07,'#554942','wood');
  for(const [x,w,label] of [[-.838,1.07,true],[.582,1.68,false]]){
    b.plate(x,2.98,.303,w,.72,.235,.06,'#816e68','metal');
    gradientPanel(b,x,2.98,.425,w-.048,.655,[[0,'#96bdb2'],[.42,'#d6e1cf'],[.72,'#f3dfd0'],[1,'#dc9da6']]);
    waves(b,x,2.874,.433,w-.055,.405);
    if(label)for(let i=0;i<2;i++){
      b.plate(x-.23+i*.46,3.105,.434,.346,.278,.018,.032,'#e4afa7');
      b.plate(x-.23+i*.46,3.105,.448,.309,.241,.015,.023,'#f2d7c2');
      b.text(i?'洋':'海',x-.333+i*.46,3.018,.461,.181,'#c77573',{weight:.067});
    }
  }
  shopWindow(b,0,4.24,.035,2.41,1.17,4);
  for(let i=0;i<4;i++)for(const yy of [4.26,4.49])b.box(-1.00+i*.59,yy,.137,.47,.057,.026,'#756454','wood');
  b.box(0,3.60,.295,2.75,.108,.60,'#5d4b40','wood');
  for(const yy of [3.65,4.09])b.box(0,yy,.57,2.73,.070,.073,paleWood,'wood');
  for(let i=0;i<12;i++)b.box(-1.30+i*.237,3.88,.57,.04,.46,.048,'#84593e','wood');
  for(const side of [-1,1])b.box(side*1.32,4.07,.30,.06,.055,.56,paleWood,'wood');
  aircon(b,.51,3.81,.212,.44);
  tileAwning(b,0,5.95,.28,2.92,.68,'green');
  b.disc(-.48,6.39,.177,.429,.205,'#345d50','metal');
  b.ring(-.48,6.39,.285,.38,.035,'#577b5d','metal');
  b.disc(-.48,6.39,.287,.322,.018,'#98a56e','ceramic');
  b.box(-.48,6.39,.31,.164,.164,.02,'#414e42','metal');b.box(-.48,6.39,.322,.1,.1,.01,'#7f8470');
  b.text('18',-1.12,5.94,.44,.234,'#4e4835',{weight:.085});
  b.text('87',-.105,5.94,.44,.234,'#4e4835',{weight:.085});
  sign(b,.33,5.38,.126,1.21,.31,paper,'石村',.198,{color:'#605045',weight:.07});
  seam(b,.93,7.58,.014,.79,1.51);seam(b,-1.29,7.51,.015,.38,.81,1);
  b.box(0,7.76,-1.54,3.21,.15,3.28,'#746457','metal');b.box(0,7.854,-1.54,3.08,.063,3.15,'#887965','asphalt');
  for(const x of [-1.46,1.47])b.box(x,7.99,-1.55,.09,.27,3.06,'#9e7654','wood');
  b.box(0,8.03,-3.00,3.05,.35,.08,'#805d43','wood');
  for(const x of [-.78,.49])planter(b,x,7.87,-.45,1.10,Math.round((x+2)*30));
  b.group('vertical-egg-sign',[-1.54,6.25,.02],-Math.PI/2,()=>{
    sign(b,0,0,.16,.48,2.32,'#efd7a8','永遠卵',.33,{vertical:true,border:'#ac6358',color:'#c09060'});
    b.disc(0,1.49,.16,.317,.20,'#c56b61','metal');b.disc(0,1.49,.273,.256,.026,'#f5d4a6');
    b.oval(0,1.48,.301,.139,.17,.013,'#fff0d5');b.oval(.026,1.47,.316,.082,.075,.008,'#eaa468');
    for(const yy of [-.81,.54])b.rod([0,yy,-.05],[0,yy,.18],.043,iron,'metal');
  });
}
function takeaway(b) {
  b.box(0,3.55,-1.44,2.58,6.65,2.88,'#fae7cb','plaster');
  for(const x of [-1.25,1.25])b.box(x,3.41,.033,.070,6.30,.09,'#b89b76','wood');
  for(let i=0;i<8;i++)for(let j=0;j<4;j++){
    if((i+j*2)%5===0)b.box(-1.08+i*.307,5.15+j*.33,.012,.29,.315,.012,['#ead6b5','#e7cfac','#f3e0c5'][(i+j)%3],'plaster');
  }
  b.box(0,6.805,-1.43,2.79,.106,3.04,'#4b4950','metal');
  mansard(b,0,8.085,-1.15,2.05,1.80,2.94,3.30,1.33);
  const posts=[-.96,.96];
  shopWindow(b,0,4.78,.04,1.93,.97,3);
  b.box(0,4.26,.20,2.07,.098,.37,'#4f4643','metal');
  for(const xx of posts)b.box(xx,4.81,.29,.088,1.09,.114,'#b87761','wood');
  for(let i=0;i<8;i++)b.box(-.81+i*.23,4.80,.29,.088,1.02,.12,i%3?'#cb8a73':'#d6977c','wood');
  b.box(0,5.33,.265,2.04,.061,.17,'#ad7d67','wood');
  b.curve([[-1.10,6.56,.055],[-1.02,6.24,.086],[-.83,6.19,.093],[.80,6.19,.093],[.92,6.29,.091],[.96,6.64,.086]],.030,'#4e453d','metal');
  sign(b,-.13,6.43,.080,.91,.285,'#754a37','ラク缶',.207,{color:'#c4a37d',spacing:1.14,weight:.075});
  b.plate(0,3.68,.227,2.52,.91,.214,.037,'#4c4343','metal');
  b.plate(0,3.69,.346,2.38,.756,.036,.032,'#f0ddc2','ceramic');
  b.text('山 の 男',-1.00,3.605,.372,.174,'#785d47',{spacing:1.07,weight:.049});
  b.disc(.774,3.69,.37,.293,.049,'#6c4938');b.disc(.774,3.69,.404,.210,.027,'#f0dfc1');
  b.oval(.782,3.70,.439,.131,.083,.016,'#d6745f').rotation.z=-.55;
  for(let i=0;i<4;i++)b.rod([.681+i*.039,3.775-i*.022,.458],[.716+i*.039,3.71-i*.025,.458],.007,paper);
  for(const x of [-1.02,1.02])b.box(x,3.17,.235,.090,.17,.14,iron,'metal');
  tileAwning(b,0,3.04,.27,2.89,.75);
  for(let i=0;i<12;i++){
    const xx=-1.19+i*.216,h=.14+(i*3%5)*.025;
    b.box(xx,2.76-h/2,.475,.149,h,.027,['#debd8a','#d58d73','#91aa89','#ebce98'][i%4],'fabric');
  }
  b.box(0,1.34,.044,2.11,1.98,.12,'#c69566','wood');
  for(const x of [-1.09,1.1])b.box(x,1.36,.119,.093,2.18,.17,'#aa7954','wood');
  b.box(-.08,.80,.480,1.52,.80,.683,'#936240','wood');
  for(let i=0;i<10;i++)b.box(-.77+i*.152,.81,.834,.135,.63,.025,i%3?'#b0794e':'#a4704e','wood');
  b.box(-.08,1.087,.57,1.61,.105,.72,'#594a43','metal');
  b.box(-.08,1.39,.197,1.5,.64,.08,'#48433b','wood');
  for(const xx of [-.842,.665])b.box(xx,1.45,.69,.065,.91,.075,paleWood,'wood');
  for(let i=0;i<8;i++){
    const xx=-.72+i*.177,yy=1.71;
    b.box(xx,yy,.604,.142,.278,.033,i%3?'#bf7965':'#dbb889','fabric');
    for(let j=0;j<3;j++)b.box(xx,yy-.072+j*.068,.624,.079,.012,.013,'#f3cca1');
  }
  for(const [i,color] of ['#abd0bc','#d9957d','#f0d5b8','#94a4ac'].entries()){
    const x=-.61+i*.334;
    b.plate(x,1.17,.71,.256,.18,.091,.035,'#393a3a').rotation.x=-.35;
    b.oval(x,1.225,.724,.086,.040,.054,color,'ceramic');
    b.box(x,1.43,.251,.13,.105,.08,color,'ceramic');
  }
  const hatch=b.box(-.08,1.99,.49,1.76,.098,.88,'#695747','wood');hatch.rotation.x=.05;
  b.box(-.08,1.94,.933,1.75,.04,.040,'#41454b','metal');
  postbox(b,1.00,.23,.670); lamp(b,-1.12,.426);lamp(b,1.28,.29);
  menu(b,-.95,1.34,.213,.241,.46);crate(b,-1.12,.23,.75,.36);
  b.group('chalkboard',[-.87,.22,.81],-.22,g=>{
    g.rotation.x=-.17; b.plate(0,.34,0,.32,.54,.06,.018,'#a87e57','wood');
    b.plate(0,.34,.037,.258,.45,.014,.011,'#415348');b.text('魚',-.079,.31,.051,.156,'#e9d5a1');
    for(const x of [-.12,.12])b.box(x,.09,-.04,.04,.21,.055,'#936b48','wood');
  });
  downpipe(b,1.29,.11,6.90);
}

export function buildFrontShops(b) {
  b.group('wave-shop',[-1.58,0,2.45],0,()=>waveShop(b));
  b.group('sushi-counter',[2.77,0,3.02],0,()=>takeaway(b));
  b.group('front-garden',[0,0,0],0,()=>{
    planter(b,-2.11,.23,3.39,1.02,81);planter(b,-.96,.23,3.41,1.03,33);
    flowerTree(b,-2.96,3.18,1.00,61);flowerTree(b,-.23,3.26,.90,91);
    b.group('bike',[-.27,.51,2.86],-.3,()=>bicycle(b));
  });
  b.group('loft-and-passage',[0,0,0],0,()=>{
    const x=-.48,z=.07;
    b.box(x,7.88,z,1.67,2.48,1.60,'#e6d1b3','plaster');
    gableRoof(b,x,9.12,z,1.96,1.95,.69);
    b.box(x-.36,8.28,z+.831,.91,1.15,.078,'#7c5b43','wood');
    for(let i=0;i<10;i++)b.box(x-.778+i*.092,8.29,z+.885,.037,1.14,.048,'#996f4d','wood');
    b.box(.19,7.13,-.63,1.60,1.79,1.17,'#dcc7aa','plaster');
    duct(b,.28,.49,4.22,3.89,.33);
    for(let i=0;i<4;i++)b.box(.43,.277+i*.119,1.03-i*.15,.67,.101,.24,'#72655a','wood');
    b.group('alley-market',[.36,0,.92],-.10,()=>{
      b.box(0,1.85,0,1.05,3.1,.15,'#739184','plaster');
      shade(b,0,2.02,.13,1.19,.36,['#518a78','#c0cc9c']);
      sign(b,0,3.01,.11,.78,.31,paper,'寿司王',.186,{color:'#496682'});
      sign(b,0,2.57,.12,.82,.27,'#deae98','石村',.177,{color:'#744f3d'});
      shopWindow(b,0,1.09,.12,.76,1.12,2);
      crate(b,-.08,.23,.52,.38);crate(b,.27,.23,.35,.32);
    });
    b.group('green-alley-lightbox',[.071,4.48,2.63],-.04,()=>{
      for(const y of [-.8,.70])b.rod([-.1,y,-.27],[0,y,0],.040,iron,'metal');
      b.plate(0,0,0,.52,2.00,.25,.063,'#526d58','metal');
      b.plate(0,0,.143,.435,1.88,.038,.063,'#acd5ad','ceramic');
      for(const [thick,color,zz] of [[.080,'#fae9bb',.170],[.037,'#c96d64',.193]]){
        b.text('鍋物料理',-.178,.55,zz,.36,color,{vertical:true,weight:thick,spacing:1.09});
      }
    });
  });
}
function bicycle(b) {
  for(const x of [-.35,.35]){
    b.ring(x,0,0,.245,.027,'#414246','metal');b.ring(x,0,0,.216,.009,'#969188','metal');
    for(let k=0;k<5;k++){const a=k*Math.PI/5;b.rod([x-.21*Math.cos(a),-.21*Math.sin(a),0],[x+.21*Math.cos(a),.21*Math.sin(a),0],.006,'#9b9b8e','metal');}
  }
  for(const [a,c] of [[[-.35,0,0],[-.14,.32,0]],[[-.14,.32,0],[.06,.01,0]],[[.06,.01,0],[-.35,0,0]],[[.06,.01,0],[.23,.35,0]],[[.23,.35,0],[-.14,.32,0]],[[.23,.35,0],[.35,0,0]]])b.rod(a,c,.016,'#4e8580','metal');
  b.rod([-.22,.37,0],[-.06,.37,0],.029,'#6f503e','wood');
  b.stroke([[.23,.32,0],[.23,.48,0],[.33,.51,0]],.015,iron);
}

function watermelon(b,x,y,z,scale=1) {
  b.group('watermelon-lightbox',[x,y,z],0,g=>{
    g.scale.setScalar(scale);
    b.plate(0,0,0,.84,.96,.16,.067,'#434552','metal');b.plate(0,0,.09,.76,.87,.035,.039,'#c1dbb3');
    const fruit=new T.Shape();fruit.moveTo(-.22,-.13);fruit.quadraticCurveTo(0,-.242,.24,-.125);
    fruit.lineTo(.029,.272);fruit.quadraticCurveTo(0,.33,-.032,.254);fruit.closePath();
    b.shape(fruit,0,0,.120,.018,'#e9989f');
    b.curve([[-.22,-.13,.132],[-.04,-.177,.134],[.10,-.173,.134],[.24,-.125,.132]],.023,'#82a361');
    for(const [xx,yy] of [[-.081,-.04],[.077,-.04],[.005,.131]])b.oval(xx,yy,.139,.016,.025,.009,ink);
    b.stroke([[.002,.27,.139],[.031,.344,.139],[.074,.351,.139]],.015,'#598859');
    for(const sx of [-1,1])b.stroke([[sx*.112,-.174,.140],[sx*.15,-.224,.14],[sx*.196,-.225,.14]],.014,ink);
    b.text('キタ',-.13,-.36,.121,.105,'#bc7a5f',{weight:.059});
  });
}

export function buildSideShops(b) {
  b.group('tea-shop-side',[-3.13,0,.85],-Math.PI/2,()=>{
    brickwork(b,0,1.22,.025,2.91,1.96,7,7);
    for(let i=0;i<3;i++){
      const xx=-.87+i*.82;
      b.plate(xx,1.18,.109,.68,.88,.058,.12,'#b59d77','wood');
      b.plate(xx,1.17,.145,.61,.78,.032,.09,'#665645');
      for(let j=0;j<5;j++)b.box(xx,1.43+j*.046,.174,.50,.014,.009,'#c6ae8b');
      b.box(xx,1.079,.175,.58,.16,.014,'#d2b990','fabric');
    }
    sign(b,0,1.88,.095,.82,.29,'#ad5f51','海洋',.196,{color:'#f9ccb1'});
    duct(b,-.62,.134,2.65,5.36,.43);seam(b,.25,6.80,.079,1.1,1.91,1);
    sign(b,.55,3.66,.123,.82,.80,'#c2a7b3','の',.38,{color:'#e5b6bc'});
    b.oval(.55,3.72,.206,.25,.13,.03,'#a88ca1','ceramic');
    b.curve([[.38,3.62,.217],[.47,3.49,.217],[.61,3.51,.217],[.66,3.62,.217]],.033,'#c18691');
    fence(b,0,.24,.262,2.55,'#98493b');flowerTree(b,-1.14,.34,.75,90);
  });
  b.group('sushi-shop-side',[4.09,0,1.59],Math.PI/2,()=>{
    b.box(0,3.41,.009,2.86,6.36,.046,'#e9d7b7','plaster');
    for(let i=0;i<8;i++)b.box(-1.20+i*.214,4.63,.08,.078,1.23,.09,salmon,'wood');
    duct(b,.62,.09,2.02,4.89,.43);
    b.box(-.60,2.02,.082,1.30,1.64,.16,'#665648','wood');
    for(let i=0;i<8;i++)b.box(-.66,.30+i*.15,.37-i*.022,.70,.09,.22,'#725d4d','wood');
    sign(b,-.62,2.76,.20,1.15,.53,'#a85e50','料理',.31,{color:'#f4cfad'});
    b.group('side-bicycle',[-.65,.52,.48],.09,()=>bicycle(b));
    for(let i=0;i<4;i++)potted(b,.44+i*.20,.23,.32,.62+i%2*.12,80+i);
  });
}
function fence(b,x,y,z,w,color) {
  for(const h of [.16,.48])b.box(x,y+h,z,w,.073,.07,color,'wood');
  for(let i=0;i<=6;i++){
    b.box(x-w/2+i*w/6,y+.32,z,.064,.55,.073,color,'wood');
    if(i<6)b.box(x-w/2+(i+.50)*w/6,y+.35,z,.043,.22,.061,color,'wood');
  }
}
function vendorShop(b) {
  b.box(0,2.58,-1.08,2.34,4.64,2.16,'#56616a','metal');
  for(let j=0;j<26;j++)b.box(-1.14+j*.092,2.72,.04,.026,4.34,.039,j%4?'#626c71':'#485660','metal');
  for(const yy of [.30,2.27,4.17])b.box(0,yy,.083,2.47,.072,.14,iron,'metal');
  shopWindow(b,.11,3.30,.091,1.74,.95,2);planter(b,.16,2.80,.324,1.81,94);
  for(const [xx,ww] of [[-.61,.70],[.34,.84]])shopWindow(b,xx,1.30,.14,ww,1.52,1);
  tileAwning(b,0,2.50,.24,2.55,.68);
  const roof=b.box(0,4.93,-1.00,2.64,.13,2.59,'#806857','metal');roof.rotation.x=-.07;
  for(const x of [-1.25,1.25])b.rod([x,4.81,-2.23],[x,5.02,.23],.050,'#a77552','wood');
  watermelon(b,.97,3.74,.44,.81);
  for(const x of [-.44,.01,.43])crate(b,x,.23,.50);
  b.plate(.83,.74,.43,.34,.71,.06,.027,'#8b6949','wood').rotation.x=-.09;
  menu(b,.83,.74,.49,.245,.57);
}

export function buildRearShops(b) {
  b.group('panda-shop',[-.96,0,-2.16],Math.PI+.43,()=>{
    b.box(0,2.93,-.71,2.35,5.40,1.42,'#a6c3b7','plaster');
    for(const xx of [-1.12,1.12])b.box(xx,2.99,.041,.092,5.48,.10,'#647e77','wood');
    for(const y of [2.05,3.72,5.53])b.box(0,y,.087,2.43,.09,.14,'#52656a','metal');
    shopWindow(b,0,1.10,.067,1.92,1.50,3);shopWindow(b,0,3.20,.077,1.70,.60,4);
    shade(b,0,2.35,.11,2.42,.50,['#607393','#8491aa','#6c7c9a','#7585a5']);
    sign(b,.05,2.73,.111,1.39,.31,'#acbdae','日野武',.216,{color:'#9e7852'});
    aircon(b,-.41,3.01,.18,.42);
    b.group('panda-billboard',[.04,4.99,.23],0,g=>{g.scale.setScalar(1.10);pandaSign(b);});
    b.group('projecting-panda-sign',[1.42,4.45,.40],-.44,()=>{
      b.plate(0,0,0,.65,1.53,.17,.09,iron,'metal');b.plate(0,0,.095,.56,1.40,.031,.066,'#bedcd0','ceramic');
      b.oval(0,.31,.118,.217,.207,.021,paper);for(const s of [-1,1]){b.oval(s*.12,.46,.122,.054,.055,.018,ink);b.oval(s*.10,.33,.139,.041,.061,.015,ink);}
      b.oval(0,.244,.146,.028,.018,.012,ink);b.text('興',-.206,-.50,.126,.402,ink);
    });
    fence(b,0,.23,.53,1.97,'#95483d');potted(b,-1.03,.23,.28,.77,44);
    postbox(b,.95,.23,.30);
    for(const x of [-1.65,-.45]){
      b.box(x,6.28,-.26,.075,1.25,.075,iron,'metal');
      b.rod([x,6.23,-.27],[x,5.71,-.66],.036,iron,'metal');
    }
    b.box(-1.04,6.29,-.21,1.60,.055,.23,iron,'metal');
    sign(b,-1.06,6.94,-.25,1.48,1.17,'#9481a7','戦い',.43,{color:'#e8c778',border:'#353c50',weight:.066});
  });
  b.group('corrugated-shop',[2.59,0,-2.63],Math.PI,g=>{g.scale.x=1.24;vendorShop(b);});
  b.group('street-side-restaurant',[4.06,0,-1.59],Math.PI/2,()=>{
    b.box(0,2.59,.016,1.91,4.59,.08,'#5f696c','metal');
    for(let i=0;i<20;i++)b.box(-.91+i*.096,2.63,.074,.035,4.43,.06,i%3?'#697473':'#526168','metal');
    shopWindow(b,0,3.37,.113,1.57,.86,2);planter(b,0,2.86,.32,1.45,34);
    tileAwning(b,.01,2.45,.319,2.05,.67);shopWindow(b,0,1.26,.122,1.23,1.56,2);
    sign(b,-.78,3.25,.230,.29,.98,paper,'〒自宅',.19,{vertical:true,color:'#805d4c'});
    for(const xx of [-.57,.28,.64])crate(b,xx,.23,.41,.29);
  });
  b.group('roof-services',[0,0,0],0,()=>{
    b.box(-.45,5.66,-1.5,1.28,2.06,1.48,'#dac6a7','plaster');
    b.box(-.45,6.74,-1.5,1.44,.09,1.62,'#6f685e','metal');
    b.box(-.45,6.96,-1.66,1.22,.42,.08,'#9a7652','wood');
    duct(b,4.16,.66,2.75,4.58,.45);
    b.box(4.17,5.14,.66,.60,1.06,.59,'#777b84','metal');
    for(const y of [4.58,5.73])b.box(4.17,y,.66,.66,.068,.64,'#495362','metal');
    b.box(4.17,5.15,.963,.39,.89,.020,'#929091','metal');
  });
  b.group('signs-in-alley',[1.73,0,-.12],Math.PI/2,()=>{
    sign(b,0,4.78,.24,.36,1.33,'#e6d5b8','料理',.226,{vertical:true});
    b.disc(0,3.39,.27,.50,.105,ink,'metal');
    for(let j=0;j<12;j++){
      const sector=new T.Shape();sector.moveTo(0,0);sector.absarc(0,0,.459,j*Math.PI/6,(j+1)*Math.PI/6,false);sector.closePath();
      b.shape(sector,0,3.39,.335,.012,j%2?'#d39378':'#dfb69a');
    }
    b.disc(0,3.39,.352,.212,.025,'#c9a156','metal');b.disc(0,3.39,.373,.099,.018,ink);
    for(let i=0;i<3;i++){const xx=-.27+i*.3;b.oval(xx,2.51,.19,.11,.16,.10,'#b65643','ceramic');b.box(xx,2.65,.19,.13,.034,.11,ink,'metal');}
  });
}


function agedPlaster(b,x,y,z,w,h,seed=1) {
  const positions=[],indices=[],colors=[],tints=['#b4a58e','#bfae98','#c6b89f','#d4c3aa','#cbbaa1'];
  for(let i=0;i<68;i++) {
    const hash=n=>{const v=Math.sin(n*78.243+seed*1.311)*42685.41;return v-Math.floor(v);};
    const distance=Math.pow(hash(i+1),1.9),yy=hash(i+114);
    const px=x+w*distance*(.43+.55*Math.sin(yy*Math.PI)),py=y-h*yy;
    const r=(.014+.037*hash(i+243))*(1-.53*distance),tall=r*(1.15+2.18*hash(i+394));
    const k=positions.length/3;
    positions.push(px-r,py,z,px-r*.19,py+tall*.6,z,px+r,py+tall*.32,z,px+r*.58,py-tall*.72,z,px-r*.46,py-tall,z);
    indices.push(k,k+1,k+2,k,k+2,k+3,k,k+3,k+4);
    const col=new T.Color(tints[Math.floor(hash(i+500)*tints.length)]);
    for(let j=0;j<5;j++)colors.push(col.r,col.g,col.b);
  }
  b.mesh(indexedSurface(positions,indices,colors),'#ffffff',0,0,0,'plaster');
}
function paperLantern(b,x,y,z,r,body) {
  b.oval(x,y,z,r,r*1.45,.86*r,body,'fabric');
  for(let i=-3;i<=3;i++){
    const u=i/4,rr=r*Math.sqrt(1-u*u);
    const ring=b.ring(x,y+u*r*1.45,z,rr,.006,'#956a52','wood');
    ring.rotation.x=Math.PI/2;ring.scale.y=.86;
  }
  for(const side of [-1,1])b.cylinder(x,y+side*r*1.435,z,r*.50,r*.5,.038,ink,12,'wood');
  b.rod([x,y+r*1.44,z],[x,y+r*2.35,z],.014,iron,'metal');
}
function shopExtras(b) {
  b.group('wave-shop-fittings',[-1.58,0,2.45],0,()=>{
    agedPlaster(b,-1.47,7.62,.027,.36,1.18,7);
    agedPlaster(b,1.45,5.39,.025,-.19,.58,27);
    b.stroke([[-1.42,5.54,.12],[-1.27,5.31,.18],[-1.03,5.25,.20],[-.80,5.34,.22],[-.75,5.57,.23]],.023,'#4f4846','metal');
    for(const x of [-.51,.41])b.cylinder(x,5.05,.19,.019,.019,.34,'#686057',8,'metal');
    for(const [x,y,c] of [[-.84,1.47,'#d2ac83'],[-.84,1.34,'#bd7155'],[.11,1.13,'#b3996f'],[.81,1.39,'#b3926a']]){
      b.box(x,y,.23,.19,.083,.02,c,'fabric');b.box(x,y+.014,.245,.115,.011,.006,'#6d5f46');
    }
    b.group('daily-menu',[1.25,.24,.46],-.10,g=>{
      g.rotation.x=-.14;b.plate(0,.48,0,.38,.72,.078,.026,'#835d41','wood');
      menu(b,0,.50,.042,.31,.59);
      for(const xx of [-.147,.147])b.box(xx,.117,0,.043,.237,.064,timber,'wood');
    });
    paperLantern(b,-1.18,1.75,.33,.094,'#e5ba73');
    const medallion=b.disc(-.10,2.25,.234,.16,.030,'#ac594b');medallion.scale.y=.82;
    b.oval(-.10,2.25,.263,.11,.084,.015,'#94b6a2');
  });
  b.group('takeaway-fittings',[2.77,0,3.02],0,()=>{
    b.plate(-1.095,4.06,.076,.237,.59,.054,.026,'#7a5f4c','wood');
    b.plate(-1.095,4.06,.108,.188,.53,.012,.014,'#c88569','fabric');
    b.oval(-1.095,4.08,.128,.059,.071,.015,'#f1d1a0');
    for(let i=0;i<3;i++)b.box(-1.095,3.91+i*.034,.13,.105,.006,.01,'#efd6b0');
    for(const [x,y] of [[-.44,1.49],[-.20,1.4],[.32,1.44]])b.plate(x,y,.40,.146,.171,.024,.008,'#c3cfbd','fabric');
    for(const [x,y,c] of [[-.50,1.27,'#e5b17d'],[-.32,1.24,'#b4bb83'],[.36,1.26,'#b58473']]) {
      const bowl=b.oval(x,y,.525,.078,.041,.065,c,'ceramic');bowl.rotation.z=.15;
    }
    b.group('roof-antenna',[.73,8.10,-1.85],0,()=>{
      b.box(0,.28,0,.57,.49,.085,'#635957','metal');
      b.rod([-.24,.06,0],[-.24,.71,0],.022,iron,'metal');
      b.rod([-.24,.65,0],[-.17,.065,.32],.014,iron,'metal');
    });
    b.cylinder(-.85,.44,.47,.144,.115,.33,'#537766',12,'metal');
    for(let i=0;i<8;i++)b.box(-.939+i*.022,.495,.592,.006,.17,.008,'#7f9274');
    b.plate(-1.01,1.62,.239,.253,.29,.031,.009,'#cfa078','fabric');
    paperLantern(b,-1.20,2.16,.30,.094,'#daa06f');
    for(const x of [-.97,.94])b.box(x,6.76,.12,.105,.091,.32,iron,'metal');
    agedPlaster(b,.98,6.70,.020,-.19,.40,42);
  });
  b.group('rear-walls',[-1.58,0,-.66],Math.PI,()=>{
    b.box(0,4.21,.013,3.01,6.91,.083,'#e4d0b0','plaster');
    for(const yy of [3.74,6.10,7.70])b.box(0,yy,.083,3.11,.094,.154,'#987d60','wood');
    b.box(.04,5.86,.110,2.81,.195,.104,'#c8b395','wood');
    for(let i=0;i<11;i++)b.box(-1.27+i*.25,5.85,.175,.07,.19,.025,'#d7bfa0','wood');
    seam(b,.88,7.61,.073,1.18,1.34,1);seam(b,-.77,5.62,.066,.65,1.31);
    agedPlaster(b,-1.45,7.59,.067,.29,1.16,64);
    downpipe(b,1.42,.116,7.72);
    b.curve([[-1.41,5.84,.165],[-.56,5.68,.165],[.32,5.72,.165],[1.38,5.82,.17]],.024,'#514a44','metal');
    for(const xx of [-.93,.35]){shopWindow(b,xx,4.77,.064,.87,.72,2);b.box(xx,4.37,.177,1.01,.101,.235,'#8c7058','wood');}
    aircon(b,.48,3.88,.161,.61);
  });
  b.group('loft-back-window',[-.48,0,-.77],Math.PI,()=>{
    shopWindow(b,0,8.56,.040,.59,.88,3);
    for(let i=0;i<4;i++)b.box(0,8.23+i*.191,.171,.55,.024,.024,paleWood,'wood');
    b.box(0,8.04,.12,.83,.079,.23,'#86644c','wood');
    b.rod([.66,8.16,.11],[.66,9.04,.11],.035,'#675c4d','metal');
    b.curve([[.64,9.05,.11],[.32,8.95,.17],[-.40,8.99,.17],[-.65,9.09,.12]],.012,'#554d47');
  });
  b.group('wave-shop-alley-wall',[-.060,0,1.03],Math.PI/2,()=>{
    b.box(0,1.50,.023,2.78,2.49,.055,'#796756','wood');
    brickwork(b,-.06,.93,.074,2.56,1.35,6,6);
    shopWindow(b,-.65,1.35,.100,1.02,1.70,2);
    shade(b,-.42,2.47,.08,1.67,.37,['#518478','#8daf90']);
    b.box(-.17,2.84,.07,2.61,.13,.12,'#544d4b','metal');
    b.plate(-.55,3.26,.10,1.05,.65,.075,.038,'#836b52','wood');
    b.plate(-.55,3.26,.154,.96,.56,.020,.026,'#c6ac87','fabric');
    b.text('石村',-.89,3.12,.174,.267,'#775841',{weight:.068});
    shopWindow(b,-.38,6.88,.033,1.34,1.22,2);
    b.plate(-.41,6.88,.154,1.20,1.07,.018,.005,'#a39c8e','metal');
    duct(b,-.47,.256,4.38,3.23,.32);
    b.box(-.47,6.25,.26,.429,.55,.39,'#8b8885','metal');
    for(const y of [5.95,6.54])b.box(-.47,y,.26,.46,.042,.43,'#525765','metal');
    b.curve([[-.47,4.47,.27],[-.47,4.10,.28],[-.20,3.89,.27],[-.20,3.66,.26]],.084,'#676875','metal');
    b.stroke([[-1.33,7.60,.13],[-1.33,6.83,.13],[-1.16,6.64,.14],[-1.16,5.68,.14]],.027,'#4c4c4a','metal');
    for(const y of [3.74,5.47,7.70])b.box(0,y,.091,2.89,.069,.17,'#8e775d','wood');
  });
  b.group('passage-lightboxes',[.36,0,1.37],-.03,()=>{
    for(const y of [3.23,3.65,4.09])b.rod([-.33,y,-.09],[.25,y,-.09],.021,iron,'metal');
    sign(b,.02,4.16,0,.63,.34,'#d6b880','石村',.183,{color:'#6b5142',weight:.06});
    sign(b,.01,3.73,.018,.65,.29,'#d2cabe','寿司王',.160,{color:'#536e86',weight:.061});
    sign(b,.06,3.28,-.04,.47,.34,'#b57b68','の',.19,{color:'#eee4c8'});
    crate(b,-.16,.23,.47,.37);crate(b,-.11,.50,.45,.32);
  });
  b.group('eaves-on-side-street',[4.07,0,-1.60],Math.PI/2,()=>{
    const awning=b.box(0,4.80,.20,2.23,.054,.68,'#65727e','metal');awning.rotation.x=.09;
    for(const x of [-.87,.81]){
      b.stroke([[x,4.47,.034],[x,4.73,.42],[x,4.79,.54]],.031,'#4b4d51','metal');
      b.cylinder(x,4.93,.49,.060,.080,.14,'#836c4b',10,'ceramic');
    }
    b.rod([-1.11,4.78,.54],[1.10,4.78,.54],.047,'#59646a','metal');
    b.curve([[-.96,4.73,.52],[-.97,4.55,.52],[-.79,4.38,.12],[-.79,3.79,.12]],.039,'#566364','metal');
    b.box(.61,3.65,.42,.24,.35,.18,'#b18e68','wood');
  });
  b.group('alley-services',[.52,0,2.15],0,()=>{
    b.box(-.18,.89,0,.42,1.31,.40,'#a15446','metal');
    b.plate(-.18,1.02,.210,.32,.69,.020,.018,'#b3c6b7','glass');
    for(let j=0;j<3;j++)for(let i=0;i<3;i++)b.box(-.284+i*.096,.833+j*.171,.23,.052,.102,.018,['#cd8f73','#d3c496','#6f9488'][(i+j)%3]);
    b.box(-.17,.46,.22,.269,.082,.024,'#754539','metal');
    sign(b,.09,3.98,0,.39,.85,'#ffe0a1','魚',.26,{color:'#bb7960'});
    paperLantern(b,.28,2.48,-.42,.122,'#c66d56');
  });
  b.group('overhead-tram-wires',[0,0,0],0,()=>{
    const metal='#41454b';
    b.curve([[-5.98,4.27,2.94],[-4.47,4.29,2.51],[-3.29,4.37,2.04],[-2.89,4.41,1.87]],.019,metal,'metal');
    for(const z of [1.10,-1.53]){
      b.stroke([[-3.03,3.96,z],[-3.08,4.33,z],[-4.43,4.33,z]],.024,metal,'metal');
      b.rod([-3.1,3.98,z],[-4.25,4.33,z],.015,metal,'metal');
    }
    b.curve([[-4.44,4.33,2.49],[-4.44,4.28,1.08],[-4.41,4.31,-.44],[-3.85,4.32,-1.70]],.014,metal,'metal');
    b.curve([[1.02,5.73,2.87],[.79,5.59,1.92],[.40,5.51,1.10],[.18,5.64,.75]],.020,metal,'metal');
    b.curve([[3.77,5.30,1.53],[4.12,5.17,.61],[4.47,5.16,-.87],[4.52,5.27,-2.05]],.019,metal,'metal');
    b.stroke([[3.62,4.98,-.75],[3.66,5.27,-.75],[4.49,5.27,-.75]],.024,metal,'metal');
  });
  b.group('restaurant-lantern-box',[4.58,3.95,-.50],.29,()=>{
    for(const yy of [-.38,.37])b.rod([-.47,yy,-.08],[.10,yy,0],.027,iron,'metal');
    watermelon(b,.16,0,0,1.01);
  });
}
export {shopExtras};
