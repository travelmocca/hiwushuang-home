import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { letterSign } from './lettering.js';

const finishes = {
  paint: [.75, .04], plaster: [.97, 0], wood: [.87, .015],
  tile: [.53, .07], metal: [.54, .28], glass: [.32, .1],
  leaf: [.96, 0], asphalt: [.98, 0], ceramic: [.39, .05], fabric: [.98, 0],
};

const noise = `
varying vec3 craftPosition;

float craftHash(vec3 p) {
  p = fract(p * vec3(.1031,.11369,.13787));
  p += dot(p,p.yxz+19.19);
  return fract((p.x+p.y)*p.z);
}
float craftNoise(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(mix(craftHash(i),craftHash(i+vec3(1,0,0)),f.x),
                 mix(craftHash(i+vec3(0,1,0)),craftHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(craftHash(i+vec3(0,0,1)),craftHash(i+vec3(1,0,1)),f.x),
                 mix(craftHash(i+vec3(0,1,1)),craftHash(i+vec3(1)),f.x),f.y),f.z);
}`;
const patterns = {
  plaster: `float stain=craftNoise(p*vec3(4.,.85,4.))*.62+craftNoise(p*9.)*.38;
    diffuseColor.rgb*=.94+.1*n;
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.56,.48,.43),smoothstep(.65,.89,stain)*.26);`,
  wood: `float fiber=craftNoise(vec3((p.x+p.z)*41.,p.y*1.2,p.z*3.));
    diffuseColor.rgb*=.77+.32*fiber+.09*n;`,
  tile: `diffuseColor.rgb*=.88+.2*craftNoise(p*4.8)+.075*n;`,
  metal: `float streak=craftNoise(p*vec3(15.,.9,15.));
    diffuseColor.rgb*=.85+.17*streak+.09*n;`,
  glass: `float stripe=fract((p.x+p.z)*.74+p.y*1.7);
    diffuseColor.rgb*=.86+.18*n;
    diffuseColor.rgb+=vec3(.05,.078,.083)*(1.-smoothstep(.035,.13,abs(stripe-.4)))*.65;`,
  fabric: `diffuseColor.rgb*=.91+.13*n;`,
  asphalt: `diffuseColor.rgb*=.73+.46*n;`,
};
function makeMaterial(color, finish) {
  const [roughness, metalness] = finishes[finish];
  const material = new T.MeshStandardMaterial({color, roughness, metalness, side:T.DoubleSide});
  material.userData.finish = finish;
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 craftPosition;\n\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ncraftPosition=position;');
    shader.fragmentShader = noise + '\n' + shader.fragmentShader;
    const pattern = patterns[finish] || (finish === 'leaf' ? '' : 'diffuseColor.rgb*=.94+.11*n;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\nvec3 p=craftPosition; float n=craftNoise(p*48.);\n'+pattern);
    if(finish==='tile'){
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
        'outgoingLight+=diffuseColor.rgb*vec3(.29,.21,.19)*smoothstep(.07,.25,diffuseColor.r-diffuseColor.b)*(.30+.70*max(0.,inverseTransformDirection(normal,viewMatrix).z));\n#include <opaque_fragment>');
    }
  };
  material.customProgramCacheKey = () => finish;
  return material;
}

export function roundedPath(w,h,r) {
  const s=new T.Shape(), l=-w/2, b=-h/2, right=w/2, top=h/2;
  r=Math.min(r,w/2,h/2);
  s.moveTo(l+r,b); s.lineTo(right-r,b); s.quadraticCurveTo(right,b,right,b+r);
  s.lineTo(right,top-r); s.quadraticCurveTo(right,top,right-r,top);
  s.lineTo(l+r,top); s.quadraticCurveTo(l,top,l,top-r);
  s.lineTo(l,b+r); s.quadraticCurveTo(l,b,l+r,b);
  return s;
}
export function indexedSurface(vertices,indices,colors) {
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  if(colors) geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  return geometry;
}

