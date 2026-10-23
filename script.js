// Renders the content defined in projects.js in the chosen language (see i18n.js).
// You normally don't need to edit this file.

const $ = (sel) => document.querySelector(sel);

// Escape text before inserting into HTML
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Only allow http(s), mailto and relative links
const safeUrl = (u = "") => (/^(https?:|mailto:)/i.test(u) || !/^[a-z][\w+.-]*:/i.test(u) ? u : "#");
const safeColor = (c = "") => (/^#[0-9a-f]{3,8}$/i.test(c) ? c : "#6366f1");
const initials = (t = "") => t.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

const ICON = {
  ext: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`,
  code: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
};

/* ---------- Language ---------- */
// Fixed texts in index.html carry data-i18n (text) or data-i18n-aria (aria-label)
function applyStaticTexts() {
  const html = document.documentElement;
  html.lang = LANG;
  html.dir = LANG === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
}

function renderLangSwitch() {
  $("#lang-switch").innerHTML = LANGUAGES.map((l) =>
    `<button type="button" lang="${l.code}" aria-pressed="${l.code === LANG}" title="${esc(l.name)}" data-lang="${l.code}">${esc(l.label)}</button>`
  ).join("");
}

function setLanguage(code) {
  if (code === LANG) return;
  LANG = code;
  try { localStorage.setItem("portfolio-lang", code); } catch (e) {}
  renderAll();
}

/* ---------- Profile ---------- */
function renderProfile() {
  const p = PROFILE;
  document.title = `${p.name} — ${tx(p.role)}`;
  // *text* in the headline gets the gradient highlight
  $("#headline").innerHTML = esc(tx(p.headline)).replace(/\*(.+?)\*/g, '<span class="grad">$1</span>');
  $("#tagline").textContent = tx(p.tagline);
  if (p.status) $("#status-text").textContent = tx(p.status);
  else $("#status")?.remove();

  $("#brand-mark").textContent = initials(p.name);
  $("#brand-name").textContent = p.name;
  $("#footer-name").textContent = p.name;
  $("#about-name").textContent = p.name;
  $("#about-role").textContent = tx(p.role);
  $("#avatar").innerHTML = p.avatar ? `<img src="${esc(safeUrl(p.avatar))}" alt="${esc(p.name)}" />` : esc(initials(p.name));
  $("#about-text").innerHTML = [].concat(tx(p.about)).map((s) => `<p>${esc(s)}</p>`).join("");
  $("#facts").innerHTML = (p.facts || []).map((f) => `<div><dt>${esc(tx(f.label))}</dt><dd>${esc(tx(f.value))}</dd></div>`).join("");

  $("#email-link").href = `mailto:${p.email}`;
  // Hide the CV button until a resume file is set
  if (p.resume) $("#cv-btn").href = p.resume;
  else $("#cv-btn")?.remove();
  $("#copy-label").textContent = p.email;
  $("#year").textContent = new Date().getFullYear();
  $("#socials").innerHTML = p.socials
    .map((s) => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(tx(s.label))} ${ICON.ext}</a></li>`)
    .join("");
}

/* ---------- Project visuals ---------- */
// Demo video of the project inside a browser frame. It plays muted on a loop,
// except for visitors who ask for reduced motion (they get play controls instead).
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function videoVisual(p, { controls = false } = {}) {
  const autoplay = !reduceMotion;
  return `
    <div class="visual video" style="--c:${safeColor(p.color)}">
      <div class="browser" dir="ltr">
        <div class="browser-bar"><i></i><i></i><i></i>${p.url ? `<span>${esc(p.url)}</span>` : ""}
          <em class="live-badge" lang="${LANG}" dir="auto"><b></b>${esc(t("demo_video"))}</em>
        </div>
        <video src="${esc(safeUrl(p.video))}" ${p.poster ? `poster="${esc(safeUrl(p.poster))}"` : ""}
          ${autoplay ? "autoplay" : ""} muted loop playsinline preload="${autoplay ? "auto" : "metadata"}"
          ${controls || !autoplay ? "controls" : ""} aria-label="${esc(t("demo_title", { name: tx(p.title) }))}"></video>
      </div>
    </div>`;
}

