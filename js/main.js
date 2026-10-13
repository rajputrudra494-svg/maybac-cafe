/* ==========================================================================
   Maybac — shared site script (every page)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desktop = () => window.innerWidth > 960;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const MB = (window.MB = window.MB || {});

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  }
  MB.lenis = lenis;

  const navH = () => ($("#nav") ? $("#nav").offsetHeight : 0);
  function scrollToEl(target, immediate) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (target === 0 || target === "top") {
      if (lenis) lenis.scrollTo(0, { duration: 1.6, immediate: !!immediate });
      else window.scrollTo({ top: 0, behavior: immediate || reduce ? "auto" : "smooth" });
      return;
    }
    if (!el) return;
    const offset = el.id === "signature" ? 0 : -navH() + 1;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.5, immediate: !!immediate });
    else {
      const y = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: immediate || reduce ? "auto" : "smooth" });
    }
  }
  MB.scrollTo = scrollToEl;

  /* ---------- opening hours (IST) ---------- */
  const OPEN = 11 * 60;   // 11:00
  const CLOSE = 60;       // 01:00, next day
  function istNow() {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", weekday: "long", hour12: false
      }).formatToParts(new Date());
      const get = (t) => (parts.find((p) => p.type === t) || {}).value;
      let h = parseInt(get("hour"), 10) % 24;
      return { mins: h * 60 + parseInt(get("minute"), 10), day: get("weekday") };
    } catch (e) {
      const d = new Date();
      return { mins: d.getHours() * 60 + d.getMinutes(), day: d.toLocaleDateString("en-GB", { weekday: "long" }) };
    }
  }
  function status() {
    const { mins } = istNow();
    const open = mins >= OPEN || mins < CLOSE;
    if (!open) {
      const until = OPEN - mins;
      const soon = until <= 90;
      return { open, short: soon ? `Opens in ${until} min` : "Closed now · opens 11 AM",
        long: soon ? `We open at 11 AM — that’s ${until} minutes from now.` : "We’re closed right now. Doors open again at 11 AM." };
    }
    const left = mins >= OPEN ? 24 * 60 + CLOSE - mins : CLOSE - mins;
    if (left <= 60) return { open, short: `Open · closes in ${left} min`, long: `Still open, but only for another ${left} minutes. Hurry up the stairs.` };
    return { open, short: "Open now · till 1 AM", long: "We’re open right now, and until 1 AM tonight." };
  }
  function paintStatus() {
    const s = status();
    $$("[data-status]").forEach((el) => el.classList.toggle("is-closed", !s.open));
    $$("[data-status-text]").forEach((el) => (el.textContent = s.short));
    $$("[data-status-long]").forEach((el) => (el.textContent = s.long));
    const hours = $("[data-hours]");
    if (hours && !hours.childElementCount) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const today = istNow().day;
      hours.innerHTML = days.map((d) => `<div class="${d === today ? "is-today" : ""}"><span>${d}${d === today ? " · today" : ""}</span><span>11 AM – 1 AM</span></div>`).join("");
    }
  }
  paintStatus();
  setInterval(paintStatus, 60 * 1000);

  /* ---------- canopy bulbs ---------- */
  function buildCanopies() {
    $$("[data-canopy]").forEach((c) => {
      const holder = $(".canopy__bulbs", c);
      if (!holder) return;
      const arch = parseFloat(getComputedStyle(c).getPropertyValue("--arch")) || 92;
      const n = Math.ceil(c.offsetWidth / arch) + 1;
      const wasOn = c.classList.contains("is-lit");
      holder.innerHTML = "";
      for (let i = 0; i < n; i++) {
        const b = document.createElement("i");
        b.className = "bulb" + (wasOn ? " is-on" : "");
        b.style.left = i * arch + arch / 2 + "px";
        holder.appendChild(b);
      }
    });
  }
  function lightCanopy(c, delay = 0) {
    if (!c || c.classList.contains("is-lit")) return;
    c.classList.add("is-lit");
    $$(".bulb", c).forEach((b, i) => {
      setTimeout(() => {
        b.classList.add("is-on");
        if (Math.random() < 0.25) { // a few bulbs stutter as they warm up
          setTimeout(() => b.classList.remove("is-on"), 90);
          setTimeout(() => b.classList.add("is-on"), 200);
        }
      }, delay + i * 70);
    });
  }
  buildCanopies();
  // one tired bulb every so often
  setInterval(() => {
    const lit = $$(".is-lit .bulb.is-on");
    if (!lit.length || document.hidden) return;
    const b = lit[Math.floor(Math.random() * lit.length)];
    b.classList.remove("is-on");
    setTimeout(() => b.classList.add("is-on"), 120 + Math.random() * 160);
  }, 4200);

  /* ---------- text splitting (hand-rolled, keeps <em> and <br>) ---------- */
  function splitWords(el, wrapFn) {
    const walk = (node, target) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) target.appendChild(document.createTextNode(" "));
            else target.appendChild(wrapFn(part));
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === "BR") { target.appendChild(document.createElement("br")); return; }
          const clone = n.cloneNode(false);
          target.appendChild(clone);
          walk(n, clone);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(el, frag);
    el.innerHTML = "";
    el.appendChild(frag);
  }
  $$("[data-split]").forEach((el) => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    splitWords(el, (w) => {
      const m = document.createElement("span");
      m.className = "w-mask"; m.setAttribute("aria-hidden", "true");
      const i = document.createElement("span");
      i.className = "w-in"; i.textContent = w;
      m.appendChild(i);
      return m;
    });
  });
  $$("[data-words]").forEach((el) => {
    splitWords(el, (w) => { const s = document.createElement("span"); s.className = "w"; s.textContent = w; return s; });
  });

  /* ---------- loader / curtain / intro ---------- */
  const loader = $("#loader");
  const curtain = $("#curtain");
  let loaded = false;

  function setIntroStates() {
    if (!hasGSAP || reduce) return;
    gsap.set("[data-hero-title] .line-in", { yPercent: 115 });
    gsap.set(".hero [data-fade], .phero [data-fade]", { y: 26, autoAlpha: 0 });
    gsap.set("[data-hero-arch]", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" });
    gsap.set("[data-hero-img]", { scale: 1.35 });
    gsap.set(".hero .badge, .hero .note, .arch-outline", { autoAlpha: 0 });
  }
  setIntroStates();

  function playIntro() {
    const firstCanopy = $(".hero [data-canopy], .phero [data-canopy]");
    lightCanopy(firstCanopy, reduce ? 0 : 450);
    if (!hasGSAP || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to("[data-hero-title] .line-in", { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0.1)
      .to("[data-hero-arch]", { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut" }, 0)
      .to("[data-hero-img]", { scale: page === "home" ? 1.15 : 1.1, duration: 2.2 }, 0)
      .to(".hero [data-fade], .phero [data-fade]", { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08 }, 0.5)
      .to(".arch-outline", { autoAlpha: 1, duration: 1.2 }, 0.9)
      .fromTo(".hero .badge", { scale: 0.4, rotate: -40 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.2, ease: "back.out(1.6)" }, 1.05)
      .fromTo(".hero .note", { y: 10 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.4);
  }

  function finishLoading() {
    if (loaded) return;
    loaded = true;
    try { sessionStorage.setItem("mb-seen", "1"); } catch (e) {}
    const done = () => {
      body.classList.remove("is-loading");
      if (loader) loader.style.display = "none";
      if (lenis) lenis.start();
      if (location.hash && location.hash.length > 1) {
        const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (t) setTimeout(() => scrollToEl(t, true), 60);
      }
      if (hasGSAP) ScrollTrigger.refresh();
    };
    if (!hasGSAP || reduce) {
      if (curtain) curtain.style.transform = "translateY(-100%)";
      done(); playIntro(); return;
    }
    if (root.classList.contains("seen") || !loader || getComputedStyle(loader).display === "none") {
      gsap.to(curtain, { yPercent: -100, duration: 1.05, ease: "expo.inOut", onComplete: () => gsap.set(curtain, { clearProps: "transform", yPercent: 100 }) });
      gsap.delayedCall(0.35, () => { done(); playIntro(); });
      return;
    }
    const tl = gsap.timeline();
    tl.to(".loader__inner", { y: -30, autoAlpha: 0, duration: 0.6, ease: "power3.in" })
      .to(loader, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.1")
      .add(() => { done(); playIntro(); }, "-=0.55");
  }

  // Last-ditch reveal.  finishLoading hands the curtain to GSAP, which needs
  // animation frames; if they never come (page loaded in a background tab, or
  // frames throttled to a stop) the visitor would sit behind a blank curtain.
  // gsap.set is immediate, so this shows the page without animating anything.
  function hardReveal() {
    if (!body.classList.contains("is-loading")) return;
    loaded = true;
    body.classList.remove("is-loading");
    if (loader) loader.style.display = "none";
    if (curtain) {
      if (hasGSAP) gsap.set(curtain, { clearProps: "transform", yPercent: 100 });
      else curtain.style.transform = "translateY(100%)";
    }
    if (hasGSAP && !reduce) {
      gsap.set("[data-hero-title] .line-in", { yPercent: 0 });
      gsap.set(".hero [data-fade], .phero [data-fade]", { y: 0, autoAlpha: 1 });
      gsap.set("[data-hero-arch]", { clearProps: "clipPath" });
      gsap.set("[data-hero-img]", { scale: 1 });
      gsap.set(".hero .badge, .hero .note, .arch-outline", { autoAlpha: 1 });
    }
    if (lenis) lenis.start();
    if (hasGSAP) ScrollTrigger.refresh();
  }

  function runLoader() {
    const countEl = $("#loaderCount");
    const showLoader = loader && !root.classList.contains("seen") && getComputedStyle(loader).display !== "none";
    const imgs = $$("img").filter((i) => !i.loading || i.loading !== "lazy").slice(0, 8);
    let ready = 0;
    const total = Math.max(imgs.length, 1);
    const progress = { v: 0 };
    const target = () => Math.min(100, Math.round((ready / total) * 100));
    imgs.forEach((img) => {
      if (img.complete) ready++;
      else { img.addEventListener("load", () => ready++, { once: true }); img.addEventListener("error", () => ready++, { once: true }); }
    });
    const minTime = showLoader && !reduce ? 2200 : 250;
    const start = performance.now();

    if (showLoader && hasGSAP && !reduce) {
      const draw = (sel) => $$(sel).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      draw(".loader__mark path"); draw(".loader__word path");
      gsap.timeline()
        .to(".loader__mark path", { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.1 })
        .to(".loader__mark path", { fillOpacity: 1, duration: 0.5 }, "-=0.2")
        .to(".loader__word path", { strokeDashoffset: 0, duration: 0.8, ease: "power2.out", stagger: 0.09 }, 0.4)
        .to(".loader__line", { autoAlpha: 1, y: 0, duration: 0.8 }, 1.1);
    }
    const tick = () => {
      const elapsed = performance.now() - start;
      const timeCap = Math.min(100, (elapsed / minTime) * 100);
      progress.v += (Math.min(target(), timeCap) - progress.v) * 0.12;
      if (countEl) countEl.textContent = String(Math.round(progress.v)).padStart(2, "0");
      if (progress.v > 99.4 && elapsed >= minTime) { if (countEl) countEl.textContent = "100"; finishLoading(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(finishLoading, 6500); // never trap anyone behind the loader
    setTimeout(hardReveal, 8000);  // ...and never behind the curtain either
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", runLoader);
  else runLoader();

  // back/forward cache: make sure the curtain is not left covering the page
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && curtain) {
      if (hasGSAP) gsap.set(curtain, { yPercent: 100 }); else curtain.style.transform = "translateY(100%)";
      body.classList.remove("is-loading");
      if (lenis) lenis.start();
    }
  });

  /* ---------- links: in-page smooth scroll + page curtain ---------- */
  const pageNames = { "index.html": "Home", "menu.html": "The menu", "room.html": "The room", "visit.html": "Come upstairs", "": "Home" };
  const fileOf = (u) => (u.pathname.split("/").pop() || "index.html");
  let leaving = false;

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    let url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;

    const samePage = fileOf(url) === fileOf(location) && url.search === location.search;
    if (body.classList.contains("menu-open")) closeDrawer();

    if (data_top(a)) { e.preventDefault(); scrollToEl(0); return; }
    if (samePage) {
      if (url.hash && url.hash.length > 1) {
        const t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (t) { e.preventDefault(); scrollToEl(t); history.replaceState(null, "", url.hash); }
      } else { e.preventDefault(); scrollToEl(0); }
      return;
    }
    if (!/\.html$/i.test(fileOf(url))) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    const go = () => { location.href = url.href; };
    if (!hasGSAP || reduce || !curtain) return go();
    const label = $("[data-curtain-label]");
    if (label) label.textContent = pageNames[fileOf(url)] || "";
    if (lenis) lenis.stop();
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut", onComplete: go });
    gsap.fromTo(".curtain__mark, .curtain__label", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, delay: 0.35, stagger: 0.06 });
    setTimeout(go, 1600);
  });
  function data_top(a) { return a.hasAttribute("data-top"); }

  /* ---------- nav ---------- */
  const nav = $("#nav");
  let lastY = 0;
  function onScroll(y) {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", y > 30);
    const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
    if (goingDown && y > 420 && !body.classList.contains("menu-open")) nav.classList.add("is-hidden");
    else if (goingUp || y < 200) nav.classList.remove("is-hidden");
    lastY = y;
  }
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);

  /* ---------- mobile drawer ---------- */
  const burger = $("#burger");
  const drawer = $("#drawer");
  function openDrawer() {
    body.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    if (lenis) lenis.stop();
    if (hasGSAP && !reduce) gsap.fromTo(".drawer__links a", { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.06, duration: 0.8, delay: 0.25, ease: "expo.out" });
  }
  function closeDrawer() {
    body.classList.remove("menu-open");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Open menu"); }
    if (lenis && !leaving) lenis.start();
  }
  if (burger && drawer) {
    burger.addEventListener("click", () => (body.classList.contains("menu-open") ? closeDrawer() : openDrawer()));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("menu-open")) { closeDrawer(); burger.focus(); } });
    window.addEventListener("resize", () => { if (desktop() && body.classList.contains("menu-open")) closeDrawer(); });
  }

  /* ---------- cursor ---------- */
  if (finePointer && !reduce && hasGSAP) {
    const cur = $(".cursor");
    if (cur) {
      root.classList.add("has-cursor");
      const dot = $(".cursor__dot", cur), ring = $(".cursor__ring", cur), label = $(".cursor__label", cur);
      const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
      const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
      gsap.set([dot, ring], { x: -100, y: -100 });
      window.addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
      document.addEventListener("pointerover", (e) => {
        const lab = e.target.closest("[data-cursor]");
        const hov = e.target.closest("a, button, label, summary, input, select, textarea, [data-teddy]");
        cur.classList.toggle("is-label", !!lab);
        if (lab) label.textContent = lab.dataset.cursor;
        cur.classList.toggle("is-hover", !lab && !!hov);
      });
      document.addEventListener("pointerleave", () => gsap.set([dot, ring], { x: -100, y: -100 }));
    }
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce && hasGSAP) {
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- scroll-driven animation ---------- */
  function initScrollFX() {
    if (!hasGSAP) { // no animation library: show everything as-is
      $$(".w-in").forEach((w) => (w.style.transform = "none"));
      $$("[data-words] .w").forEach((w) => (w.style.opacity = 1));
      return;
    }
    if (reduce) {
      $$("[data-words] .w").forEach((w) => (w.style.opacity = 1));
      $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
      $$("[data-canopy]").forEach((c) => lightCanopy(c));
      return;
    }

    // headings: words rise out of their masks
    $$("[data-split]").forEach((el) => {
      gsap.fromTo($$(".w-in", el), { yPercent: 110 }, {
        yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    // statements: words ink in as you read
    $$("[data-words]").forEach((el) => {
      gsap.to($$(".w", el), {
        opacity: 1, stagger: 0.12, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 }
      });
    });

    // simple fade-ups outside the hero
    $$("[data-fade]").filter((el) => !el.closest(".hero, .phero")).forEach((el) => {
      gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    // image wipes
    $$("[data-reveal]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });

    // gentle parallax on photos
    $$("[data-speed]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      if (el.matches("[data-hero-img]")) return;
      gsap.fromTo(el, { yPercent: -speed * 100 }, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // hero image drifts as you leave the hero
    $$(".hero [data-hero-img], .phero [data-hero-img]").forEach((img) => {
      gsap.to(img, { yPercent: 12, ease: "none", scrollTrigger: { trigger: img.closest("section"), start: "top top", end: "bottom top", scrub: true } });
    });

    // counters
    $$("[data-count]").forEach((el) => {
      const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => (el.textContent = o.v.toFixed(dec))
      });
    });

    // canopies light up when they come into view
    $$("[data-canopy]").forEach((c) => {
      ScrollTrigger.create({ trigger: c, start: "top 95%", once: true, onEnter: () => lightCanopy(c) });
    });

    // footer wordmark draws itself
    const fw = $("[data-footer-word]");
    if (fw) {
      const paths = $$("path", fw);
      paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.12, scrollTrigger: { trigger: fw, start: "top 95%", once: true } });
    }

    // line illustrations draw when seen (reel cards handle their own)
    $$("[data-draw]").filter((d) => !d.closest("[data-reel]")).forEach((d) => drawIn(d));
  }

  function prepDraw(svgHolder) {
    const parts = $$("path:not(.fillc), ellipse, circle, line, polyline, rect", svgHolder);
    parts.forEach((p) => {
      let L = 400;
      try { L = Math.ceil(p.getTotalLength()); } catch (e) {}
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    });
    $$(".fillc", svgHolder).forEach((f) => (f.style.opacity = 0));
    return parts;
  }
  function drawIn(holder, trigger) {
    if (!hasGSAP || reduce) return;
    const parts = prepDraw(holder);
    const st = trigger || { trigger: holder, start: "top 85%", once: true };
    gsap.timeline({ scrollTrigger: st })
      .to(parts, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.06 })
      .to($$(".fillc", holder), { opacity: 0.55, duration: 0.8 }, "-=0.8");
  }
  MB.drawIn = drawIn;

  /* ---------- marquee ---------- */
  function initMarquee() {
    const track = $("[data-marquee]");
    if (!track) return;
    const group = $(".marquee__group", track);
    // enough copies to never show a gap, then duplicate the whole set for the loop
    while (track.scrollWidth < window.innerWidth * 1.2) track.appendChild(group.cloneNode(true));
    const set = $$(".marquee__group", track);
    set.forEach((g) => track.appendChild(g.cloneNode(true)));
    if (!hasGSAP || reduce) return;
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    let dir = 1;
    const onVel = (v) => {
      if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
      const boost = 1 + Math.min(Math.abs(v) / 6, 4);
      gsap.to(loop, { timeScale: dir * boost, duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3 });
    };
    if (lenis) lenis.on("scroll", ({ velocity }) => onVel(velocity));
  }

  /* ---------- home: the Sleeping Teddy, scroll-linked on desktop ---------- */
  function initTeddyScroll() {
    const sec = $("#signature");
    if (!sec) return;
    const steps = $$(".step", sec);
    const bar = $("[data-teddy-progress]");
    const setStep = (i) => steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    MB.teddyProgress = 0;
    if (!hasGSAP || reduce) { MB.teddyScroll = false; steps.forEach((s) => s.classList.add("is-active")); return; }

    ScrollTrigger.matchMedia({
      "(min-width: 961px)": () => {
        MB.teddyScroll = true;
        const st = ScrollTrigger.create({
          trigger: sec, start: "top top", end: "+=170%", pin: true, scrub: true, anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            MB.teddyProgress = p;
            if (MB.teddy) MB.teddy.setProgress(p);
            if (bar) bar.style.transform = `scaleX(${p})`;
            setStep(p < 0.2 ? 0 : p < 0.7 ? 1 : 2);
          }
        });
        return () => { MB.teddyScroll = false; st.kill(); };
      },
      "(max-width: 960px)": () => {
        MB.teddyScroll = false;
        steps.forEach((s) => s.classList.add("is-active"));
      }
    });
  }

  /* ---------- home: specials reel ---------- */
  function initReel() {
    const pin = $("[data-reel-pin]");
    const reel = $("[data-reel]");
    if (!pin || !reel) return;
    const bar = $("[data-reel-progress]");
    const cards = $$(".card", reel);
    if (!hasGSAP || reduce) return;

    ScrollTrigger.matchMedia({
      "(min-width: 961px)": () => {
        const dist = () => Math.max(0, reel.scrollWidth - window.innerWidth);
        const tween = gsap.to(reel, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8,
            invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; }
          }
        });
        cards.forEach((c) => {
          gsap.from(c, { y: 60, rotate: 2, autoAlpha: 0.2, ease: "power2.out",
            scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 100%", end: "left 70%", scrub: true } });
          const d = $("[data-draw]", c);
          if (d) drawIn(d, { trigger: c, containerAnimation: tween, start: "left 75%", once: true });
        });
        return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(reel, { x: 0 }); };
      },
      "(max-width: 960px)": () => {
        cards.forEach((c) => {
          const d = $("[data-draw]", c);
          if (d) drawIn(d, { trigger: c, start: "top 85%", once: true });
        });
      }
    });
  }

  /* ---------- home: rotating reviews ---------- */
  function initQuotes() {
    const wrap = $("[data-quotes]");
    if (!wrap) return;
    const quotes = $$(".quote", wrap);
    const dots = $$("[data-quotes-nav] .qdot");
    let i = 0, timer = null, fill = null;
    const DUR = 6.5;
    function show(n) {
      const prev = quotes[i];
      i = (n + quotes.length) % quotes.length;
      const next = quotes[i];
      dots.forEach((d, k) => { d.classList.toggle("is-done", k < i); d.setAttribute("aria-current", k === i ? "true" : "false"); $("i", d).style.transform = k < i ? "scaleX(1)" : "scaleX(0)"; });
      if (hasGSAP && !reduce) {
        if (prev !== next) gsap.to(prev, { autoAlpha: 0, y: -20, duration: 0.6, ease: "power2.in", onComplete: () => prev.classList.remove("is-active") });
        next.classList.add("is-active");
        gsap.fromTo(next, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, delay: prev !== next ? 0.45 : 0, ease: "expo.out" });
        if (fill) fill.kill();
        fill = gsap.fromTo($("i", dots[i]), { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" });
      } else {
        quotes.forEach((q) => q.classList.toggle("is-active", q === next));
      }
      clearTimeout(timer);
      timer = setTimeout(() => show(i + 1), DUR * 1000);
    }
    dots.forEach((d, k) => d.addEventListener("click", () => show(k)));
    // only start the clock once the section is on screen
    const io = new IntersectionObserver((ents) => { if (ents[0].isIntersecting) { show(0); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(wrap);
  }

  /* ---------- room: lightbox ---------- */
  function initLightbox() {
    const shots = $$("[data-gallery] .shot");
    const lb = $("#lightbox");
    if (!shots.length || !lb) return;
    const img = $("img", lb), cap = $(".lightbox__cap", lb);
    let idx = 0, lastFocus = null;
    function show(n) {
      idx = (n + shots.length) % shots.length;
      const s = shots[idx];
      img.src = s.dataset.full;
      img.alt = ($("img", s) || {}).alt || "";
      cap.textContent = s.dataset.cap || "";
    }
    function open(n) {
      lastFocus = document.activeElement;
      show(n);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add("is-open"));
      if (lenis) lenis.stop();
      $("[data-lb-close]", lb).focus();
    }
    function close() {
      lb.classList.remove("is-open");
      setTimeout(() => (lb.hidden = true), 450);
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus();
    }
    shots.forEach((s, k) => s.addEventListener("click", () => open(k)));
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", () => show(idx - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "Tab") { // keep focus inside
        const f = $$("button", lb);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // swipe on touch screens
    let sx = null;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- visit: booking form → WhatsApp ---------- */
  function initBooking() {
    const form = $("[data-book]");
    if (!form) return;
    const WA = "918140608376";
    const date = $("#b-date", form), time = $("#b-time", form), name = $("#b-name", form);
    const out = $("[data-guests]", form), hint = $("[data-guests-hint]", form), msg = $("[data-book-msg]", form);
    let guests = 2;

    // today's date in IST, as yyyy-mm-dd
    const istDate = (offsetDays = 0) => {
      const d = new Date(Date.now() + offsetDays * 864e5);
      return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    };
    date.min = istDate(0);
    date.max = istDate(90);
    date.value = istDate(0);

    // slots every 30 minutes from 11:00 to 00:30 (last seating before we close at 1)
    const slots = [];
    for (let m = 11 * 60; m <= 24 * 60 + 30; m += 30) slots.push(m);
    const label = (m) => {
      const h = Math.floor(m / 60) % 24, mm = m % 60;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    };
    function fillTimes() {
      const isToday = date.value === istDate(0);
      const now = istNow().mins;
      const prev = time.value;
      time.innerHTML = "";
      slots.forEach((m) => {
        // after midnight, "today" still means tonight's service
        const past = isToday && now >= 11 * 60 && m < now + 30;
        if (past) return;
        const o = document.createElement("option");
        o.value = label(m); o.textContent = label(m);
        time.appendChild(o);
      });
      if (!time.options.length) {
        const o = document.createElement("option");
        o.value = ""; o.textContent = "Fully past for today — pick tomorrow";
        time.appendChild(o);
      }
      if ([...time.options].some((o) => o.value === prev)) time.value = prev;
      else {
        const eight = [...time.options].find((o) => o.value === "8:00 PM");
        if (eight) time.value = "8:00 PM";
      }
    }
    fillTimes();
    date.addEventListener("change", fillTimes);

    const hints = { 1: "a solo treat", 2: "table for two", 4: "the usual gang" };
    function setGuests(n) {
      guests = Math.max(1, Math.min(30, n));
      out.textContent = guests;
      hint.textContent = guests >= 10 ? "big group — we’ll call you back" : hints[guests] || "";
    }
    setGuests(2);
    $$("[data-step-btn]", form).forEach((b) => b.addEventListener("click", () => setGuests(guests + parseInt(b.dataset.stepBtn, 10))));

    const fieldOf = (el) => el.closest(".field");
    function check() {
      let ok = true;
      [[name, name.value.trim().length >= 2], [date, !!date.value && date.value >= date.min], [time, !!time.value]].forEach(([el, good]) => {
        fieldOf(el).classList.toggle("is-invalid", !good);
        el.setAttribute("aria-invalid", good ? "false" : "true");
        if (!good) ok = false;
      });
      return ok;
    }
    [name, date, time].forEach((el) => el.addEventListener("input", () => fieldOf(el).classList.remove("is-invalid")));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!check()) { msg.textContent = "Just need your name, a date and a time."; const bad = $(".is-invalid input, .is-invalid select", form); if (bad) bad.focus(); return; }
      const occasion = (form.querySelector('input[name="occasion"]:checked') || {}).value || "";
      const pretty = new Date(date.value + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      const note = $("#b-note", form).value.trim();
      const lines = [
        "Hi Maybac! I’d like to book a table.",
        "",
        `Name: ${name.value.trim()}`,
        `When: ${pretty}, ${time.value}`,
        `Guests: ${guests}`,
        occasion && occasion !== "Just because" ? `Occasion: ${occasion}` : "",
        note ? `Note: ${note}` : ""
      ].filter((l, k, arr) => l !== "" || (k > 0 && arr[k - 1] !== ""));
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n").trim())}`;
      const w = window.open(url, "_blank", "noopener");
      msg.innerHTML = w ? "WhatsApp is open — just hit send. See you soon!" : `Pop-up blocked? <a class="link-u" href="${url}" target="_blank" rel="noopener">Open WhatsApp here</a>.`;
    });
  }

  /* ---------- small things ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- boot ---------- */
  initMarquee();
  initTeddyScroll();
  initReel();
  initScrollFX();
  initQuotes();
  initLightbox();
  initBooking();

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { buildCanopies(); if (hasGSAP) ScrollTrigger.refresh(); }, 200);
  });
  window.addEventListener("load", () => { if (hasGSAP) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (hasGSAP) ScrollTrigger.refresh(); });
})();
