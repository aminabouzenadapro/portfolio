// Pages for the association's team: sign-in, organizer dashboard, registrations,
// event editor, and the check-in screen used at the door (organizers and volunteers).
import { DEMO, api, session, signIn } from "../api.js";
import { demoTickets } from "../python-api.js";
import { errMsg, t, tr } from "../i18n.js";
import { bar, download, fmt, html, icon, toast } from "../ui.js";
import { beep, startScanner } from "../scanner.js";
import { dateTile, phasePill } from "./public.js";

export const homeFor = (user) => (user?.role === "organizer" ? "#/staff" : "#/staff/checkin");

export function needsStaff(role) {
  if (!session.user) return `#/staff/login?next=${encodeURIComponent(location.hash.slice(1))}`;
  if (role && session.user.role !== role) return "#/staff/checkin";
  return null;
}

export async function loginPage(_params, query) {
  return {
    title: t("teamSpace"),
    html: html`
      <div class="auth">
        <form class="panel form" id="login" novalidate>
          <span class="badge-icon">${icon("users", 26)}</span>
          <h1>${t("teamSpace")}</h1>
          <p class="muted">${t("teamLead")}</p>
          <label>${t("email")}<input name="email" type="email" autocomplete="username" dir="ltr" required></label>
          <label>${t("password")}<input name="password" type="password" autocomplete="current-password" dir="ltr" required></label>
          <p class="form-error" role="alert" hidden></p>
          <button class="btn big block">${t("signIn")}</button>
          ${DEMO ? html`<div class="demo-logins"><p>${t("demoAccounts")}</p>
            <button type="button" class="btn ghost" data-demo="organisatrice@twiza-dz.org">${icon("chart")}${t("roleOrganizer")}</button>
            <button type="button" class="btn ghost" data-demo="benevole@twiza-dz.org">${icon("scan")}${t("roleVolunteer")}</button></div>` : ""}
        </form>
      </div>`,
    mount(root) {
      const form = root.querySelector("#login");
      const err = form.querySelector(".form-error");
      const go = async (email, password) => {
        err.hidden = true;
        try {
          const user = await signIn(email, password);
          location.hash = query.get("next") ? "#" + query.get("next") : homeFor(user);
        } catch (e) { err.textContent = errMsg(e); err.hidden = false; }
      };
      form.addEventListener("submit", (ev) => { ev.preventDefault(); const f = new FormData(form); go(f.get("email"), f.get("password")); });
      form.querySelectorAll("[data-demo]").forEach((b) => b.addEventListener("click", () => go(b.dataset.demo, "demo1234")));
    },
  };
}

function weeklyChart(weeks) {
  const max = Math.max(5, ...weeks);
  return html`<div class="weekly" role="img" aria-label="${t("weeklyRegistrations")}: ${weeks.join(", ")}">
    ${weeks.map((n, i) => html`<div><span style="height:${Math.round((n / max) * 100)}%"><b>${n || ""}</b></span><small>${i === weeks.length - 1 ? t("thisWeek") : `-${weeks.length - 1 - i}`}</small></div>`)}
  </div>`;
}