// Screenshot (or a generated app mockup) inside a browser frame
function visual(p, opts) {
  if (p.video) return videoVisual(p, opts);
  const inner = p.image
    ? `<img src="${esc(safeUrl(p.image))}" alt="${esc(t("screenshot", { name: tx(p.title) }))}" loading="lazy" />`
    : `<div class="mock" aria-hidden="true">
         <div class="mock-side"><b></b><b></b><b></b><b></b><b></b></div>
         <div class="mock-main">
           <div class="mock-head"><b></b><b></b></div>
           <div class="mock-hero">${esc(tx(p.title))}</div>
           <div class="mock-cards"><b></b><b></b><b></b></div>
         </div>
       </div>`;
  return `
    <div class="visual" style="--c:${safeColor(p.color)}">
      <div class="browser" dir="ltr">
        <div class="browser-bar"><i></i><i></i><i></i>${p.url ? `<span>${esc(p.url)}</span>` : ""}</div>
        ${inner}
      </div>
    </div>`;
}

const tagList = (tags = []) => `<ul class="tags">${tags.map((tag) => `<li>${esc(tx(tag))}</li>`).join("")}</ul>`;

// Extra links on a project, e.g. { label: { en, fr, ar }, url }
const extraLinks = (p, cls) => (p.links || [])
  .map((l) => `<a class="${cls}" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${ICON.grid} ${esc(tx(l.label))}</a>`)
  .join("");

function projectLinks(p) {
  return [
    p.demo && `<a class="link" href="${esc(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">${esc(t("live_site"))} ${ICON.ext}</a>`,
    extraLinks(p, "link"),
    p.github && `<a class="link link-muted" href="${esc(safeUrl(p.github))}" target="_blank" rel="noopener noreferrer">${ICON.code} ${esc(t("source"))}</a>`,
  ].filter(Boolean).join("");
}

/* ---------- Featured projects ---------- */
function renderFeatured() {
  const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.featured);
  $("#featured").innerHTML = list.map(({ p, i }, n) => `
    <article class="feature reveal${n % 2 ? " flip" : ""}" data-index="${i}" tabindex="0" role="button" aria-label="${esc(t("view_details", { name: tx(p.title) }))}">
      <div class="feature-text">
        <div class="feature-meta"><span class="cat">${esc(tx(p.category))}</span><span>${esc(p.year || "")}</span></div>
        <h3>${esc(tx(p.title))}</h3>
        <p>${esc(tx(p.summary))}</p>
        ${tagList(p.tags)}
        <div class="feature-links">${projectLinks(p)}<span class="link link-muted">${esc(t("details"))}</span></div>
      </div>
      ${visual(p)}
    </article>`).join("");
}

/* ---------- More projects ---------- */
const others = () => PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => !p.featured);
let currentFilter = "";

function renderGrid() {
  const list = others().filter(({ p }) => !currentFilter || tx(p.category) === currentFilter);
  $("#grid").innerHTML = list.map(({ p, i }) => `
    <article class="card reveal" data-index="${i}" tabindex="0" role="button" aria-label="${esc(t("view_details", { name: tx(p.title) }))}">
      ${visual(p)}
      <div class="card-body">
        <div class="card-top"><span class="cat">${esc(tx(p.category))}</span><span class="card-year">${esc(p.year || "")}</span></div>
        <h4>${esc(tx(p.title))} ${ICON.ext}</h4>
        <p>${esc(tx(p.summary))}</p>
        ${tagList((p.tags || []).slice(0, 3))}
      </div>
    </article>`).join("");
  $("#empty").hidden = list.length > 0 || others().length === 0; // no message when there are no extra projects at all
}

function renderFilters() {
  const head = $("#more-head");
  if (!head) return;
  if (!others().length) { head.hidden = true; return; }
  const cats = [...new Set(others().map(({ p }) => tx(p.category)))];
  const box = $("#filters");
  if (cats.length < 2) { box.hidden = true; return; } // tabs aren't useful with one category
  if (!cats.includes(currentFilter)) currentFilter = "";
  box.innerHTML = ["", ...cats]
    .map((c) => `<button class="tab" role="tab" aria-selected="${c === currentFilter}" data-cat="${esc(c)}">${esc(c || t("filter_all"))}</button>`)
    .join("");
}

