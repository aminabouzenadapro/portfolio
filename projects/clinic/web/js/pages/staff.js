// Staff pages: sign-in, day agenda (reception and doctors), patients, statistics, SMS.
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEMO, api, session, signIn } from "../api.js";
import { t, tr, errMsg } from "../i18n.js";
import { Icon, addDays, fmt, minutes, today } from "../util.js";

export const homeFor = () => "/staff";

export const Login = {
  components: { Icon },
  setup() {
    const route = useRoute(), router = useRouter();
    const form = reactive({ email: "", password: "" });
    const error = ref("");
    async function go(email, password) {
      error.value = "";
      try { await signIn(email, password); router.replace(route.query.next || homeFor()); }
      catch (e) { error.value = errMsg(e); }
    }
    return { form, error, go, DEMO, t };
  },
  template: `
    <div class="auth">
      <form class="panel form" @submit.prevent="go(form.email, form.password)" novalidate>
        <span class="badge"><Icon name="shield" :size="26"/></span>
        <h1>{{ t('staffSpace') }}</h1>
        <p class="muted">{{ t('staffLead') }}</p>
        <label>{{ t('email') }}<input v-model="form.email" type="email" autocomplete="username" dir="ltr" required></label>
        <label>{{ t('password') }}<input v-model="form.password" type="password" autocomplete="current-password" dir="ltr" required></label>
        <p class="form-error" v-if="error">{{ error }}</p>
        <button class="btn big block">{{ t('signIn') }}</button>
        <div class="demo-logins" v-if="DEMO">
          <p>{{ t('demoAccounts') }}</p>
          <button type="button" class="btn ghost" @click="go('accueil@centre-elamel.dz', 'demo1234')"><Icon name="users"/>{{ t('roleReception') }}</button>
          <button type="button" class="btn ghost" @click="go('dr.mansouri@centre-elamel.dz', 'demo1234')"><Icon name="user"/>{{ t('roleDoctor') }}</button>
        </div>
      </form>
    </div>`,
};

const START = 7 * 60 + 30, END = 18 * 60, PX = 2.1; // timeline from 07:30 to 18:00, 2.1 px per minute

