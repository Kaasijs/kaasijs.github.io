// kaasijs.github.io — shared behaviour
// Everything here checks prefers-reduced-motion before animating anything.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFine = window.matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     Reveal-on-scroll: any [data-reveal] element fades/slides
     in once, staggered by its position within its parent.
  --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var siblingIndex = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      var count = siblingIndex.get(parent) || 0;
      el.style.transitionDelay = (count * 90) + "ms";
      siblingIndex.set(parent, count + 1);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     Typed terminal line on the homepage hero.
  --------------------------------------------------------- */
  function initTypedLine() {
    var el = document.getElementById("typed");
    if (!el) return;

    var lines = [
      "building: Devils Resort",
      "status: probably drawing something",
      "mood: chaotic good"
    ];

    if (reduceMotion) {
      el.textContent = lines[0];
      return;
    }

    var lineIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var current = lines[lineIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
        setTimeout(tick, 38);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 18);
      }
    }

    tick();
  }

  /* ---------------------------------------------------------
     Hero art parallax: the background image and the ambient
     paws drift opposite the cursor, at different depths.
  --------------------------------------------------------- */
  function initParallax() {
    var hero = document.getElementById("hero");
    var bg = document.querySelector(".hero-bg");
    if (!hero || !bg) return;
    if (reduceMotion || !pointerFine) return;

    var paws = hero.querySelectorAll(".paw-ambient img");

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;

      bg.style.transform =
        "scale(1.08) translate(" + (relX * -18) + "px, " + (relY * -18) + "px)";

      paws.forEach(function (paw, i) {
        var depth = 10 + (i % 3) * 6;
        paw.style.transform =
          "translate(" + (relX * depth) + "px, " + (relY * depth) + "px)";
      });
    });

    hero.addEventListener("mouseleave", function () {
      bg.style.transform = "scale(1.08) translate(0,0)";
      paws.forEach(function (paw) { paw.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------------------------------------------------------
     A little paw that follows the cursor while inside the hero.
  --------------------------------------------------------- */
  function initCursorPaw() {
    var hero = document.getElementById("hero");
    if (!hero || reduceMotion || !pointerFine) return;

    var paw = document.createElement("img");
    paw.src = "assets/paw-heart.png";
    paw.alt = "";
    paw.className = "cursor-paw";
    hero.appendChild(paw);

    var targetX = 0, targetY = 0, currentX = 0, currentY = 0, active = false;

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!active) { active = true; paw.style.opacity = "0.85"; }
    });

    hero.addEventListener("mouseleave", function () {
      active = false;
      paw.style.opacity = "0";
    });

    function raf() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      paw.style.left = currentX + "px";
      paw.style.top = currentY + "px";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ---------------------------------------------------------
     Confetti burst when the logo is clicked. Purely for delight.
  --------------------------------------------------------- */
  function initConfetti() {
    var btn = document.getElementById("logoBtn");
    if (!btn) return;

    var colors = ["#5BCEFA", "#F5A9B8", "#F2B84B", "#FFFFFF"];

    btn.addEventListener("click", function () {
      var rect = btn.getBoundingClientRect();
      var originX = rect.left + rect.width / 2;
      var originY = rect.top + rect.height / 2;

      var count = reduceMotion ? 0 : 18;

      for (var i = 0; i < count; i++) {
        var piece = document.createElement("span");
        piece.className = "confetti-piece";
        var angle = Math.random() * Math.PI * 2;
        var distance = 90 + Math.random() * 110;
        var tx = Math.cos(angle) * distance;
        var ty = Math.sin(angle) * distance - 40;

        piece.style.left = originX + "px";
        piece.style.top = originY + "px";
        piece.style.background = colors[i % colors.length];
        piece.style.setProperty("--tx", tx + "px");
        piece.style.setProperty("--ty", ty + "px");
        piece.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
        piece.style.setProperty("--dur", (700 + Math.random() * 500) + "ms");
        piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "4px";

        document.body.appendChild(piece);
        piece.addEventListener("animationend", function () { this.remove(); });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initTypedLine();
    initParallax();
    initCursorPaw();
    initConfetti();
  });
})();