export async function dashboard() {
  const o = await api("/api/admin/overview");
  const upcoming = o.events.filter((e) => e.phase !== "past").sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = o.events.filter((e) => e.phase === "past");
  const row = (e) => html`
    <tr>
      <td><div class="ev-cell">${dateTile(e)}<div><a href="#/staff/events/${e.id}"><b>${tr(e.title)}</b></a><small>${fmt.time(e.starts_at)} · ${e.place}</small></div></div></td>
      <td>${phasePill(e)}${e.published ? "" : html` <span class="pill muted">${t("draft")}</span>`}</td>
      <td class="bar-cell">${bar(e.confirmed, e.capacity, e.color)}<span>${e.confirmed}/${e.capacity}</span></td>
      <td>${e.waitlist || "–"}</td>
      <td>${e.phase === "upcoming" ? "–" : html`${e.checked_in} <small class="muted">(${e.confirmed ? Math.round((e.checked_in / e.confirmed) * 100) : 0} %)</small>`}</td>
      <td class="actions">
        <a class="btn ghost small" href="#/staff/events/${e.id}">${t("registrations")}</a>
        ${e.phase !== "past" ? html`<a class="btn small" href="#/staff/checkin/${e.id}">${icon("scan", 15)}${t("checkIn")}</a>` : ""}
      </td>
    </tr>`;
  return {
    title: t("dashboard"),
    html: html`
      <div class="container page">
        <div class="page-head">
          <div><h1>${t("dashboard")}</h1><p class="muted">${t("hello", { name: session.user.name.split(" ")[0] })}</p></div>
          <a class="btn" href="#/staff/events/new">${icon("plus")}${t("newEvent")}</a>
        </div>
        <div class="kpis">
          <div class="kpi">${icon("calendar")}<b>${o.upcoming_events}</b><span>${t("statUpcoming")}</span></div>
          <div class="kpi">${icon("ticket")}<b>${o.upcoming_registrations}</b><span>${t("kpiUpcomingRegs")}</span></div>
          <div class="kpi">${icon("users")}<b>${o.waitlist}</b><span>${t("kpiWaitlist")}</span></div>
          <div class="kpi">${icon("check")}<b>${o.attendance_rate ?? "–"}${o.attendance_rate !== null ? " %" : ""}</b><span>${t("kpiAttendance")}</span></div>
          <div class="kpi">${icon("heart")}<b>${o.people}</b><span>${t("kpiPeople")}</span></div>
        </div>
        <section class="panel">
          <div class="panel-head"><h2>${t("weeklyRegistrations")}</h2><small class="muted">${t("last8Weeks")}</small></div>
          ${weeklyChart(o.weekly)}
        </section>
        <section class="panel">
          <div class="panel-head"><h2>${t("upcomingTitle")}</h2></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>${t("event")}</th><th>${t("status")}</th><th>${t("registered")}</th><th>${t("waitlist")}</th><th>${t("present")}</th><th></th></tr></thead>
            <tbody>${upcoming.map(row)}</tbody></table></div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>${t("pastTitle")}</h2></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>${t("event")}</th><th>${t("status")}</th><th>${t("registered")}</th><th>${t("waitlist")}</th><th>${t("present")}</th><th></th></tr></thead>
            <tbody>${past.map(row)}</tbody></table></div>
        </section>
      </div>`,
  };
}