export const Agenda = {
  components: { Icon },
  setup() {
    const route = useRoute(), router = useRouter();
    const date = ref(route.query.date || today());
    const day = ref(null);
    const selected = ref(null);
    const note = ref("");
    const busy = ref(false);
    const flash = ref("");
    const reception = computed(() => session.user?.role === "reception");
    const nowMin = ref(0);
    const tick = () => { const d = new Date(); nowMin.value = d.getHours() * 60 + d.getMinutes(); };
    let timer;

    async function load() {
      day.value = await api(`/api/staff/agenda?date=${date.value}`);
      if (selected.value) selected.value = day.value.practitioners.flatMap((p) => p.appointments).find((a) => a.id === selected.value.id) || null;
    }
    onMounted(() => { tick(); timer = setInterval(tick, 30000); load(); });
    onUnmounted(() => clearInterval(timer));
    watch(date, () => { selected.value = null; router.replace({ query: { date: date.value } }); load(); });

    const top = (s) => (minutes(s.slice(11, 16)) - START) * PX;
    const height = (a) => Math.max(18, (minutes(a.ends_at.slice(11, 16)) - minutes(a.starts_at.slice(11, 16))) * PX - 2);
    const hourLines = Array.from({ length: (END - START) / 30 + 1 }, (_, i) => START + i * 30);
    const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const closureBox = (c) => {
      const from = c.starts_at.slice(0, 10) < date.value ? START : Math.max(START, minutes(c.starts_at.slice(11, 16)));
      const to = c.ends_at.slice(0, 10) > date.value ? END : Math.min(END, minutes(c.ends_at.slice(11, 16)));
      return { top: (from - START) * PX + "px", height: Math.max(0, to - from) * PX + "px" };
    };
    const age = (y) => (y ? new Date().getFullYear() - y : null);

    function select(a) { selected.value = a; note.value = a.note || ""; }
    async function setStatus(status) {
      busy.value = true;
      try { await api(`/api/staff/appointments/${selected.value.id}`, { method: "PATCH", body: { status } }); await load(); }
      catch (e) { flash.value = errMsg(e); }
      busy.value = false;
    }
    async function saveNote() {
      await api(`/api/staff/appointments/${selected.value.id}`, { method: "PATCH", body: { note: note.value } });
      flash.value = t("noteSaved"); await load();
      setTimeout(() => (flash.value = ""), 2000);
    }
    async function cancelAppt() {
      if (!confirm(t("cancelConfirmStaff"))) return;
      await api(`/api/staff/appointments/${selected.value.ref}/cancel`, { method: "POST" });
      selected.value = null; await load();
    }

    // New appointment (phone or walk-in) and blocked time, for the reception
    const modal = ref(null);
    const nb = reactive({ practitioner: "", type: "", time: "", source: "phone", name: "", phone: "", birth_year: "", slots: [], error: "", toCall: null });
    const allTypes = ref({});
    onMounted(async () => { for (const p of await api("/api/practitioners")) allTypes.value[p.slug] = p.types; });
    async function loadSlots() {
      nb.time = ""; nb.slots = [];
      if (nb.practitioner && nb.type) nb.slots = (await api(`/api/staff/availability?practitioner=${nb.practitioner}&type=${nb.type}&date=${date.value}`)).slots;
    }
    watch(() => [nb.practitioner, nb.type], loadSlots);
    function openNew(source) { Object.assign(nb, { practitioner: day.value.practitioners[0].slug, type: "", time: "", source, name: "", phone: "", birth_year: "", error: "" }); nb.type = allTypes.value[nb.practitioner]?.[0]?.code || ""; modal.value = "new"; }
    async function createAppt() {
      nb.error = "";
      try {
        await api("/api/staff/appointments", { method: "POST", body: { practitioner: nb.practitioner, type: nb.type, date: date.value, time: nb.time, source: nb.source, patient: { name: nb.name, phone: nb.phone, birth_year: nb.birth_year || null } } });
        modal.value = null; await load();
      } catch (e) { nb.error = errMsg(e); }
    }
    const blk = reactive({ practitioner_id: "", from: "12:00", to: "13:00", allDay: false, reason: "", error: "", toCall: null });
    function openBlock() { Object.assign(blk, { practitioner_id: day.value.practitioners[0].id, from: "12:00", to: "13:00", allDay: false, reason: "", error: "", toCall: null }); modal.value = "block"; }
    async function createBlock() {
      blk.error = "";
      try {
        const res = await api("/api/staff/closures", { method: "POST", body: {
          practitioner_id: blk.practitioner_id === "all" ? null : Number(blk.practitioner_id),
          starts_at: `${date.value} ${blk.allDay ? "00:00" : blk.from}`, ends_at: blk.allDay ? `${addDays(date.value, 1)} 00:00` : `${date.value} ${blk.to}`, reason: blk.reason,
        } });
        blk.toCall = res.to_call;
        await load();
        if (!res.to_call.length) modal.value = null;
      } catch (e) { blk.error = errMsg(e); }
    }
    async function removeClosure(c) {
      if (!confirm(t("removeBlock"))) return;
      await api(`/api/staff/closures/${c.id}`, { method: "DELETE" });
      await load();
    }

    return { date, day, selected, note, busy, flash, reception, nowMin, top, height, hourLines, hhmm, closureBox, age, select, setStatus, saveNote, cancelAppt,
      modal, nb, allTypes, openNew, createAppt, blk, openBlock, createBlock, removeClosure, addDays, today, minutes, START, END, PX, t, tr, fmt };
  },
  template: `
    <div class="agenda-page" v-if="day">
      <div class="container agenda-head">
        <div class="date-nav">
          <button class="icon-btn" @click="date = addDays(date, -1)" :aria-label="t('previousDay')"><Icon name="left" class="flip"/></button>
          <h1>{{ fmt.day(date) }}</h1>
          <button class="icon-btn" @click="date = addDays(date, 1)" :aria-label="t('nextDay')"><Icon name="right" class="flip"/></button>
          <button class="btn ghost small" v-if="date !== today()" @click="date = today()">{{ t('today') }}</button>
          <input type="date" v-model="date" :aria-label="t('chooseDate')">
        </div>
        <div class="counts">
          <span><b>{{ day.counts.total }}</b>{{ t('appointments') }}</span>
          <span class="c-arrived"><b>{{ day.counts.arrived }}</b>{{ t('status_arrived') }}</span>
          <span class="c-done"><b>{{ day.counts.done }}</b>{{ t('status_done') }}</span>
          <span class="c-no_show"><b>{{ day.counts.no_show }}</b>{{ t('status_no_show') }}</span>
        </div>
        <div class="head-actions" v-if="reception">
          <button class="btn" @click="openNew('phone')"><Icon name="plus"/>{{ t('newAppt') }}</button>
          <button class="btn ghost" @click="openNew('walk_in')"><Icon name="user"/>{{ t('walkIn') }}</button>
          <button class="btn ghost" @click="openBlock"><Icon name="ban"/>{{ t('blockTime') }}</button>
        </div>
      </div>

      <div class="container agenda-body">
        <div class="timeline-wrap">
          <div class="timeline" :style="{ '--cols': day.practitioners.length }">
            <div class="col-head gutter"></div>
            <div v-for="p in day.practitioners" :key="p.id" class="col-head" :style="{ '--c': p.color }"><b>{{ p.name }}</b><small>{{ tr(p.title) }} · {{ p.appointments.length }}</small></div>
            <div class="gutter hours" :style="{ height: (END - START) * PX + 'px' }">
              <span v-for="m in hourLines" :key="m" :style="{ top: (m - START) * PX + 'px' }">{{ m % 60 === 0 ? hhmm(m) : '' }}</span>
            </div>
            <div v-for="p in day.practitioners" :key="'c' + p.id" class="col" :style="{ height: (END - START) * PX + 'px', '--c': p.color }">
              <i v-for="m in hourLines" :key="m" class="line" :class="{ half: m % 60 }" :style="{ top: (m - START) * PX + 'px' }"></i>
              <div v-for="h in p.hours" :key="h.start" class="open" :style="{ top: (minutes(h.start) - START) * PX + 'px', height: (minutes(h.end) - minutes(h.start)) * PX + 'px' }"></div>
              <div v-for="c in p.closures" :key="'x' + c.id" class="closure" :style="closureBox(c)" :title="c.reason">
                <span>{{ c.reason || t('blocked') }}</span>
                <button v-if="reception" class="x" @click="removeClosure(c)" :aria-label="t('remove')"><Icon name="x" :size="12"/></button>
              </div>
              <button v-for="a in p.appointments" :key="a.id" class="appt" :class="[a.status, { sel: selected && selected.id === a.id, short: height(a) < 38 }]" :style="{ top: top(a.starts_at) + 'px', height: height(a) + 'px' }" @click="select(a)">
                <b>{{ fmt.time(a.starts_at) }} {{ a.patient.name }}</b><small>{{ tr(a.type.label) }}</small>
              </button>
              <i v-if="date === today() && nowMin > START && nowMin < END" class="now" :style="{ top: (nowMin - START) * PX + 'px' }"></i>
            </div>
          </div>
        </div>

        <aside class="panel detail" v-if="selected">
          <button class="icon-btn close" @click="selected = null" :aria-label="t('close')"><Icon name="x"/></button>
          <span class="pill" :class="selected.status">{{ t('status_' + selected.status) }}</span>
          <h2>{{ selected.patient.name }}</h2>
          <p class="muted"><span dir="ltr">{{ fmt.phone(selected.patient.phone) }}</span><template v-if="selected.patient.birth_year"> · {{ t('yearsOld', { n: age(selected.patient.birth_year) }) }}</template></p>
          <dl>
            <div><dt>{{ t('time') }}</dt><dd>{{ fmt.time(selected.starts_at) }} – {{ fmt.time(selected.ends_at) }}</dd></div>
            <div><dt>{{ t('reason') }}</dt><dd>{{ tr(selected.type.label) }}</dd></div>
            <div><dt>{{ t('source') }}</dt><dd>{{ t('source_' + selected.source) }}</dd></div>
            <div><dt>{{ t('reference') }}</dt><dd><code dir="ltr">{{ selected.ref }}</code></dd></div>
          </dl>
          <div class="status-buttons">
            <button class="btn small" :class="{ ghost: selected.status !== 'arrived' }" :disabled="busy" @click="setStatus('arrived')"><Icon name="user" :size="15"/>{{ t('markArrived') }}</button>
            <button class="btn small" :class="{ ghost: selected.status !== 'done' }" :disabled="busy" @click="setStatus('done')"><Icon name="check" :size="15"/>{{ t('markDone') }}</button>
            <button class="btn small" :class="{ ghost: selected.status !== 'no_show' }" :disabled="busy" @click="setStatus('no_show')"><Icon name="x" :size="15"/>{{ t('markNoShow') }}</button>
            <button class="btn small ghost" v-if="selected.status !== 'booked'" :disabled="busy" @click="setStatus('booked')">{{ t('reset') }}</button>
          </div>
          <label class="form">{{ t('note') }}<textarea v-model="note" rows="3" :placeholder="t('notePlaceholder')"></textarea></label>
          <div class="detail-actions">
            <button class="btn small ghost" @click="saveNote">{{ t('saveNote') }}</button>
            <router-link class="btn small ghost" :to="'/staff/patients?id=' + selected.patient.id">{{ t('history') }}</router-link>
            <button class="btn small ghost danger" v-if="reception && selected.status === 'booked'" @click="cancelAppt">{{ t('cancelAppt') }}</button>
          </div>
          <p class="flash" v-if="flash">{{ flash }}</p>
        </aside>
      </div>

      <div class="modal" v-if="modal" @click.self="modal = null" role="dialog" aria-modal="true">
        <form class="panel form" v-if="modal === 'new'" @submit.prevent="createAppt" novalidate>
          <h2>{{ nb.source === 'walk_in' ? t('walkIn') : t('newAppt') }} · {{ fmt.dayShort(date) }}</h2>
          <div class="grid2">
            <label>{{ t('doctor') }}<select v-model="nb.practitioner" @change="nb.type = (allTypes[nb.practitioner] || [])[0]?.code || ''"><option v-for="p in day.practitioners" :key="p.slug" :value="p.slug">{{ p.name }}</option></select></label>
            <label>{{ t('reason') }}<select v-model="nb.type"><option v-for="ty in allTypes[nb.practitioner] || []" :key="ty.code" :value="ty.code">{{ tr(ty.label) }} · {{ ty.minutes }} min</option></select></label>
          </div>
          <div class="slots compact"><button type="button" v-for="s in nb.slots" :key="s" class="slot" :class="{ on: s === nb.time }" @click="nb.time = s">{{ s }}</button><p v-if="!nb.slots.length" class="muted">{{ t('noSlotDay') }}</p></div>
          <div class="grid2">
            <label>{{ t('patientName') }}<input v-model="nb.name" required></label>
            <label>{{ t('mobile') }}<input v-model="nb.phone" type="tel" dir="ltr" required></label>
            <label>{{ t('birthYear') }}<input v-model="nb.birth_year" type="number" inputmode="numeric"></label>
          </div>
          <p class="form-error" v-if="nb.error">{{ nb.error }}</p>
          <div class="modal-actions"><button type="button" class="btn ghost" @click="modal = null">{{ t('close') }}</button><button class="btn" :disabled="!nb.time">{{ t('save') }}</button></div>
        </form>
        <form class="panel form" v-if="modal === 'block'" @submit.prevent="createBlock" novalidate>
          <h2>{{ t('blockTime') }} · {{ fmt.dayShort(date) }}</h2>
          <template v-if="!blk.toCall">
            <label>{{ t('who') }}<select v-model="blk.practitioner_id"><option value="all">{{ t('wholeClinic') }}</option><option v-for="p in day.practitioners" :key="p.id" :value="p.id">{{ p.name }}</option></select></label>
            <label class="check"><input type="checkbox" v-model="blk.allDay">{{ t('allDay') }}</label>
            <div class="grid2" v-if="!blk.allDay"><label>{{ t('from') }}<input type="time" v-model="blk.from"></label><label>{{ t('to') }}<input type="time" v-model="blk.to"></label></div>
            <label>{{ t('reasonBlock') }}<input v-model="blk.reason" :placeholder="t('reasonPlaceholder')"></label>
            <p class="form-error" v-if="blk.error">{{ blk.error }}</p>
            <div class="modal-actions"><button type="button" class="btn ghost" @click="modal = null">{{ t('close') }}</button><button class="btn">{{ t('block') }}</button></div>
          </template>
          <template v-else>
            <div class="notice warn"><Icon name="phone"/>{{ t('toCall', { n: blk.toCall.length }) }}</div>
            <ul class="to-call"><li v-for="c in blk.toCall" :key="c.ref"><b>{{ fmt.time(c.starts_at) }}</b> {{ c.name }} <span dir="ltr">{{ fmt.phone(c.phone) }}</span></li></ul>
            <div class="modal-actions"><button type="button" class="btn" @click="modal = null">{{ t('ok') }}</button></div>
          </template>
        </form>
      </div>
    </div>`,
};