/* ---------- Project modal ---------- */
function openProject(i) {
  const p = PROJECTS[i];
  const paras = [].concat(tx(p.description) || []).map((s) => `<p>${esc(s)}</p>`).join("");
  const links = [
    p.demo && `<a class="btn btn-primary" href="${esc(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">${esc(t("visit_live"))} ${ICON.ext}</a>`,
    extraLinks(p, "btn btn-secondary"),
    p.github && `<a class="btn btn-secondary" href="${esc(safeUrl(p.github))}" target="_blank" rel="noopener noreferrer">${ICON.code} ${esc(t("view_source"))}</a>`,
  ].filter(Boolean).join("");
  $("#modal-content").innerHTML = `
    ${visual(p, { controls: true })}
    <div class="modal-body">
      <span class="cat">${esc(tx(p.category))}</span>
      <h3 id="modal-title">${esc(tx(p.title))}</h3>
      <p class="modal-sub">${esc(tx(p.summary))}</p>
      ${paras ? `<div class="modal-desc">${paras}</div>` : ""}
      <dl class="modal-facts">
        <div><dt>${esc(t("role"))}</dt><dd>${esc(tx(p.role) || "—")}</dd></div>
        <div><dt>${esc(t("year"))}</dt><dd>${esc(p.year || "—")}</dd></div>
        <div><dt>${esc(t("type"))}</dt><dd>${esc(tx(p.category))}</dd></div>
      </dl>
      ${tagList(p.tags)}
      ${links ? `<div class="modal-links">${links}</div>` : ""}
    </div>`;
  $("#modal").showModal();
}

/* ---------- Skills & experience ---------- */
function renderSkills() {
  $("#skills").innerHTML = SKILLS.map(
    (s) => `<div><h4>${esc(tx(s.group))}</h4><ul>${s.items.map((i) => `<li>${esc(tx(i))}</li>`).join("")}</ul></div>`
  ).join("");
  // Top few from each group for the hero row
  $("#stack").innerHTML = SKILLS.flatMap((s) => s.items.slice(0, 3)).map((i) => `<li>${esc(tx(i))}</li>`).join("");
}

function renderTimeline() {
  $("#timeline").innerHTML = TIMELINE.map(
    (item) => `
      <li class="tl reveal">
        <div class="tl-head"><h3>${esc(tx(item.title))}</h3><span class="tl-when">${esc(tx(item.when))}</span></div>
        <div class="tl-where">${esc(tx(item.where))}</div>
        <p>${esc(tx(item.text))}</p>
      </li>`
  ).join("");
}

// Draws (or redraws, after a language change) everything that has text
function renderAll() {
  applyStaticTexts();
  renderLangSwitch();
  renderProfile();
  renderFeatured();
  renderFilters();
  renderGrid();
  renderSkills();
  renderTimeline();
  observeReveals();
}

/* ---------- UI behavior (set up once) ---------- */
let observer;
function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), observer.unobserve(e.target))),
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
}

function setupEvents() {
  $("#lang-switch").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (btn) setLanguage(btn.dataset.lang);
  });

  $("#filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    currentFilter = btn.dataset.cat;
    renderFilters();
    renderGrid();
    observeReveals();
  });

  const modal = $("#modal");
  const work = $("#work");
  work.addEventListener("click", (e) => {
    if (e.target.closest("a")) return; // let real links work
    const item = e.target.closest("[data-index]");
    if (item) openProject(+item.dataset.index);
  });
  work.addEventListener("keydown", (e) => {
    const item = e.target.closest("[data-index]");
    if (item && e.target === item && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(+item.dataset.index); }
  });
  $("#modal-close").addEventListener("click", () => modal.close());
  // Close when clicking the backdrop
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  const toast = $("#toast");
  $("#copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      toast.textContent = t("copied");
    } catch (e) {
      toast.textContent = PROFILE.email;
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
}

function setupNav() {
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const btn = $("#menu-toggle");
  const links = $("#nav-links");
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", links.classList.toggle("open")));
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { links.classList.remove("open"); btn.setAttribute("aria-expanded", false); }
  });

  // Highlight the link of the section in view
  const anchors = [...links.querySelectorAll("a")];
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) anchors.forEach((a) => a.classList.toggle("active", a.hash === `#${e.target.id}`));
    }),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  anchors.forEach((a) => { const s = document.querySelector(a.hash); if (s) spy.observe(s); });
}

renderAll();
setupEvents();
setupNav();
