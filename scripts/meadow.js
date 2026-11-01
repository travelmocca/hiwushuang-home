(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.documentElement.classList.add("reduce-motion");
  } else {
    document.documentElement.classList.add("motion-ok");
  }

  var video = document.querySelector(".hero__video");
  if (video) {
    if (reduced) {
      video.pause();
      video.removeAttribute("autoplay");
    } else {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          /* autoplay blocked — poster remains visible */
        });
      }
    }
  }

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

  if (reduced) {
    return;
  }

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