export const Patients = {
  components: { Icon },
  setup() {
    const route = useRoute();
    const q = ref("");
    const list = ref([]);
    const patient = ref(null);
    let timer;
    const search = async () => { list.value = await api(`/api/staff/patients?q=${encodeURIComponent(q.value)}`); };
    watch(q, () => { clearTimeout(timer); timer = setTimeout(search, 200); });
    const open = async (id) => { patient.value = await api(`/api/staff/patients/${id}`); };
    onMounted(() => { search(); if (route.query.id) open(route.query.id); });
    return { q, list, patient, open, t, tr, fmt };
  },
  template: `
    <div class="container page patients">
      <h1>{{ t('patients') }}</h1>
      <div class="two-cols">
        <section class="panel">
          <label class="search"><Icon name="search" :size="16"/><input type="search" v-model="q" :placeholder="t('searchPatient')" :aria-label="t('searchPatient')"></label>
          <ul class="patient-list">
            <li v-for="p in list" :key="p.id"><button :class="{ on: patient && patient.id === p.id }" @click="open(p.id)">
              <b>{{ p.name }}</b><small dir="ltr">{{ fmt.phone(p.phone) }}</small>
              <span><small>{{ t('visitsN', { n: p.visits }) }}</small><small v-if="p.no_shows" class="warn">{{ t('noShowsN', { n: p.no_shows }) }}</small></span>
            </button></li>
            <li v-if="!list.length" class="muted">{{ t('noResults') }}</li>
          </ul>
        </section>
        <section class="panel" v-if="patient">
          <h2>{{ patient.name }}</h2>
          <p class="muted"><span dir="ltr">{{ fmt.phone(patient.phone) }}</span> · {{ patient.birth_year ? t('bornIn', { y: patient.birth_year }) : '' }} · {{ t('patientSince', { d: patient.since }) }}</p>
          <ol class="history">
            <li v-for="h in patient.history" :key="h.ref" :style="{ '--c': h.color }">
              <span class="pill" :class="h.status">{{ t('status_' + h.status) }}</span>
              <b>{{ fmt.dayShort(h.starts_at) }} · {{ fmt.time(h.starts_at) }}</b>
              <span>{{ h.practitioner }} · {{ tr(h.type) }}</span>
              <small v-if="h.note" class="note">{{ h.note }}</small>
            </li>
          </ol>
        </section>
        <section class="panel empty" v-else><Icon name="users" :size="30"/><p>{{ t('pickPatient') }}</p></section>
      </div>
    </div>`,
};

