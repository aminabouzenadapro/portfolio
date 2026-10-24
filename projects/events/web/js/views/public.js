// Pages for participants: event list, event page with registration, ticket, my tickets.
import { api, myTickets } from "../api.js";
import { errMsg, t, tr } from "../i18n.js";
import { CATEGORY_ICON, bar, download, fmt, html, icon, raw, toast } from "../ui.js";

export function dateTile(e) {
  return html`<span class="date-tile" style="--c:${e.color}"><b>${fmt.dayNum(e.starts_at)}</b><small>${fmt.month(e.starts_at)}</small></span>`;
}

export function phasePill(e) {
  if (e.phase === "ongoing") return html`<span class="pill live"><i></i>${t("ongoing")}</span>`;
  if (e.phase === "past") return html`<span class="pill muted">${t("pastAttended", { n: e.checked_in })}</span>`;
  if (e.seats_left === 0) return html`<span class="pill warn">${t("fullWaitlist")}</span>`;
  if (e.seats_left <= 10) return html`<span class="pill warn">${t("seatsLeft", { n: e.seats_left })}</span>`;
  return html`<span class="pill ok">${t("seatsLeft", { n: e.seats_left })}</span>`;
}

function eventCard(e) {
  return html`
    <a class="event-card" href="#/events/${e.slug}" style="--c:${e.color}">
      ${dateTile(e)}
      <div class="event-card-body">
        <span class="cat">${icon(CATEGORY_ICON[e.category], 15)}${t("cat_" + e.category)}</span>
        <h3>${tr(e.title)}</h3>
        <p>${tr(e.summary)}</p>
        <ul class="meta">
          <li>${icon("clock", 15)}${fmt.day(e.starts_at)} · ${fmt.time(e.starts_at)}</li>
          <li>${icon("pin", 15)}${e.place}</li>
        </ul>
        <div class="fill">
          ${bar(e.phase === "past" ? e.checked_in : e.confirmed, e.phase === "past" ? e.confirmed : e.capacity, e.color)}
          <span>${e.phase === "past" ? t("attendedOf", { n: e.checked_in, total: e.confirmed }) : t("registeredOf", { n: e.confirmed, total: e.capacity })}</span>
        </div>
      </div>
      <div class="event-card-side">${phasePill(e)}</div>
    </a>`;
}

export async function home() {
  const [upcoming, past] = await Promise.all([api("/api/events"), api("/api/events?when=past")]);
  const people = [...upcoming, ...past].reduce((s, e) => s + e.confirmed, 0);
  const attended = past.reduce((s, e) => s + e.checked_in, 0);
  return {
    html: html`
      <section class="hero">
        <div class="container hero-inner">
          <div>
            <span class="eyebrow">${t("heroEyebrow")}</span>
            <h1>${t("heroTitle")}</h1>
            <p class="lead">${t("heroLead")}</p>
            <div class="hero-cta">
              <a class="btn big" href="#events">${t("seeEvents")}${icon("arrow", 18, "flip")}</a>
              <a class="btn big ghost" href="#/my-tickets">${icon("ticket")}${t("myTickets")}</a>
            </div>
          </div>
          <div class="hero-stats">
            <div><b>${upcoming.length}</b><span>${t("statUpcoming")}</span></div>
            <div><b>${people}</b><span>${t("statRegistrations")}</span></div>
            <div><b>${attended}</b><span>${t("statAttended")}</span></div>
          </div>
        </div>
      </section>
      <section class="container section" id="events">
        <div class="section-head"><h2>${t("upcomingTitle")}</h2></div>
        <div class="event-list">${upcoming.map(eventCard)}</div>
      </section>
      <section class="container section">
        <div class="section-head"><h2>${t("pastTitle")}</h2></div>
        <div class="event-list past">${past.map(eventCard)}</div>
      </section>`,
    mount(root) {
      root.querySelector('a[href="#events"]')?.addEventListener("click", (ev) => { ev.preventDefault(); document.getElementById("events").scrollIntoView({ behavior: "smooth" }); });
    },
  };
}

