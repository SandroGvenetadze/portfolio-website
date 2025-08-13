/* Particles (tiny canvas background) */
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
      r: 1.2 + Math.random() * 1.8,
      vx: -0.4 + Math.random() * 0.8,
      vy: -0.4 + Math.random() * 0.8,
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(91,124,250,0.6)";
    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener("resize", resize);
  resize();
  tick();
})();

/* Reveal on view */
(() => {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  items.forEach((el) => io.observe(el));
  addEventListener("load", () =>
    setTimeout(() => items[0] && items[0].classList.add("in"), 60)
  );
})();

/* Theme toggle (localStorage) */
(() => {
  const root = document.documentElement;
  const KEY = "theme";
  const stored = localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark")
    root.setAttribute("data-theme", stored);
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  });
})();

/* Slider (basic) */
(() => {
  const track = document.getElementById("track");
  const dotsWrap = document.getElementById("dots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", () => {
      const x = slides[i].offsetLeft;
      track.scrollTo({ left: x, behavior: "smooth" });
      dotsWrap
        .querySelectorAll(".dot")
        .forEach((d, j) =>
          d.setAttribute("aria-selected", j === i ? "true" : "false")
        );
    });
    dotsWrap.appendChild(b);
  });
})();

/* Magnetic button hover */
(() => {
  const b = document.querySelector(".magnet");
  if (!b) return;
  b.addEventListener("mousemove", (e) => {
    const r = b.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 20;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 20;
    b.style.transform = `translate(${x}px, ${y}px)`;
  });
  ["mouseleave", "blur"].forEach((ev) =>
    b.addEventListener(ev, () => (b.style.transform = ""))
  );
})();

/* Footer year + Contact form feedback */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message sent! I’ll reply shortly.");
    form.reset();
  });
})();

/* Skills → add inline SVG icons for known labels (non-destructive). */
(() => {
  const ICONS = {
    HTML5: `<svg viewBox="0 0 128 128" aria-hidden="true"><path d="M19 3l9 101 36 10 36-10 9-101H19z" fill="#E44D26"/><path d="M64 113l29-8 8-88H64v96z" fill="#F16529"/><path d="M64 52H49l-1-11h16V30H36l4 45h24V52z" fill="#EBEBEB"/><path d="M64 75H51l2 22 11 3V75z" fill="#EBEBEB"/><path d="M64 52v11h14l-1 12H64v11h13l-1 11-12 3v12l29-8 4-45H64z" fill="#fff"/></svg>`,
    CSS3: `<svg viewBox="0 0 128 128" aria-hidden="true"><path fill="#1572B6" d="M19 3l9 101 36 10 36-10 9-101z"/><path fill="#33A9DC" d="M64 113l29-8 8-88H64z"/><path fill="#fff" d="M64 52H49l-1-11h16V30H36l4 45h24z"/><path fill="#EBEBEB" d="M64 75H51l2 22 11 3z"/><path fill="#fff" d="M64 52v11h14l-1 12H64v11h13l-1 11-12 3z"/></svg>`,
    JavaScript: `<svg viewBox="0 0 128 128" aria-hidden="true"><path fill="#F7DF1E" d="M2 2h124v124H2z"/></svg>`,
    TypeScript: `<svg viewBox="0 0 128 128" aria-hidden="true"><rect width="128" height="128" fill="#3178c6"/><path fill="#fff" d="M27 55h35v10H50v39H37V65H27zM66 104l7-9c4 4 9 6 14 6 4 0 6-2 6-4 0-3-3-4-8-6l-5-2c-7-2-13-6-13-15 0-10 8-17 21-17 9 0 16 3 21 8l-7 9c-4-4-8-6-13-6-4 0-6 2-6 4 0 3 3 4 8 6l5 2c8 2 13 6 13 15 0 10-8 17-22 17-10 0-18-3-25-8z"/></svg>`,
    React: `<svg viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="8" fill="#61dafb"/><g fill="none" stroke="#61dafb" stroke-width="6"><ellipse rx="52" ry="20" cx="64" cy="64"/><ellipse rx="52" ry="20" cx="64" cy="64" transform="rotate(60 64 64)"/><ellipse rx="52" ry="20" cx="64" cy="64" transform="rotate(120 64 64)"/></g></svg>`,
    "Next.js": `<svg viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="56" fill="#111"/><path d="M83 92L54 46v46H45V36h9l29 44V36h9v56z" fill="#fff"/></svg>`,
    Node: `<svg viewBox="0 0 128 128" aria-hidden="true"><path d="M63.6 6l51.4 29.7v56.6L63.6 122 12.2 92.3V35.7L63.6 6z" fill="#83CD29"/></svg>`,
    Git: `<svg viewBox="0 0 128 128" aria-hidden="true"><path fill="#F34F29" d="M124 58L70 4a12 12 0 0 0-17 0L4 53a12 12 0 0 0 0 17l54 54a12 12 0 0 0 17 0l49-49a12 12 0 0 0 0-17z"/></svg>`,
    GitHub: `<svg viewBox="0 0 128 128" aria-hidden="true"><path fill="#181717" d="M64 8a56 56 0 0 0-18 109v-10c-18 4-22-8-22-8-3-7-7-9-7-9-6-4 0-4 0-4 7 1 10 7 10 7 6 10 15 7 19 5 1-4 3-7 5-8-14-2-29-7-29-31 0-7 2-12 6-17-1-2-3-8 1-16 0 0 6-2 18 7a62 62 0 0 1 32 0c12-9 18-7 18-7 4 8 2 14 1 16 4 5 6 10 6 17 0 24-15 29-29 31 3 3 6 8 6 16v12A56 56 0 0 0 64 8z"/></svg>`,
    Tailwind: `<svg viewBox="0 0 128 128" aria-hidden="true"><path d="M64 28c-16 0-26 8-30 24 6-8 13-11 22-9 5 1 9 5 13 9 6 6 13 9 22 9 16 0 26-8 30-24-6 8-13 11-22 9-5-1-9-5-13-9-6-6-13-9-22-9zm-30 48c6-8 13-11 22-9 5 1 9 5 13 9 6 6 13 9 22 9 16 0 26-8 30-24-6 8-13 11-22 9-5-1-9-5-13-9-6-6-13-9-22-9-16 0-26 8-30 24z" fill="#38B2AC"/></svg>`,
    Vite: `<svg viewBox="0 0 128 128" aria-hidden="true"><path d="M9 20l55-12 55 12-55 88z" fill="#646cff"/><path d="M64 108L9 20l55 20 55-20z" fill="#ffd62e"/></svg>`,
    Figma: `<svg viewBox="0 0 128 128" aria-hidden="true"><circle cx="44" cy="32" r="20" fill="#f24e1e"/><circle cx="84" cy="32" r="20" fill="#ff7262"/><circle cx="44" cy="64" r="20" fill="#a259ff"/><circle cx="84" cy="64" r="20" fill="#1abcfe"/><rect x="44" y="44" width="40" height="40" rx="20" fill="#0acf83"/></svg>`,
  };
  const container = document.querySelector(".skills");
  if (!container) return;
  container.querySelectorAll(".skill").forEach((el) => {
    const label = el.textContent.trim();
    if (ICONS[label]) {
      el.innerHTML = ICONS[label] + `<span>${label}</span>`;
    }
  });
})();
