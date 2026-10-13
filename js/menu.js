/* ==========================================================================
   Maybac — menu page: tabs, search, Jain + signature filters
   ========================================================================== */
(() => {
  "use strict";
  const data = window.MAYBAC_MENU;
  const panel = document.querySelector("[data-menu-panel]");
  if (!data || !panel) return;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const tabs = $$(".tab");
  const pill = $(".tabs__pill");
  const search = $("[data-search]");
  const jain = $("[data-jain]");
  const sig = $("[data-sig]");
  const note = $("[data-menu-note]");
  const empty = $("[data-menu-empty]");
  const jump = $("[data-menu-jump]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const keys = Object.keys(data);

  let current = keys.includes(location.hash.slice(1)) ? location.hash.slice(1) : "kitchen";

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  function highlight(text, q) {
    if (!q) return esc(text);
    const t = norm(text), i = t.indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  function itemHTML(it, q) {
    const marks = (it.j ? '<i class="jbadge" title="Available in Jain" aria-label="Available in Jain">J</i>' : "") +
      (it.sig ? '<svg class="sigmark" role="img" aria-label="Maybac signature"><use href="#mark"/></svg>' : "");
    return `<div class="mitem">
      <div class="mitem__row">
        <span class="mitem__name">${highlight(it.n, q)}${marks}</span>
        <span class="mitem__dots" aria-hidden="true"></span>
        <span class="mitem__price"><span class="sr-only">₹</span>${it.p}</span>
      </div>
      ${it.d ? `<p class="mitem__desc">${highlight(it.d, q)}</p>` : ""}
    </div>`;
  }

  function render(animate) {
    const q = norm((search.value || "").trim());
    const onlyJ = jain.checked, onlySig = sig.checked;
    // a search looks across the whole menu, not just the open tab
    const scopes = q ? keys : [current];
    let html = "", count = 0;
    const jumps = [];
    scopes.forEach((k) => {
      data[k].sections.forEach((sec) => {
        const items = sec.items.filter((it) => {
          if (onlyJ && !it.j) return false;
          if (onlySig && !it.sig) return false;
          if (!q) return true;
          return norm(it.n).includes(q) || norm(it.d || "").includes(q) || norm(sec.title).includes(q);
        });
        if (!items.length) return;
        count += items.length;
        const id = "m-" + slug(k + " " + sec.title);
        jumps.push(`<a href="#${id}" data-jump="${id}">${esc(sec.title)}</a>`);
        html += `<section class="msec${sec.special ? " msec--special" : ""}" id="${id}" aria-label="${esc(sec.title)}">
          ${q ? `<div class="msec__kicker">${esc(data[k].label)}</div>` : sec.kicker ? `<div class="msec__kicker">${esc(sec.kicker)}</div>` : ""}
          <h3>${sec.special ? '<svg class="sigmark" style="width:20px;height:20px" aria-hidden="true"><use href="#mark"/></svg>' : ""}${esc(sec.title)}<span class="msec__count">${items.length}</span></h3>
          ${items.map((it) => itemHTML(it, q)).join("")}
          ${sec.foot && !q ? `<p class="msec__foot">${esc(sec.foot)}</p>` : ""}
        </section>`;
      });
    });
    panel.innerHTML = html;
    empty.classList.toggle("is-on", count === 0);
    note.textContent = q ? `${count} ${count === 1 ? "match" : "matches"} across the whole menu` : data[current].note;
    jump.innerHTML = q ? "" : jumps.join("");
    if (animate && hasGSAP && !reduce) {
      gsap.fromTo($$(".msec", panel), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: "power3.out" });
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function movePill() {
    const t = tabs.find((x) => x.dataset.tab === current);
    if (!t || !pill) return;
    pill.style.width = t.offsetWidth + "px";
    pill.style.transform = `translateX(${t.offsetLeft}px)`;
    pill.style.opacity = search.value.trim() ? 0.35 : 1;
  }

  function select(key, focus) {
    if (!data[key]) return;
    current = key;
    tabs.forEach((t) => {
      const on = t.dataset.tab === key;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panel.setAttribute("aria-labelledby", "tab-" + key);
    if (search.value) search.value = "";
    history.replaceState(null, "", "#" + key);
    movePill();
    render(true);
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      select(t.dataset.tab);
      const top = $("#menu");
      if (top && top.getBoundingClientRect().top < -40 && window.MB && MB.scrollTo) MB.scrollTo(top);
    });
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const n = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[n].dataset.tab, true);
    });
  });

  let st;
  search.addEventListener("input", () => { clearTimeout(st); st = setTimeout(() => { movePill(); render(false); }, 120); });
  search.addEventListener("keydown", (e) => { if (e.key === "Escape") { search.value = ""; movePill(); render(true); } });
  jain.addEventListener("change", () => render(true));
  sig.addEventListener("change", () => render(true));

  jump.addEventListener("click", (e) => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el && window.MB && MB.scrollTo) MB.scrollTo(el); else if (el) el.scrollIntoView({ behavior: "smooth" });
  });

  window.addEventListener("hashchange", () => { const k = location.hash.slice(1); if (data[k] && k !== current) select(k); });
  window.addEventListener("resize", movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  select(current);
})();