export async function eventPage({ slug }) {
  const e = await api(`/api/events/${slug}`);
  const open = e.phase === "upcoming";
  return {
    title: tr(e.title),
    html: html`
      <section class="event-hero" style="--c:${e.color}">
        <div class="container">
          <a class="back" href="#/">${icon("back", 16, "flip")}${t("allEvents")}</a>
          <span class="cat light">${icon(CATEGORY_ICON[e.category], 15)}${t("cat_" + e.category)}</span>
          <h1>${tr(e.title)}</h1>
          <p class="lead">${tr(e.summary)}</p>
        </div>
      </section>
      <div class="container event-layout">
        <article class="panel">
          <ul class="facts">
            <li>${icon("calendar")}<div><b>${fmt.day(e.starts_at)}</b><small>${fmt.time(e.starts_at)} – ${fmt.time(e.ends_at)}</small></div></li>
            <li>${icon("pin")}<div><b>${e.place}</b><small>${e.address}</small></div></li>
            <li>${icon("users")}<div><b>${t("registeredOf", { n: e.confirmed, total: e.capacity })}</b><small>${e.waitlist ? t("onWaitlist", { n: e.waitlist }) : t("seatsLeft", { n: e.seats_left })}</small></div></li>
          </ul>
          <div class="prose">${tr(e.description).split("\n\n").map((p) => html`<p>${p}</p>`)}</div>
        </article>
        <aside class="panel register">
          ${open ? html`
            <h2>${e.seats_left ? t("registerTitle") : t("waitlistTitle")}</h2>
            <p class="muted">${e.seats_left ? t("registerLead") : t("waitlistLead")}</p>
            <form id="register" class="form" novalidate>
              <label>${t("fullName")}<input name="name" autocomplete="name" required></label>
              <label>${t("email")}<input name="email" type="email" autocomplete="email" dir="ltr" required></label>
              <label>${t("phone")}<input name="phone" type="tel" autocomplete="tel" dir="ltr" placeholder="05 55 12 34 56" required></label>
              <label class="check"><input name="consent" type="checkbox">${t("consent")}</label>
              <p class="form-error" role="alert" hidden></p>
              <button class="btn big block">${e.seats_left ? t("getTicket") : t("joinWaitlist")}</button>
            </form>` : html`
            <div class="closed">${icon(e.phase === "ongoing" ? "clock" : "check", 26)}<h2>${e.phase === "ongoing" ? t("closedOngoing") : t("closedPast")}</h2>
            ${e.phase === "past" ? html`<p>${t("attendedOf", { n: e.checked_in, total: e.confirmed })}</p>` : ""}</div>`}
        </aside>
      </div>`,
    mount(root) {
      const form = root.querySelector("#register");
      form?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const f = new FormData(form);
        const err = form.querySelector(".form-error");
        const btn = form.querySelector("button");
        btn.disabled = true; err.hidden = true;
        try {
          const ticket = await api(`/api/events/${slug}/register`, { method: "POST", body: { name: f.get("name"), email: f.get("email"), phone: f.get("phone"), consent: f.get("consent") === "on" } });
          myTickets.add(ticket.code);
          location.hash = `#/ticket/${ticket.code}?new=1`;
        } catch (e2) {
          err.textContent = errMsg(e2); err.hidden = false; btn.disabled = false;
        }
      });
    },
  };
}