export async function eventAdmin({ id }) {
  const e = await api(`/api/admin/events/${id}`);
  let rows = await api(`/api/admin/events/${id}/registrations`);
  const statusPill = (r) => r.checked_in_at
    ? html`<span class="pill ok">${icon("check", 13)}${t("present")} · ${fmt.time(r.checked_in_at)}</span>`
    : html`<span class="pill ${{ confirmed: "info", waitlist: "warn", cancelled: "muted" }[r.status]}">${t("reg_" + r.status, { n: r.position })}</span>`;
  // Always returns one html`` value (an array would be joined with commas by innerHTML)
  const body = (list) => list.length
    ? html`${list.map((r) => html`<tr>
        <td><b>${r.name}</b><small class="muted" dir="ltr">${r.email}</small></td>
        <td dir="ltr" class="nowrap">${r.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}</td>
        <td><code dir="ltr">${r.code}</code></td>
        <td class="nowrap">${fmt.dateTime(r.created_at)}</td>
        <td>${statusPill(r)}</td></tr>`)}`
    : html`<tr><td colspan="5" class="muted center">${t("noResults")}</td></tr>`;
  return {
    title: tr(e.title),
    html: html`
      <div class="container page">
        <a class="back dark" href="#/staff">${icon("back", 16, "flip")}${t("dashboard")}</a>
        <div class="page-head">
          <div class="ev-cell big">${dateTile(e)}<div><h1>${tr(e.title)}</h1><p class="muted">${fmt.day(e.starts_at)} · ${fmt.time(e.starts_at)} – ${fmt.time(e.ends_at)} · ${e.place}</p></div></div>
          <div class="head-actions">
            <a class="btn ghost" href="#/staff/events/${id}/edit">${icon("edit")}${t("edit")}</a>
            ${e.phase !== "past" ? html`<a class="btn" href="#/staff/checkin/${id}">${icon("scan")}${t("checkIn")}</a>` : ""}
          </div>
        </div>
        <div class="kpis four">
          <div class="kpi">${icon("ticket")}<b>${e.confirmed}<small>/${e.capacity}</small></b><span>${t("registered")}</span></div>
          <div class="kpi">${icon("users")}<b>${e.waitlist}</b><span>${t("waitlist")}</span></div>
          <div class="kpi">${icon("check")}<b>${e.checked_in}</b><span>${t("present")}</span></div>
          <div class="kpi">${icon("x")}<b>${e.cancelled}</b><span>${t("cancelledPl")}</span></div>
        </div>
        <section class="panel">
          <div class="panel-head">
            <h2>${t("registrations")}</h2>
            <div class="tools">
              <label class="search">${icon("search", 16)}<input type="search" id="q" placeholder="${t("searchPeople")}" aria-label="${t("searchPeople")}"></label>
              <select id="status" aria-label="${t("status")}">
                <option value="">${t("allStatuses")}</option>
                ${["confirmed", "waitlist", "checked_in", "cancelled"].map((s) => html`<option value="${s}">${t("filter_" + s)}</option>`)}
              </select>
              <button class="btn ghost" data-action="csv">${icon("download")}${t("exportCsv")}</button>
            </div>
          </div>
          <p class="muted small" id="count">${t("peopleCount", { n: rows.length })}</p>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>${t("participant")}</th><th>${t("phone")}</th><th>${t("ticket")}</th><th>${t("registeredAt")}</th><th>${t("status")}</th></tr></thead>
            <tbody id="rows">${body(rows)}</tbody></table></div>
        </section>
      </div>`,
    mount(root) {
      const q = root.querySelector("#q"), status = root.querySelector("#status");
      let timer;
      const refresh = async () => {
        rows = await api(`/api/admin/events/${id}/registrations?q=${encodeURIComponent(q.value.trim())}&status=${status.value}`);
        root.querySelector("#rows").innerHTML = body(rows);
        root.querySelector("#count").textContent = t("peopleCount", { n: rows.length });
      };
      q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(refresh, 200); });
      status.addEventListener("change", refresh);
      root.querySelector('[data-action="csv"]').addEventListener("click", async () => {
        download(`${e.slug}-inscriptions.csv`, await api(`/api/admin/events/${id}/registrations.csv`), "text/csv;charset=utf-8");
      });
    },
  };
}

const COLORS = ["#12715b", "#0b7285", "#1971c2", "#7048e8", "#c92a2a", "#e8590c", "#b5651d"];
const local = (d) => d.slice(0, 16);

