/* Particles */
(() => {
  const c = document.querySelector(".particles");
  if (!c) return;
  const ctx = c.getContext("2d", { alpha: true });
  let w, h, dpr, pts;

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = c.clientWidth;
    h = c.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(96, 165, 250, .22)";
    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  resize();
  addEventListener("resize", resize);
  tick();
})();

/* Slider */
(() => {
  const track = document.getElementById("track");
  const dotsWrap = document.getElementById("dots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0,
    paused = false,
    x0 = null,
    locked = false;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot";
    b.type = "button";
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(b);
  });

  function updateDots() {
    dotsWrap
      .querySelectorAll(".dot")
      .forEach((d, i) =>
        d.setAttribute("aria-current", i === index ? "true" : "false")
      );
  }

  function go(i, user) {
    index = (i + slides.length) % slides.length;
    const w = slides[0].getBoundingClientRect().width + 16;
    track.style.transform = `translateX(${-index * w}px)`;
    track.style.transition = user
      ? "transform .45s ease"
      : "transform .6s ease";
    updateDots();
  }

  function next() {
    if (!paused) go(index + 1);
  }
  let timer = setInterval(next, 4000);

  function pause(p) {
    paused = p;
    clearInterval(timer);
    if (!p) timer = setInterval(next, 4000);
  }
  track.addEventListener("mouseenter", () => pause(true));
  track.addEventListener("mouseleave", () => pause(false));
  document.addEventListener("visibilitychange", () => pause(document.hidden));

  track.addEventListener(
    "touchstart",
    (e) => {
      x0 = e.touches[0].clientX;
      locked = true;
      pause(true);
    },
    { passive: true }
  );
  track.addEventListener(
    "touchmove",
    (e) => {
      if (!locked) return;
      const dx = e.touches[0].clientX - x0;
      if (Math.abs(dx) < 30) return;
      if (dx > 0) go(index - 1, true);
      else go(index + 1, true);
      locked = false;
      pause(false);
    },
    { passive: true }
  );

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(index + 1, true);
    if (e.key === "ArrowLeft") go(index - 1, true);
  });

  updateDots();
  go(0, true);
})();
