import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x101f35);
scene.fog=new THREE.FogExp2(0x101f35,.009);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
scene.add(new THREE.HemisphereLight(0xb7e6ff,0x243044,2.05));
const keyLight=new THREE.DirectionalLight(0xffd0a1,3.0);keyLight.position.set(-45,70,30);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);keyLight.shadow.camera.left=-90;keyLight.shadow.camera.right=90;keyLight.shadow.camera.top=90;keyLight.shadow.camera.bottom=-90;scene.add(keyLight);
const cyanLight=new THREE.PointLight(0x27e8dc,28,95);cyanLight.position.set(0,19,0);scene.add(cyanLight);
const pinkLight=new THREE.PointLight(0xff387f,22,80);pinkLight.position.set(38,13,-24);scene.add(pinkLight);
const mats={road:new THREE.MeshStandardMaterial({color:0x263b4d,roughness:.82,metalness:.2,side:THREE.DoubleSide}),roadAlt:new THREE.MeshStandardMaterial({color:0x21384a,roughness:.77,metalness:.22,side:THREE.DoubleSide}),edge:new THREE.MeshStandardMaterial({color:0x32d9d4,emissive:0x087d82,emissiveIntensity:1.6,roughness:.35}),pink:new THREE.MeshStandardMaterial({color:0xff4b8e,emissive:0x9a164d,emissiveIntensity:1.2}),white:new THREE.MeshStandardMaterial({color:0xe8f7ff,emissive:0x326078,emissiveIntensity:.3}),gold:new THREE.MeshStandardMaterial({color:0xffc45e,emissive:0x8c4a0b,emissiveIntensity:.8}),dark:new THREE.MeshStandardMaterial({color:0x101b2a,roughness:.45,metalness:.5})};
const coursePoints=[[-21,0,43],[15,0,43],[43,0,30],[54,3,8],[49,7,-15],[29,10,-34],[-2,8,-40],[-33,6,-29],[-51,2,-7],[-48,0,20],[-32,2,43],[-4,3,52]];
const curve=new THREE.CatmullRomCurve3(coursePoints.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.16);
const trackLength=curve.getLength(),roadWidth=8.2;
const gaps=[{u:.145,size:8},{u:.585,size:7.5}];
const gapAt=(u)=>gaps.some(g=>Math.abs((((u-g.u+.5)%1+1)%1)-.5)*trackLength<g.size/2);
const ground=new THREE.Mesh(new THREE.CircleGeometry(185,80),new THREE.MeshStandardMaterial({color:0x0b1725,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.2;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(180,60,0x244158,0x14283a);grid.position.y=-1.15;scene.add(grid);
function ribbonGeometry(startU,endU,sideOffset,width,steps,skipGaps=false){const pos=[],idx=[];for(let i=0;i<steps;i++){const u0=(startU+(endU-startU)*i/steps+1)%1,u1=(startU+(endU-startU)*(i+1)/steps+1)%1;if(skipGaps&&(gapAt(u0)||gapAt(u1)))continue;for(const u of [u0,u1]){const p=curve.getPointAt(u),t=curve.getTangentAt(u),right=new THREE.Vector3(t.z,0,-t.x).normalize();for(const s of [-1,1]){const v=p.clone().addScaledVector(right,sideOffset+s*width/2);v.y+=.015;pos.push(v.x,v.y,v.z)}}const n=pos.length/3;idx.push(n-4,n-3,n-2,n-3,n-1,n-2)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
const road=new THREE.Mesh(ribbonGeometry(0,1,0,roadWidth,1000,true),mats.road);road.receiveShadow=true;scene.add(road);
const strip1=new THREE.Mesh(ribbonGeometry(0,1,0,.13,1000,true),new THREE.MeshStandardMaterial({color:0x8097a8,roughness:.9,side:THREE.DoubleSide}));strip1.position.y=.035;scene.add(strip1);
// Broken center dashes and luminous guardrails trace the parkour skyway.
for(let i=0;i<100;i++){const u=i/100,p=curve.getPointAt(u),t=curve.getTangentAt(u),right=new THREE.Vector3(t.z,0,-t.x).normalize();if(!gapAt(u)){const dash=new THREE.Mesh(new THREE.BoxGeometry(.13,.035,1.35),new THREE.MeshBasicMaterial({color:0x94b6c8,transparent:true,opacity:.48}));dash.position.set(p.x,p.y+.065,p.z);dash.rotation.y=Math.atan2(t.x,t.z);scene.add(dash)}for(const side of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.12,.22,.85),side<0?mats.edge:mats.pink);rail.position.copy(p).addScaledVector(right,side*(roadWidth/2+.24));rail.position.y=p.y+.21;rail.rotation.y=Math.atan2(t.x,t.z);scene.add(rail)}}
// Gap lips, floating boost hoops, and a skyline of illuminated towers.
for(const g of gaps){for(const end of [-1,1]){const u=(g.u+end*g.size/trackLength/2+1)%1,p=curve.getPointAt(u),t=curve.getTangentAt(u);const lip=new THREE.Mesh(new THREE.BoxGeometry(roadWidth,.18,.28),mats.gold);lip.position.set(p.x,p.y+.04,p.z);lip.rotation.y=Math.atan2(t.x,t.z);scene.add(lip)}}
for(let i=0;i<52;i++){const a=i*2.399,r=64+(i%7)*7,x=Math.cos(a)*r,z=Math.sin(a)*r,h=9+(i*17%29),w=3+(i%4)*1.3;const geo=new THREE.BoxGeometry(w,h,w);const mat=new THREE.MeshStandardMaterial({color:i%3===0?0x18324b:0x12283d,roughness:.8,metalness:.3,emissive:i%4===0?0x081f31:0x000000,emissiveIntensity:.7});const b=new THREE.Mesh(geo,mat);b.position.set(x,h/2-1,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);for(let q=0;q<3;q++){const win=new THREE.Mesh(new THREE.BoxGeometry(.12,.7,.08),q%2?mats.edge:mats.pink);win.position.set(x+(q-1)*.7,h*.35,z+w/2+.06);scene.add(win)}}
const sun=new THREE.Mesh(new THREE.SphereGeometry(7,24,16),new THREE.MeshBasicMaterial({color:0xff7c88}));sun.position.set(-70,44,-95);scene.add(sun);
function addHoop(u,color=0x40f5e1){const p=curve.getPointAt(u),t=curve.getTangentAt(u);const hoop=new THREE.Mesh(new THREE.TorusGeometry(2.35,.13,10,40),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2}));hoop.position.set(p.x,p.y+2.7,p.z);hoop.rotation.y=Math.atan2(t.x,t.z);scene.add(hoop);const postMat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8});for(const s of [-1,1]){const post=new THREE.Mesh(new THREE.BoxGeometry(.16,5.3,.16),postMat);post.position.set(p.x+s*2.4,p.y+2.65,p.z);scene.add(post)}return hoop}
const hoops=[addHoop(.32),addHoop(.78,0xff4d92)];
// Car and mech are hand-built from low-poly parts; form changes animate as one dramatic snap-shift.
function box(parent,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const car=new THREE.Group(),robot=new THREE.Group();scene.add(car,robot);
const carPaint=new THREE.MeshStandardMaterial({color:0xf13f7b,metalness:.55,roughness:.28}),glass=new THREE.MeshStandardMaterial({color:0x102c42,metalness:.55,roughness:.18,emissive:0x0b3044,emissiveIntensity:.55}),tire=new THREE.MeshStandardMaterial({color:0x10151c,roughness:.72}),rim=new THREE.MeshStandardMaterial({color:0x74f4e3,metalness:.7,roughness:.2,emissive:0x16877e,emissiveIntensity:.6}),robotMetal=new THREE.MeshStandardMaterial({color:0x21cbbd,metalness:.65,roughness:.31}),robotDark=new THREE.MeshStandardMaterial({color:0x172b3d,metalness:.65,roughness:.35});
box(car,1.65,.48,3.2,carPaint,0,.52,0);box(car,1.22,.55,1.45,glass,0,1.02,-.25);box(car,1.75,.17,.72,carPaint,0,.65,1.24);box(car,.12,.17,.08,mats.white,-.53,.68,1.62);box(car,.12,.17,.08,mats.white,.53,.68,1.62);box(car,.18,.12,.1,mats.pink,-.58,.53,-1.62);box(car,.18,.12,.1,mats.pink,.58,.53,-1.62);
const wheels=[];for(const x of [-.9,.9])for(const z of [-1.03,1.03]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,12),tire);w.rotation.z=Math.PI/2;w.position.set(x,.39,z);w.castShadow=true;car.add(w);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.32,10),rim);hub.rotation.z=Math.PI/2;hub.position.set(x,.39,z);car.add(hub);wheels.push(w,hub)}
box(robot,.94,1.05,.58,robotMetal,0,1.18,0);box(robot,.78,.28,.7,robotDark,0,1.84,.04);box(robot,.68,.38,.48,robotMetal,0,2.27,.05);box(robot,.5,.13,.08,mats.edge,0,2.28,.3);
for(const s of [-1,1]){box(robot,.34,.92,.4,robotMetal,s*.46,.25,-.06);box(robot,.4,.32,.55,robotDark,s*.46,-.32,.08);box(robot,.37,.82,.39,robotMetal,s*.95,1.33,0);box(robot,.43,.32,.46,robotDark,s*1.04,.87,.02);box(robot,.29,.48,.32,robotDark,s*1.04,.52,.12)}
robot.visible=false;
const obstacles=[];function addObstacle(u,type){const p=curve.getPointAt(u),t=curve.getTangentAt(u),right=new THREE.Vector3(t.z,0,-t.x).normalize(),g=new THREE.Group();g.position.copy(p);g.rotation.y=Math.atan2(t.x,t.z);scene.add(g);if(type==='gate'){box(g,2.4,.22,.28,mats.pink,0,1.05,0);for(const s of [-1,1])box(g,.2,2,.3,mats.dark,s*1.25,0,0);for(const s of [-1,1])box(g,.2,.3,.34,mats.gold,s*1.25,.86,0)}else{for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.54,1.25,5),mats.gold);b.position.set((i-1)*1.3,.63,0);b.castShadow=true;g.add(b)}}obstacles.push({u,type,group:g,active:true,lane:0})}
addObstacle(.405,'gate');addObstacle(.88,'cones');
const checkpoints=[.26,.68];let nextCheckpoint=0;
let running=false,finished=false,progressDistance=0,speed=0,lane=0,laneTarget=0,jumpY=0,jumpV=0,boost=0,transforming=0,robotMode=false,elapsed=0,toastTimer=0,hitCooldown=0;
const keys={};
const ui={speed:document.querySelector('#speed'),meter:document.querySelector('#speed-meter'),mode:document.querySelector('#mode-name'),icon:document.querySelector('#mode-icon'),pill:document.querySelector('#mode-pill'),modePanel:document.querySelector('.mode-panel'),progress:document.querySelector('#progress'),time:document.querySelector('#race-time'),objective:document.querySelector('#objective-text'),distance:document.querySelector('#objective-distance'),toast:document.querySelector('#toast')};
function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');toastTimer=1.35}
function formatTime(t){const m=Math.floor(t/60),s=Math.floor(t%60),cs=Math.floor((t%1)*100);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`}
function toggleForm(){if(!running||finished||transforming>0)return;robotMode=!robotMode;transforming=.52;ui.mode.textContent=robotMode?'MECH':'SPEEDER';ui.icon.textContent=robotMode?'⬟':'◆';ui.pill.textContent=robotMode?'SMASH':'RACE';ui.modePanel.classList.toggle('robot',robotMode);showToast(robotMode?'MECH FORM — BREAK THROUGH':'SPEED FORM — FULL THROTTLE')}
function jump(){if(!running||finished)return;if(jumpY<.08){jumpV=10.4;showToast('PARKOUR JUMP!')}}
function startRace(){running=true;finished=false;elapsed=0;progressDistance=0;speed=4;lane=0;laneTarget=0;jumpY=0;boost=0;nextCheckpoint=0;robotMode=false;transforming=0;car.visible=true;robot.visible=false;document.querySelector('#start-screen').classList.add('hidden');document.querySelector('#finish-screen').classList.add('hidden');showToast('RUN STARTED — HIT THE GAP')}
document.querySelector('#start-btn').addEventListener('click',startRace);
document.querySelector('#restart-btn').addEventListener('click',startRace);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys[k]=true;if((k===' '||k==='arrowup')&&!e.repeat)jump();if(k==='x'&&!e.repeat)toggleForm();if(k==='enter'&&!running)startRace()});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-control]').forEach(btn=>{const c=btn.dataset.control;const down=e=>{e.preventDefault();btn.classList.add('active');if(c==='left')keys.touchleft=true;else if(c==='right')keys.touchright=true;else if(c==='gas')keys.touchgas=true;else if(c==='jump')jump();else if(c==='transform')toggleForm()};const up=()=>{btn.classList.remove('active');if(c==='left')keys.touchleft=false;if(c==='right')keys.touchright=false;if(c==='gas')keys.touchgas=false};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)});
document.querySelector('#sound-btn').addEventListener('click',e=>{const b=e.currentTarget;b.dataset.off=b.dataset.off==='1'?'0':'1';b.innerHTML=b.dataset.off==='1'?'♫ <span>SOUND OFF</span>':'♫ <span>SOUND ON</span>'});
function currentU(){return ((progressDistance%trackLength)/trackLength+1)%1}
function nearestTarget(){const u=currentU();let best=1,label='FINISH';for(const g of gaps){let d=(g.u-u+1)%1;if(d<best){best=d;label='CLEAR THE GAP'}}for(const o of obstacles){if(o.active){let d=(o.u-u+1)%1;if(d<best){best=d;label=robotMode?'SMASH THE GATE':'DODGE THE GATE'}}}ui.objective.textContent=label;ui.distance.textContent=`${Math.max(0,Math.floor(best*trackLength))} M`}
function resetAtCheckpoint(){const checkpoint=checkpoints[Math.max(0,nextCheckpoint-1)]||0;progressDistance=checkpoint*trackLength;speed=5;jumpY=0;jumpV=0;lane=0;laneTarget=0;showToast('WIPEOUT — BACK TO CHECKPOINT')}
function finishRace(){finished=true;running=false;speed=0;document.querySelector('#finish-time').textContent=formatTime(elapsed);const best=Number(localStorage.getItem('neonshift-best')||0);if(!best||elapsed<best){localStorage.setItem('neonshift-best',String(elapsed));document.querySelector('#finish-title').innerHTML='NEW<br><em>RECORD.</em>';document.querySelector('#finish-copy').textContent='The skyline belongs to you. New best time!'}else{document.querySelector('#finish-title').innerHTML='CIRCUIT<br><em>CONQUERED.</em>';document.querySelector('#finish-copy').textContent='You made the skyline yours.'}document.querySelector('#finish-screen').classList.remove('hidden')}
const bestStored=Number(localStorage.getItem('neonshift-best')||0);if(bestStored)document.querySelector('#best-time').textContent=formatTime(bestStored);
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;if(running&&!finished){elapsed+=dt;const steering=(keys.a||keys.arrowleft||keys.touchleft?-1:0)+(keys.d||keys.arrowright||keys.touchright?1:0);laneTarget=THREE.MathUtils.clamp(laneTarget+steering*dt*5,-3.15,3.15);lane=THREE.MathUtils.damp(lane,laneTarget,7,dt);const throttle=keys.w||keys.arrowup||keys.touchgas,brake=keys.s||keys.arrowdown;const boosted=keys.shift&&!robotMode;const maxSpeed=robotMode?23.5:(boosted?39:31);speed=THREE.MathUtils.clamp(speed+(throttle?13:brake?-20:4)*dt,0,maxSpeed);if(boosted&&speed>18)boost=Math.min(1,boost+dt*2);else boost=Math.max(0,boost-dt*3);if(jumpY>0||jumpV>0){jumpV-=24*dt;jumpY=Math.max(0,jumpY+jumpV*dt);if(jumpY===0)jumpV=0}
    progressDistance+=speed*dt;const u=currentU();
    if(gapAt(u)&&jumpY<.85){resetAtCheckpoint()}
    if(Math.abs(lane)>3.5){speed=Math.max(4,speed-16*dt);laneTarget=THREE.MathUtils.clamp(laneTarget,-3.1,3.1)}
    if(hitCooldown>0)hitCooldown-=dt;
    for(const o of obstacles){const du=Math.abs((((u-o.u+.5)%1+1)%1)-.5)*trackLength;if(o.active&&du<2.1&&Math.abs(lane-o.lane)<1.55&&jumpY<1.3&&hitCooldown<=0){if(robotMode){o.active=false;o.group.visible=false;showToast('OBSTACLE SMASHED! + MECH BONUS');speed=Math.min(maxSpeed,speed+2)}else{speed=Math.max(5,speed*.48);hitCooldown=.9;showToast('IMPACT! SHIFT TO MECH OR DODGE')}}}
    if(nextCheckpoint<checkpoints.length&&u>=checkpoints[nextCheckpoint]){nextCheckpoint++;showToast('CHECKPOINT SECURED')}
    if(progressDistance>=trackLength)finishRace();
  }
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show')}
  const u=currentU(),p=curve.getPointAt(u),t=curve.getTangentAt(u),right=new THREE.Vector3(t.z,0,-t.x).normalize();const position=p.clone().addScaledVector(right,lane);position.y+=.13+jumpY;
  car.position.copy(position);robot.position.copy(position);const angle=Math.atan2(t.x,t.z);car.rotation.set(0,angle,0);robot.rotation.set(0,angle,0);
  if(transforming>0){transforming=Math.max(0,transforming-dt);const q=1-transforming/.52;car.visible=true;robot.visible=true;if(robotMode){car.scale.setScalar(1-.88*q);robot.scale.setScalar(.12+.88*q);robot.rotation.y=angle+(1-q)*Math.PI*2}else{car.scale.setScalar(.12+.88*q);robot.scale.setScalar(1-.88*q);robot.rotation.y=angle+q*Math.PI*2}if(transforming===0){car.visible=!robotMode;robot.visible=robotMode;car.scale.setScalar(1);robot.scale.setScalar(1)}}
  car.visible=transforming>0?true:!robotMode;robot.visible=transforming>0?true:robotMode;
  for(const w of wheels)w.rotation.x+=speed*dt*1.6;
  const desiredCam=position.clone().addScaledVector(t,-8.2);desiredCam.y+=4.5+Math.min(speed*.022,1);camera.position.lerp(desiredCam,.12);const look=position.clone().addScaledVector(t,3.8);look.y+=1.25+jumpY*.18;camera.lookAt(look);
  ui.speed.textContent=String(Math.round(speed*3.6)).padStart(3,'0');ui.meter.style.width=`${Math.min(100,speed/39*100)}%`;ui.progress.style.width=`${Math.min(100,progressDistance/trackLength*100)}%`;ui.time.textContent=formatTime(elapsed);nearestTarget();
  hoops.forEach((h,i)=>h.rotation.z=Math.sin(now*.0018+i)*.12);renderer.render(scene,camera)}
requestAnimationFrame(frame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight)});