export async function editor({ id }) {
  const isNew = id === undefined;
  const start = new Date(Date.now() + 14 * 864e5);
  start.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const e = isNew
    ? { title: { fr: "", ar: "", en: "" }, summary: { fr: "", ar: "", en: "" }, description: { fr: "", ar: "", en: "" }, category: "solidarity", place: "", address: "",
        starts_at: iso(start), ends_at: iso(new Date(start.getTime() + 3 * 36e5)), capacity: 50, color: COLORS[0], published: true }
    : await api(`/api/admin/events/${id}`);
  const langs = [["fr", "ltr"], ["ar", "rtl"], ["en", "ltr"]];
  return {
    title: isNew ? t("newEvent") : t("edit"),
    html: html`
      <div class="container page narrow-wide">
        <a class="back dark" href="${isNew ? "#/staff" : `#/staff/events/${id}`}">${icon("back", 16, "flip")}${isNew ? t("dashboard") : tr(e.title)}</a>
        <h1>${isNew ? t("newEvent") : t("editEvent")}</h1>
        <form id="editor" class="form" novalidate>
          <section class="panel">
            <h2>${t("texts")}</h2>
            <div class="grid3">
              ${langs.map(([l, dir]) => html`<fieldset class="lang-col" lang="${l}" dir="${dir}">
                <legend>${t("langName_" + l)}</legend>
                <label>${t("fTitle")}<input name="title.${l}" value="${e.title[l]}" required></label>
                <label>${t("fSummary")}<textarea name="summary.${l}" rows="3">${e.summary[l]}</textarea></label>
                <label>${t("fDescription")}<textarea name="description.${l}" rows="6">${e.description[l]}</textarea></label>
              </fieldset>`)}
            </div>
          </section>
          <section class="panel">
            <h2>${t("practical")}</h2>
            <div class="grid2">
              <label>${t("fStart")}<input type="datetime-local" name="starts_at" value="${local(e.starts_at)}" required></label>
              <label>${t("fEnd")}<input type="datetime-local" name="ends_at" value="${local(e.ends_at)}" required></label>
              <label>${t("fPlace")}<input name="place" value="${e.place}" required></label>
              <label>${t("fAddress")}<input name="address" value="${e.address}"></label>
              <label>${t("fCategory")}<select name="category">${["environment", "health", "education", "culture", "solidarity"].map((c) => html`<option value="${c}" ${c === e.category ? "selected" : ""}>${t("cat_" + c)}</option>`)}</select></label>
              <label>${t("fCapacity")}<input type="number" name="capacity" min="1" max="5000" value="${e.capacity}" required>
                ${isNew ? "" : html`<small class="muted">${t("capacityHint", { n: e.confirmed })}</small>`}</label>
            </div>
            <fieldset class="colors"><legend>${t("fColor")}</legend>
              ${COLORS.map((c) => html`<label style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === e.color ? "checked" : ""}><span></span></label>`)}
            </fieldset>
            <label class="check"><input type="checkbox" name="published" ${e.published ? "checked" : ""}>${t("fPublished")}</label>
          </section>
          <div class="save-bar">
            <p class="form-error" role="alert" hidden></p>
            <button class="btn big">${isNew ? t("createEvent") : t("save")}</button>
          </div>
        </form>
      </div>`,
    mount(root) {
      const form = root.querySelector("#editor");
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const f = new FormData(form);
        const texts = (k) => Object.fromEntries(langs.map(([l]) => [l, f.get(`${k}.${l}`) || ""]));
        const body = {
          title: texts("title"), summary: texts("summary"), description: texts("description"),
          category: f.get("category"), place: f.get("place"), address: f.get("address"),
          starts_at: f.get("starts_at"), ends_at: f.get("ends_at"), capacity: Number(f.get("capacity")),
          color: f.get("color"), published: f.get("published") === "on",
        };
        const err = form.querySelector(".form-error");
        err.hidden = true;
        try {
          const saved = await api(isNew ? "/api/admin/events" : `/api/admin/events/${id}`, { method: isNew ? "POST" : "PUT", body });
          toast(t("saved"));
          location.hash = `#/staff/events/${saved.id}`;
        } catch (e2) { err.textContent = errMsg(e2); err.hidden = false; }
      });
    },
  };
}

// ---- Check-in at the door ----

let stopCamera = null;
export function stopScanner() { stopCamera?.(); stopCamera = null; }