export const Stats = {
  components: { Icon },
  setup() {
    const s = ref(null);
    onMounted(async () => { s.value = await api("/api/staff/stats?days=30"); });
    const max = computed(() => Math.max(5, ...(s.value?.per_day || []).map((d) => d.count)));
    return { s, max, t, fmt };
  },
  template: `
    <div class="container page" v-if="s">
      <h1>{{ t('stats') }} <small class="muted">· {{ t('lastNDays', { n: s.days }) }}</small></h1>
      <div class="kpis">
        <div class="kpi"><Icon name="calendar"/><b>{{ s.appointments }}</b><span>{{ t('appointments') }}</span></div>
        <div class="kpi"><Icon name="x"/><b>{{ s.no_show_rate ?? '–' }} %</b><span>{{ t('noShowRate') }}</span></div>
        <div class="kpi"><Icon name="phone"/><b>{{ s.online_share ?? '–' }} %</b><span>{{ t('onlineShare') }}</span></div>
      </div>
      <section class="panel">
        <h2>{{ t('perDay') }}</h2>
        <div class="bars" role="img" :aria-label="t('perDay')">
          <div v-for="d in s.per_day" :key="d.date" :title="fmt.dayShort(d.date) + ' · ' + d.count"><span :style="{ height: (d.count / max * 100) + '%' }"></span><small>{{ new Date(d.date + 'T12:00').getDay() === 6 ? fmt.dayNum(d.date) : '' }}</small></div>
        </div>
      </section>
      <section class="panel">
        <h2>{{ t('occupancy') }}</h2>
        <div class="occ" v-for="p in s.practitioners" :key="p.id">
          <span>{{ p.name }}<small class="muted"> · {{ t('appointmentsN', { n: p.appointments }) }}</small></span>
          <span class="bar"><i :style="{ width: p.occupancy + '%', background: p.color }"></i></span><b>{{ p.occupancy }} %</b>
        </div>
      </section>
    </div>`,
};

