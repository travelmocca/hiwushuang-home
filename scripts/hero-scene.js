(function () {
  // Year footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Motion preference
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.documentElement.classList.add("reduce-motion");
  } else {
    document.documentElement.classList.add("motion-ok");
  }

  // Nav surface detection
  var nav = document.getElementById("site-nav");
  var hero = document.querySelector(".hero");

  function updateNavSurface() {
    if (!nav || !hero) return;
    var heroBottom = hero.offsetTop + hero.offsetHeight - nav.offsetHeight;
    var onSurface = window.scrollY > heroBottom - 8;
    nav.classList.toggle("site-nav--on-surface", onSurface);
  }

  window.addEventListener("scroll", updateNavSurface, { passive: true });
  window.addEventListener("resize", updateNavSurface, { passive: true });
  updateNavSurface();

  // Reveal animations
  if (!reduced) {
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  // Three.js scene setup
  if (reduced || !window.WebGLRenderingContext) {
    // Fallback for reduced motion or no WebGL
    document.documentElement.classList.add("no-webgl");
    return;
  }

  var container = document.getElementById("hero-canvas-container");
  if (!container) return;

  // Dynamic import for Three.js
  var script = document.createElement("script");
  script.type = "module";
  script.textContent = `
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { Sky } from 'three/addons/objects/Sky.js';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

    let mixer, renderer, scene, camera, controls, animationId;
    let isVisible = true;

    const timer = new THREE.Clock();
    const container = document.getElementById('hero-canvas-container');

    // Renderer setup with quality limits
    renderer = new THREE.WebGLRenderer({ 
      antialias: window.devicePixelRatio <= 1.5,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    // Sky setup
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = 0;
    uniforms['rayleigh'].value = 3;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.7;
    uniforms['sunPosition'].value.set(-0.8, 0.19, 0.56);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = pmremGenerator.fromScene(sky).texture;
    scene.environment = environment;

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      100
    );
    camera.position.set(4, 2.5, 7);

    // Controls setup with responsive target
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    function updateControlsTarget() {
      if (window.innerWidth < 768) {
        controls.target.set(0, 0.5, 0);
      } else if (window.innerWidth < 1024) {
        controls.target.set(2, 0.7, -0.5);
      } else {
        controls.target.set(2.5, 0.7, -1);
      }
      controls.update();
    }
    
    updateControlsTarget();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Model loading with Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/public/draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/public/models/LittlestTokyo.glb',
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        
        // Responsive model positioning
        function updateModelPosition() {
          if (window.innerWidth < 768) {
            // Mobile: center-bottom positioning
            model.position.set(0, 0.5, 0);
          } else if (window.innerWidth < 1024) {
            // Tablet: slightly right
            model.position.set(2, 1, -0.5);
          } else {
            // Desktop: far right
            model.position.set(4.5, 1, -1.5);
          }
        }
        
        updateModelPosition();
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();

        // Update position on window resize
        const resizeHandler = function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          updateModelPosition();
        };
        
        window.removeEventListener('resize', window.__heroResizeHandler);
        window.__heroResizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler, { passive: true });

        animate();
      },
      function (xhr) {
        // Progress callback
        var progress = (xhr.loaded / xhr.total) * 100;
        if (progress >= 100) {
          container.classList.add('loaded');
        }
      },
      function (error) {
        console.error('Error loading 3D model:', error);
        container.classList.add('error');
      }
    );

    // Initial resize handler for camera/renderer (model-specific handler added after load)
    window.addEventListener('resize', function () {
      updateControlsTarget();
    }, { passive: true });

    // Visibility API for performance
    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
      if (!isVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        timer.stop();
      } else if (isVisible && !animationId) {
        timer.start();
        animate();
      }
    });

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = timer.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.traverse(function (obj) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }
    });
  `;

  document.head.appendChild(script);
})();