export async function checkin({ id }) {
  const events = await api("/api/staff/events");
  const current = id ? events.find((e) => String(e.id) === String(id)) : events.find((e) => e.phase === "ongoing") || events[0];
  if (!current) return { html: html`<div class="container page empty">${icon("calendar", 30)}<p>${t("noEventToday")}</p></div>` };
  const data = await api(`/api/staff/events/${current.id}/checkins`);
  const samples = DEMO ? await demoTickets(current.id) : [];
  const recentList = (list) => list.length
    ? html`${list.map((r) => html`<li><span class="dot ok"></span><b>${r.name}</b><small>${fmt.ago(r.checked_in_at)}</small></li>`)}`
    : html`<li class="muted">${t("nobodyYet")}</li>`;
  const counter = (c) => html`<b>${c.checked_in}</b><span>/ ${c.confirmed} ${t("presentLower")}</span>`;
  return {
    title: t("checkIn"),
    html: html`
      <div class="container page checkin">
        <div class="page-head">
          <div>
            <h1>${t("checkIn")}</h1>
            <select id="event" aria-label="${t("event")}">${events.map((e) => html`<option value="${e.id}" ${e.id === current.id ? "selected" : ""}>${fmt.short(e.starts_at)} · ${tr(e.title)}</option>`)}</select>
          </div>
          <div class="counter" id="counter">${counter(data.event)}</div>
        </div>
        ${current.phase === "upcoming" ? html`<div class="notice warn">${icon("clock")}${t("doorsNotOpen", { time: fmt.dateTime(current.starts_at) })}</div>` : ""}
        <div class="checkin-grid">
          <section class="panel scan-panel">
            <div class="camera" id="camera">
              <video muted playsinline></video>
              <div class="camera-idle">${icon("camera", 34)}<button class="btn" data-action="camera">${t("startCamera")}</button></div>
              <span class="frame"></span>
            </div>
            <form id="manual" class="manual" autocomplete="off">
              <input name="code" placeholder="TWZ-XXXX-XXXX" dir="ltr" aria-label="${t("ticketCode")}" autocapitalize="characters">
              <button class="btn">${t("check")}</button>
            </form>
            ${samples.length ? html`<div class="samples"><p>${t("demoCodes")}</p>${samples.map((s) => html`<button class="chip" data-code="${s.code}"><code dir="ltr">${s.code}</code><small>${t("sample_" + s.kind)}</small></button>`)}</div>` : ""}
          </section>
          <section class="panel result-panel">
            <div class="result idle" id="result">${icon("scan", 40)}<p>${t("waitingScan")}</p></div>
            <h3>${t("recentArrivals")}</h3>
            <ul class="recent" id="recent">${recentList(data.recent)}</ul>
          </section>
        </div>
      </div>`,
    mount(root) {
      const result = root.querySelector("#result");
      root.querySelector("#event").addEventListener("change", (ev) => { location.hash = `#/staff/checkin/${ev.target.value}`; });

      const show = (r) => {
        const ok = r.result === "ok";
        const name = r.registration?.name;
        const extra = r.result === "already" ? t("alreadyAt", { time: fmt.time(r.registration.checked_in_at), by: r.registration.checked_in_by || "" })
          : r.result === "wrong_event" ? t("forEvent", { event: tr(r.other_event) })
          : r.result === "waitlist" ? t("waitlistPos", { n: r.registration.position }) : "";
        result.className = `result ${ok ? "ok" : r.result === "already" ? "warn" : "bad"}`;
        result.innerHTML = html`
          ${icon(ok ? "check" : r.result === "already" ? "alert" : "x", 46)}
          <h2>${t("res_" + r.result)}</h2>
          ${name ? html`<p class="who">${name}</p>` : ""}
          ${extra ? html`<p>${extra}</p>` : ""}
          <code dir="ltr">${r.code}</code>
          ${ok ? html`<button class="btn ghost small" data-undo="${r.code}">${icon("undo", 15)}${t("undo")}</button>` : ""}`;
        beep(ok);
      };

      const check = async (code) => {
        if (!code.trim()) return;
        try {
          const r = await api("/api/staff/checkin", { method: "POST", body: { code, event_id: current.id } });
          show(r);
          root.querySelector("#counter").innerHTML = counter(r.counts);
          const fresh = await api(`/api/staff/events/${current.id}/checkins`);
          root.querySelector("#recent").innerHTML = recentList(fresh.recent);
        } catch (e) { toast(errMsg(e), "bad"); }
      };

      root.querySelector("#manual").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const input = ev.target.elements.code;
        check(input.value);
        input.value = "";
        input.focus();
      });
      root.addEventListener("click", async (ev) => {
        const sample = ev.target.closest("[data-code]");
        if (sample) check(sample.dataset.code);
        const undo = ev.target.closest("[data-undo]");
        if (undo) {
          const r = await api("/api/staff/checkin/undo", { method: "POST", body: { code: undo.dataset.undo, event_id: current.id } });
          root.querySelector("#counter").innerHTML = counter(r.counts);
          result.className = "result idle";
          result.innerHTML = html`${icon("undo", 40)}<p>${t("undone")}</p>`;
          root.querySelector("#recent").innerHTML = recentList((await api(`/api/staff/events/${current.id}/checkins`)).recent);
        }
        if (ev.target.closest('[data-action="camera"]')) {
          const cam = root.querySelector("#camera");
          try {
            stopScanner();
            stopCamera = await startScanner(cam.querySelector("video"), check);
            cam.classList.add("on");
          } catch { toast(t("noCamera"), "bad"); }
        }
      });
      root.querySelector("#manual input").focus();
    },
  };
}