export const Sms = {
  components: { Icon },
  setup() {
    const list = ref([]);
    const flash = ref("");
    const load = async () => { list.value = await api("/api/staff/sms"); };
    onMounted(load);
    async function remind() {
      const { sent } = await api("/api/staff/reminders", { method: "POST" });
      flash.value = t("remindersSent", { n: sent });
      await load();
    }
    return { list, flash, remind, t, fmt };
  },
  template: `
    <div class="container page narrow-wide">
      <div class="page-head"><div><h1>{{ t('smsTitle') }}</h1><p class="muted">{{ t('smsLead') }}</p></div>
        <button class="btn" @click="remind"><Icon name="sms"/>{{ t('sendReminders') }}</button></div>
      <div class="notice ok" v-if="flash"><Icon name="check"/>{{ flash }}</div>
      <ul class="sms-list">
        <li v-for="m in list" :key="m.id" class="panel"><span class="pill" :class="'k-' + m.kind">{{ t('sms_' + m.kind) }}</span><span class="sms-to" dir="ltr">{{ fmt.phone(m.phone) }}</span><small class="muted">{{ m.created_at.slice(0, 16).replace('T', ' ') }}</small><p dir="auto">{{ m.body }}</p></li>
        <li v-if="!list.length" class="muted">{{ t('noSms') }}</li>
      </ul>
    </div>`,
};
