// Renders the content defined in projects.js. You normally don't need to edit this file.

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
};

/* ---------- Profile ---------- */
function renderProfile() {
  const p = PROFILE;
  document.title = `${p.name} — ${p.role}`;
  // *text* in the headline gets the gradient highlight
  $("#headline").innerHTML = esc(p.headline).replace(/\*(.+?)\*/g, '<span class="grad">$1</span>');
  $("#tagline").textContent = p.tagline;
  if (p.status) $("#status-text").textContent = p.status;
  else $("#status").remove();

  $("#brand-mark").textContent = initials(p.name);
  $("#brand-name").textContent = p.name;
  $("#footer-name").textContent = p.name;
  $("#about-name").textContent = p.name;
  $("#about-role").textContent = p.role;
  $("#avatar").innerHTML = p.avatar ? `<img src="${esc(safeUrl(p.avatar))}" alt="${esc(p.name)}" />` : esc(initials(p.name));
  $("#about-text").innerHTML = [].concat(p.about).map((t) => `<p>${esc(t)}</p>`).join("");
  $("#facts").innerHTML = (p.facts || []).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");

  $("#email-link").href = `mailto:${p.email}`;
  $("#copy-label").textContent = p.email;
  $("#year").textContent = new Date().getFullYear();
  $("#socials").innerHTML = p.socials
    .map((s) => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ${ICON.ext}</a></li>`)
    .join("");
}

/* ---------- Project visuals ---------- */
// Screenshot (or a generated app mockup) inside a browser frame
function visual(p) {
  const inner = p.image
    ? `<img src="${esc(safeUrl(p.image))}" alt="${esc(p.title)} screenshot" loading="lazy" />`
    : `<div class="mock" aria-hidden="true">
         <div class="mock-side"><b></b><b></b><b></b><b></b><b></b></div>
         <div class="mock-main">
           <div class="mock-head"><b></b><b></b></div>
           <div class="mock-hero">${esc(p.title)}</div>
           <div class="mock-cards"><b></b><b></b><b></b></div>
         </div>
       </div>`;
  return `
    <div class="visual" style="--c:${safeColor(p.color)}">
      <div class="browser">
        <div class="browser-bar"><i></i><i></i><i></i>${p.url ? `<span>${esc(p.url)}</span>` : ""}</div>
        ${inner}
      </div>
    </div>`;
}

const tagList = (tags = []) => `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

function projectLinks(p) {
  return [
    p.demo && `<a class="link" href="${esc(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">Live site ${ICON.ext}</a>`,
    p.github && `<a class="link link-muted" href="${esc(safeUrl(p.github))}" target="_blank" rel="noopener noreferrer">${ICON.code} Source</a>`,
  ].filter(Boolean).join("");
}

/* ---------- Featured projects ---------- */
function renderFeatured() {
  const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.featured);
  $("#featured").innerHTML = list.map(({ p, i }, n) => `
    <article class="feature reveal${n % 2 ? " flip" : ""}" data-index="${i}" tabindex="0" role="button" aria-label="View details for ${esc(p.title)}">
      <div class="feature-text">
        <div class="feature-meta"><span class="cat">${esc(p.category)}</span><span>${esc(p.year || "")}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        ${tagList(p.tags)}
        <div class="feature-links">${projectLinks(p)}<span class="link link-muted">Details →</span></div>
      </div>
      ${visual(p)}
    </article>`).join("");
}

/* ---------- More projects ---------- */
const others = () => PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => !p.featured);

function renderGrid(filter = "All") {
  const list = others().filter(({ p }) => filter === "All" || p.category === filter);
  $("#grid").innerHTML = list.map(({ p, i }) => `
    <article class="card reveal" data-index="${i}" tabindex="0" role="button" aria-label="View details for ${esc(p.title)}">
      ${visual(p)}
      <div class="card-body">
        <div class="card-top"><span class="cat">${esc(p.category)}</span><span class="card-year">${esc(p.year || "")}</span></div>
        <h4>${esc(p.title)} ${ICON.ext}</h4>
        <p>${esc(p.summary)}</p>
        ${tagList((p.tags || []).slice(0, 3))}
      </div>
    </article>`).join("");
  $("#empty").hidden = list.length > 0 || others().length === 0; // no message when there are no extra projects at all
  observeReveals();
}

function renderFilters() {
  if (!others().length) { $("#more-head").remove(); return; }
  const cats = ["All", ...new Set(others().map(({ p }) => p.category))];
  const box = $("#filters");
  if (cats.length <= 2) { box.remove(); return; } // tabs aren't useful with one category
  box.innerHTML = cats
    .map((c, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");
  box.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    box.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", b === btn));
    renderGrid(btn.dataset.cat);
  });
}

/* ---------- Project modal ---------- */
function openProject(i) {
  const p = PROJECTS[i];
  const paras = [].concat(p.description || []).map((t) => `<p>${esc(t)}</p>`).join("");
  const links = [
    p.demo && `<a class="btn btn-primary" href="${esc(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">Visit live site ${ICON.ext}</a>`,
    p.github && `<a class="btn btn-secondary" href="${esc(safeUrl(p.github))}" target="_blank" rel="noopener noreferrer">${ICON.code} View source</a>`,
  ].filter(Boolean).join("");
  $("#modal-content").innerHTML = `
    ${visual(p)}
    <div class="modal-body">
      <span class="cat">${esc(p.category)}</span>
      <h3 id="modal-title">${esc(p.title)}</h3>
      <p class="modal-sub">${esc(p.summary)}</p>
      ${paras ? `<div class="modal-desc">${paras}</div>` : ""}
      <dl class="modal-facts">
        <div><dt>Role</dt><dd>${esc(p.role || "—")}</dd></div>
        <div><dt>Year</dt><dd>${esc(p.year || "—")}</dd></div>
        <div><dt>Type</dt><dd>${esc(p.category)}</dd></div>
      </dl>
      ${tagList(p.tags)}
      ${links ? `<div class="modal-links">${links}</div>` : ""}
    </div>`;
  $("#modal").showModal();
}

function setupModal() {
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
}

/* ---------- Skills & experience ---------- */
function renderSkills() {
  $("#skills").innerHTML = SKILLS.map(
    (s) => `<div><h4>${esc(s.group)}</h4><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`
  ).join("");
  // Top few from each group for the hero row
  $("#stack").innerHTML = SKILLS.flatMap((s) => s.items.slice(0, 3)).map((i) => `<li>${esc(i)}</li>`).join("");
}

function renderTimeline() {
  $("#timeline").innerHTML = TIMELINE.map(
    (t) => `
      <li class="tl reveal">
        <div class="tl-head"><h3>${esc(t.title)}</h3><span class="tl-when">${esc(t.when)}</span></div>
        <div class="tl-where">${esc(t.where)}</div>
        <p>${esc(t.text)}</p>
      </li>`
  ).join("");
}

/* ---------- UI behavior ---------- */
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

function setupTheme() {
  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
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

function setupCopy() {
  const toast = $("#toast");
  $("#copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      toast.textContent = "Email address copied";
    } catch (e) {
      toast.textContent = PROFILE.email;
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
}

renderProfile();
renderFeatured();
renderFilters();
renderGrid();
renderSkills();
renderTimeline();
setupModal();
setupTheme();
setupNav();
setupCopy();
observeReveals();
