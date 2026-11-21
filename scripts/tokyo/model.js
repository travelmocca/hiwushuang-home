import * as T from 'three';
import { createBuilder, batchPart } from './construction.js';
import { buildRoad, streetFurniture, trainPose, cycleSeconds } from './street.js';
import { buildFrontShops, buildSideShops, buildRearShops, shopExtras } from './details.js';
import { buildCat, buildTrain } from './landmarks.js';

export {trainPose,cycleSeconds};

// The default model batches the rigid parts. Pass {batch:false} to inspect and edit individual solids.
export function createModel({batch=true}={}) {
  const root=new T.Group();root.name='littlest-tokyo';root.scale.set(1.14,1,1.14);
  const b=createBuilder(root);
  const streets=b.group('architecture',[0,0,0],0,()=>{
    b.group('street-and-tramway',[0,0,0],0,()=>buildRoad(b));
    buildFrontShops(b);
    buildSideShops(b);
    buildRearShops(b);
    shopExtras(b);
    b.group('street-furniture',[0,0,0],0,()=>streetFurniture(b));
  });
  const {cat,body,paw}=buildCat(b);
  const {train,car}=buildTrain(b);
  const fan=b.group('extractor-fan',[-3.155,4.35,1.06],-Math.PI/2,()=>{
    b.disc(0,0,0,.148,.045,'#73797a','metal');
    for(let j=0;j<4;j++){
      const angle=j*Math.PI/2;
      b.oval(.088*Math.cos(angle),.088*Math.sin(angle),.034,.081,.037,.024,'#4c5558','metal').rotation.z=angle+.32;
    }
  });
  let sourceMeshCount=0;
  root.traverse(object=>{if(object.isMesh)sourceMeshCount++;});
  if(batch){
    for(const part of [...streets.children,body,paw,car,fan])batchPart(part);
  }
  root.userData={sourceMeshCount,procedural:true,externalAssets:0,cycleSeconds};
  function update(seconds) {
    const t=T.MathUtils.euclideanModulo(seconds,cycleSeconds);
    const p=trainPose(t/cycleSeconds);
    car.position.copy(p.position);car.rotation.y=Math.atan2(p.direction.x,p.direction.z);
    const angle=t*2*Math.PI/cycleSeconds;
    paw.rotation.x=.06+.27*Math.sin(3*angle);
    fan.rotation.z=8*angle;
  }
  update(0);
  return {root,train,cat,paw,update};
}
