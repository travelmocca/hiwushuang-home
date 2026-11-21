import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createModel, cycleSeconds } from "./tokyo/model.js";

export function mountTokyoHero(stage, motionPreference) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#f1f1fb", "#ddc4ac", 1.55));
  const sun = new THREE.DirectionalLight("#fff1e0", 3.1);
  sun.position.set(-4, 12, 9);
  sun.target.position.set(0, 3, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, bottom: -9, top: 10, near: 1, far: 35 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.00026;
  sun.shadow.normalBias = 0.015;
  const fill = new THREE.DirectionalLight("#d2e2ec", 0.67);
  fill.position.set(7, 7, -6);
  scene.add(sun, sun.target, fill);

  const district = createModel();
  scene.add(district.root);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.18, 150);
  const target = new THREE.Vector3(-0.04, 4.33, 0.22);
  camera.position.copy(target).add(new THREE.Vector3(0.52476, 0.13917, 0.8398));
  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "东京微缩街景。拖动或按左右方向键可旋转模型。");
  canvas.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight");
  stage.append(canvas);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI * 0.49;
  canvas.style.touchAction = "pan-y pinch-zoom";
  canvas.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const angle = event.key === "ArrowLeft" ? -Math.PI / 12 : Math.PI / 12;
    camera.position.sub(target).applyAxisAngle(camera.up, angle).add(target);
    controls.update();
  });

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    const distance = Math.max(23.1, 18.75 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    camera.position.sub(target).setLength(distance).add(target);
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize(width, height, false);
  }
  resize();
  new ResizeObserver(resize).observe(stage);

  let seconds = cycleSeconds / 2;
  let previousTime = null;
  let inView = true;
  let contextAvailable = true;

  function render(time) {
    if (previousTime !== null) seconds += Math.max(0, time - previousTime) / 1000;
    previousTime = time;
    district.update(seconds);
    controls.update();
    renderer.render(scene, camera);
    if (!stage.classList.contains("is-live")) {
      canvas.tabIndex = 0;
      stage.classList.add("is-live");
    }
  }

  function syncPlayback() {
    const interactive = contextAvailable && !motionPreference.matches;
    controls.enabled = interactive;
    if (!interactive) {
      stage.classList.remove("is-live");
      canvas.tabIndex = -1;
    }
    previousTime = null;
    renderer.setAnimationLoop(interactive && inView && !document.hidden ? render : null);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }).observe(stage);
  }
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextAvailable = false;
    syncPlayback();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    contextAvailable = true;
    syncPlayback();
  });
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", syncPlayback);
  syncPlayback();
}
