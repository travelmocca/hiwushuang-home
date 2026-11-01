(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.documentElement.classList.add("reduce-motion");
    return;
  }

  document.documentElement.classList.add("motion-ok");

  var parallaxLayers = document.querySelectorAll("[data-parallax]");
  var ticking = false;

  function updateParallax() {
    var y = window.scrollY;
    parallaxLayers.forEach(function (layer) {
      var rate = parseFloat(layer.getAttribute("data-parallax") || "0.2");
      layer.style.setProperty("--scroll-y", y * rate + "px");
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateParallax();

  var revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

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
})();