export async function ticketPage({ code }, query) {
  const tk = await api(`/api/tickets/${code}`);
  const e = tk.event;
  myTickets.add(tk.code);
  const status = tk.checked_in_at ? "used" : tk.status;
  return {
    title: t("ticket"),
    html: html`
      <div class="container narrow page">
        ${query.get("new") ? html`<div class="notice ok">${icon("check")}${tk.status === "waitlist" ? t("waitlistDone", { n: tk.position }) : t("registeredDone")}</div>` : ""}
        <article class="ticket" style="--c:${e.color}">
          <header>
            ${dateTile(e)}
            <div><small>${t("cat_" + e.category)}</small><h1>${tr(e.title)}</h1></div>
          </header>
          <div class="ticket-body">
            <div class="qr ${status}">
              ${tk.qr_svg ? raw(tk.qr_svg) : icon("x", 64)}
              <code dir="ltr">${tk.code}</code>
            </div>
            <dl>
              <div><dt>${t("participant")}</dt><dd>${tk.name}</dd></div>
              <div><dt>${t("when")}</dt><dd>${fmt.day(e.starts_at)} · ${fmt.time(e.starts_at)}</dd></div>
              <div><dt>${t("where")}</dt><dd>${e.place}</dd></div>
              <div><dt>${t("status")}</dt><dd><span class="pill ${{ confirmed: "ok", waitlist: "warn", cancelled: "muted", used: "ok" }[status]}">${t("ticket_" + status, { n: tk.position })}</span></dd></div>
            </dl>
          </div>
          <footer>${tk.status === "confirmed" && !tk.checked_in_at ? t("showAtDoor") : tk.status === "waitlist" ? t("waitlistHint") : ""}</footer>
        </article>
        ${tk.status !== "cancelled" && !tk.checked_in_at && e.phase !== "past" ? html`
          <div class="ticket-actions">
            <button class="btn ghost" data-action="ics">${icon("calendar")}${t("addCalendar")}</button>
            <button class="btn ghost" data-action="print">${icon("print")}${t("print")}</button>
            <button class="btn ghost danger" data-action="cancel">${icon("x")}${t("cancelTicket")}</button>
          </div>` : ""}
        <p class="center"><a class="link" href="#/events/${e.slug}">${t("seeEvent")}</a></p>
      </div>`,
    mount(root) {
      root.addEventListener("click", async (ev) => {
        const action = ev.target.closest("[data-action]")?.dataset.action;
        if (action === "print") window.print();
        if (action === "ics") download(`${e.slug}.ics`, await api(`/api/tickets/${tk.code}/calendar.ics`), "text/calendar");
        if (action === "cancel" && confirm(t("cancelConfirm"))) {
          try { await api(`/api/tickets/${tk.code}/cancel`, { method: "POST" }); toast(t("cancelled")); location.hash = `#/ticket/${tk.code}`; window.dispatchEvent(new HashChangeEvent("hashchange")); }
          catch (e2) { toast(errMsg(e2), "bad"); }
        }
      });
    },
  };
}

export async function myTicketsPage() {
  const codes = myTickets.list();
  const tickets = (await Promise.all(codes.map((c) => api(`/api/tickets/${c}`).catch(() => null)))).filter(Boolean);
  return {
    title: t("myTickets"),
    html: html`
      <div class="container narrow page">
        <h1>${t("myTickets")}</h1>
        <p class="muted">${t("myTicketsLead")}</p>
        ${tickets.length ? html`<ul class="my-tickets">${tickets.map((tk) => html`
          <li><a href="#/ticket/${tk.code}" style="--c:${tk.event.color}">
            ${dateTile(tk.event)}
            <div><b>${tr(tk.event.title)}</b><small>${tk.name} · <code dir="ltr">${tk.code}</code></small></div>
            <span class="pill ${tk.checked_in_at ? "ok" : { confirmed: "ok", waitlist: "warn", cancelled: "muted" }[tk.status]}">${t("ticket_" + (tk.checked_in_at ? "used" : tk.status), { n: tk.position })}</span>
          </a></li>`)}</ul>` : html`<div class="empty">${icon("ticket", 30)}<p>${t("noTickets")}</p><a class="btn" href="#/">${t("seeEvents")}</a></div>`}
      </div>`,
  };
}
