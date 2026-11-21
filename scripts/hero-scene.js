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

  var stage = document.getElementById("tokyo-stage");
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!stage || !window.WebGL2RenderingContext) return;

  function loadScene() {
    if (motion.matches) return;
    motion.removeEventListener("change", loadScene);
    import("./tokyo-hero.js")
      .then(function (module) { module.mountTokyoHero(stage, motion); })
      .catch(function (error) { console.warn("东京街景使用静态预览。", error); });
  }

  motion.addEventListener("change", loadScene);
  loadScene();
})();