export function createBuilder(root) {
  let parent=root;
  const materials=new Map();
  function material(color,finish) {
    const key=finish+color;
    if(!materials.has(key)) materials.set(key,makeMaterial(color,finish));
    return materials.get(key);
  }
  function mesh(geometry,color,x=0,y=0,z=0,finish='paint') {
    const m=new T.Mesh(geometry,material(color,finish));
    if(geometry.hasAttribute('color')) {
      m.material=m.material.clone(); m.material.vertexColors=true;
      m.material.onBeforeCompile=material(color,finish).onBeforeCompile;
      m.material.customProgramCacheKey=material(color,finish).customProgramCacheKey;
    }
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
    parent.add(m); return m;
  }
  function group(name,position,rotation,build) {
    const outer=parent, g=new T.Group(); g.name=name; g.position.set(...position); g.rotation.y=rotation;
    outer.add(g); parent=g;
    try {build(g);} finally {parent=outer;}
    return g;
  }
  function box(x,y,z,w,h,d,color,finish) {
    return mesh(new T.BoxGeometry(w,h,d),color,x,y,z,finish);
  }
  function cylinder(x,y,z,top,bottom,height,color,segments=16,finish) {
    return mesh(new T.CylinderGeometry(top,bottom,height,segments),color,x,y,z,finish);
  }
  function oval(x,y,z,rx,ry,rz,color,finish) {
    const m=mesh(new T.SphereGeometry(1,20,14),color,x,y,z,finish);
    m.scale.set(rx,ry,rz); return m;
  }
  function shape(s,x,y,z,depth,color,bevel=0,finish) {
    const geometry=new T.ExtrudeGeometry(s,{depth:Math.max(.001,depth-2*bevel),bevelEnabled:bevel>0,
      bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1,curveSegments:10});
    geometry.translate(0,0,-depth/2+bevel);
    return mesh(geometry,color,x,y,z,finish);
  }
  function plate(x,y,z,w,h,d,r,color,finish) {
    const b=Math.min(d*.23,r*.2);
    return shape(roundedPath(w-2*b,h-2*b,Math.max(.001,r-b)),x,y,z,d,color,b,finish);
  }
  function disc(x,y,z,r,d,color,finish) {
    const m=cylinder(x,y,z,r,r,d,color,32,finish); m.rotation.x=Math.PI/2; return m;
  }
  function ring(x,y,z,r,width,color,finish) {
    return mesh(new T.TorusGeometry(r,width,8,36),color,x,y,z,finish);
  }
  function rod(a,b,r,color,finish) {
    const v=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.sub(v);
    const m=cylinder(v.x+delta.x/2,v.y+delta.y/2,v.z+delta.z/2,r,r,delta.length(),color,7,finish);
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); return m;
  }
  function stroke(points,r,color,finish) {
    for(let i=1;i<points.length;i++) rod(points[i-1],points[i],r,color,finish);
  }
  function curve(points,r,color,finish,segments=24) {
    const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(path,segments,r,7,false),color,0,0,0,finish);
  }
  const builder={mesh,group,box,cylinder,oval,shape,plate,disc,ring,rod,stroke,curve};
  builder.text=(...args)=>letterSign(builder,...args);
  return builder;
}

// Keep moving joints and named architecture assemblies editable while reducing draw calls.
export function batchPart(part) {
  part.updateWorldMatrix(true,true);
  const local=new T.Matrix4().copy(part.matrixWorld).invert(), byFinish=new Map();
  part.traverse(item=>{
    if(!item.isMesh)return;
    const original=item.geometry, geo=original.index ? original.toNonIndexed() : original.clone();
    geo.applyMatrix4(new T.Matrix4().multiplyMatrices(local,item.matrixWorld));
    for(const key of Object.keys(geo.attributes)) if(!['position','normal','color'].includes(key)) geo.deleteAttribute(key);
    const {color,userData:{finish}}=item.material;
    const shading=geo.getAttribute('color'), count=geo.getAttribute('position').count;
    if(shading) {
      for(let i=0;i<count;i++) shading.setXYZ(i,shading.getX(i)*color.r,shading.getY(i)*color.g,shading.getZ(i)*color.b);
    }else{
      const rgb=new Float32Array(count*3);
      for(let i=0;i<rgb.length;i+=3){rgb[i]=color.r;rgb[i+1]=color.g;rgb[i+2]=color.b;}
      geo.setAttribute('color',new T.BufferAttribute(rgb,3));
    }
    if(!byFinish.has(finish))byFinish.set(finish,[]);
    byFinish.get(finish).push(geo);
    original.dispose();
  });
  part.clear();
  for(const [finish,geometries] of byFinish) {
    const material=makeMaterial('#ffffff',finish); material.vertexColors=true;
    const geometry=mergeGeometries(geometries,false);
    const mesh=new T.Mesh(geometry,material); mesh.name=finish;
    mesh.castShadow=true; mesh.receiveShadow=true; part.add(mesh);
    for(const entry of geometries)entry.dispose();
  }
}
