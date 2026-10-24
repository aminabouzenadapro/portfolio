// Boots the API (the in-browser Python server in demo mode), then routes #/... to views.
import { DEMO, restoreSession, session, signIn, signOut } from "./api.js";
import { resetDemoData, startPython } from "./python-api.js";
import { LANGS, applyLang, errMsg, lang, setLang, t } from "./i18n.js";
import { html, icon } from "./ui.js";
import { eventPage, home, myTicketsPage, ticketPage } from "./views/public.js";
import { checkin, dashboard, editor, eventAdmin, homeFor, loginPage, needsStaff, stopScanner } from "./views/staff.js";

const ROUTES = [
  [/^\/$/, home],
  [/^\/events\/([\w-]+)$/, eventPage, ["slug"]],
  [/^\/ticket\/([\w-]+)$/, ticketPage, ["code"]],
  [/^\/my-tickets$/, myTicketsPage],
  [/^\/staff\/login$/, loginPage],
  [/^\/staff$/, dashboard, [], "organizer"],
  [/^\/staff\/events\/new$/, editor, [], "organizer"],
  [/^\/staff\/events\/(\d+)$/, eventAdmin, ["id"], "organizer"],
  [/^\/staff\/events\/(\d+)\/edit$/, editor, ["id"], "organizer"],
  [/^\/staff\/checkin(?:\/(\d+))?$/, checkin, ["id"], "staff"],
];

const main = document.getElementById("main");
let renderId = 0;

function chrome() {
  const user = session.user;
  document.getElementById("nav").innerHTML = html`
    <a href="#/" data-nav="/">${t("navEvents")}</a>
    <a href="#/my-tickets" data-nav="/my-tickets">${t("myTickets")}</a>
    ${user?.role === "organizer" ? html`<a href="#/staff" data-nav="/staff">${t("dashboard")}</a>` : ""}
    ${user ? html`<a href="#/staff/checkin" data-nav="/staff/checkin">${t("checkIn")}</a>` : ""}`;
  document.getElementById("account").innerHTML = user
    ? html`<span class="who-chip" title="${user.email}"><b>${user.name.split(" ")[0]}</b><small>${t(user.role === "organizer" ? "roleOrganizer" : "roleVolunteer")}</small></span>
           <button class="icon-btn" data-action="signout" title="${t("signOut")}" aria-label="${t("signOut")}">${icon("logout")}</button>`
    : html`<a class="btn small ghost" href="#/staff/login">${t("teamSpace")}</a>`;
  document.getElementById("langs").innerHTML = html`${LANGS.map((l) => html`<button lang="${l.code}" class="${l.code === lang() ? "on" : ""}" aria-pressed="${l.code === lang()}" data-lang="${l.code}">${l.label}</button>`)}`;
  document.getElementById("footer-text").textContent = t("footer");
  const demo = document.getElementById("demo-bar");
  if (DEMO) {
    demo.hidden = false;
    demo.innerHTML = html`<div class="container demo-inner">
      <span class="tag">${t("demoTag")}</span><span class="demo-text">${t("demoText")}</span>
      <span class="demo-actions">
        <button data-demo="organisatrice@twiza-dz.org">${icon("chart", 14)}${t("roleOrganizer")}</button>
        <button data-demo="benevole@twiza-dz.org">${icon("scan", 14)}${t("roleVolunteer")}</button>
        <button data-action="reset">${icon("refresh", 14)}${t("reset")}</button>
      </span></div>`;
  }
}

async function route() {
  stopScanner();
  const id = ++renderId;
  const [path, search = ""] = location.hash.slice(1).split("?");
  const query = new URLSearchParams(search);
  const target = path || "/";
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === target));
  for (const [re, view, names = [], role] of ROUTES) {
    const m = target.match(re);
    if (!m) continue;
    const redirect = role && needsStaff(role === "staff" ? null : role);
    if (redirect) { location.hash = redirect; return; }
    main.setAttribute("aria-busy", "true");
    try {
      const params = Object.fromEntries(names.map((n, i) => [n, m[i + 1]]).filter(([, v]) => v !== undefined));
      const out = await view(params, query);
      if (id !== renderId) return; // a newer navigation started meanwhile
      const page = document.createElement("div");
      page.className = "view";
      page.innerHTML = out.html;
      main.replaceChildren(page);
      out.mount?.(page);
      document.title = (out.title ? out.title + " · " : "") + "Twiza";
    } catch (e) {
      if (id !== renderId) return;
      main.innerHTML = html`<div class="container page empty">${icon("alert", 30)}<p>${errMsg(e)}</p><a class="btn" href="#/">${t("allEvents")}</a></div>`;
    }
    main.removeAttribute("aria-busy");
    if (!query.get("keep")) window.scrollTo(0, 0);
    return;
  }
  main.innerHTML = html`<div class="container page empty"><h1>404</h1><a class="btn" href="#/">${t("allEvents")}</a></div>`;
}

document.addEventListener("click", async (ev) => {
  const el = ev.target.closest("[data-lang], [data-demo], [data-action]");
  if (!el) return;
  if (el.dataset.lang) { setLang(el.dataset.lang); chrome(); route(); }
  if (el.dataset.demo) {
    const user = await signIn(el.dataset.demo, "demo1234");
    chrome();
    location.hash = homeFor(user);
  }
  if (el.dataset.action === "signout") { signOut(); chrome(); location.hash = "#/"; }
  if (el.dataset.action === "reset" && confirm(t("resetConfirm"))) { await resetDemoData(); signOut(); location.hash = "#/"; location.reload(); }
});
window.addEventListener("hashchange", () => { chrome(); route(); });

// ---- Start ----
const boot = document.getElementById("boot");
const STEPS = ["runtime", "packages", "app"];

async function start() {
  applyLang();
  chrome();
  if (DEMO) {
    boot.hidden = false;
    boot.innerHTML = html`<div class="boot-card">
      <span class="logo-mark">${icon("hands", 30)}</span>
      <h1>${t("bootTitle")}</h1>
      <p>${t("bootLead")}</p>
      <ol>${STEPS.map((s) => html`<li data-step="${s}"><span class="tick"></span>${t("boot_" + s)}</li>`)}</ol>
      <p class="muted small">${t("bootHint")}</p></div>`;
    const t0 = performance.now();
    try {
      await startPython((step) => {
        const i = STEPS.indexOf(step);
        boot.querySelectorAll("li").forEach((li, k) => li.className = k < i ? "done" : k === i ? "now" : "");
      });
    } catch (e) {
      boot.querySelector("p").textContent = t("bootFailed") + " (" + e.message + ")";
      return;
    }
    console.info(`Python API ready in ${Math.round(performance.now() - t0)} ms`);
    boot.classList.add("gone");
    setTimeout(() => (boot.hidden = true), 400);
  }
  await restoreSession();
  chrome();
  route();
}
start();
