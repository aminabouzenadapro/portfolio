// Patient pages: home, booking in three steps, appointment page (confirmation and cancellation).
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api.js";
import { i18n, t, tr, errMsg } from "../i18n.js";
import { Icon, SPECIALTY_ICON, download, fmt, ics, today } from "../util.js";

// Appointments booked from this browser: { ref: phone }, so patients find them without typing
const MINE = "elamel-mine";
export const mine = {
  all() { try { return JSON.parse(localStorage.getItem(MINE)) || {}; } catch { return {}; } },
  add(ref, phone) { const m = mine.all(); m[ref] = phone; try { localStorage.setItem(MINE, JSON.stringify(m)); } catch { /* storage unavailable */ } },
};

export const Home = {
  components: { Icon },
  setup() {
    const practitioners = ref([]);
    const next = reactive({});
    onMounted(async () => {
      practitioners.value = await api("/api/practitioners");
      for (const p of practitioners.value) {
        const a = await api(`/api/availability?practitioner=${p.slug}&type=${p.types[0].code}&days=14`);
        const day = a.days.find((d) => d.slots.length);
        next[p.slug] = day ? { date: day.date, time: day.slots[0] } : null;
      }
    });
    const nextLabel = (n) => n.date === today() ? t("todayAt", { time: n.time }) : `${fmt.dayShort(n.date)} · ${n.time}`;
    return { practitioners, next, nextLabel, t, tr, fmt, SPECIALTY_ICON };
  },
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">{{ t('heroEyebrow') }}</span>
          <h1>{{ t('heroTitle') }}</h1>
          <p class="lead">{{ t('heroLead') }}</p>
          <ul class="ticks">
            <li><Icon name="check" :size="16"/>{{ t('heroPoint1') }}</li>
            <li><Icon name="check" :size="16"/>{{ t('heroPoint2') }}</li>
            <li><Icon name="check" :size="16"/>{{ t('heroPoint3') }}</li>
          </ul>
          <router-link class="btn ghost light" to="/manage"><Icon name="calendar"/>{{ t('manageMine') }}</router-link>
        </div>
        <div class="hero-card">
          <h2>{{ t('chooseDoctor') }}</h2>
          <router-link v-for="p in practitioners" :key="p.slug" :to="'/book/' + p.slug" class="doc-row" :style="{ '--c': p.color }">
            <span class="doc-icon"><Icon :name="SPECIALTY_ICON[p.specialty]" :size="22"/></span>
            <span class="doc-text"><b>{{ p.name }}</b><small>{{ tr(p.title) }}</small></span>
            <span class="doc-next" v-if="next[p.slug]"><small>{{ t('nextFree') }}</small><b>{{ nextLabel(next[p.slug]) }}</b></span>
            <span class="doc-next" v-else-if="next[p.slug] === null"><small>{{ t('noSlot14') }}</small></span>
            <Icon name="right" class="flip"/>
          </router-link>
          <div v-if="!practitioners.length" class="skeleton" v-for="i in 3" :key="i"></div>
        </div>
      </div>
    </section>
    <section class="container section">
      <h2>{{ t('ourTeam') }}</h2>
      <div class="team">
        <article v-for="p in practitioners" :key="p.slug" class="panel doc-card" :style="{ '--c': p.color }">
          <span class="doc-icon big"><Icon :name="SPECIALTY_ICON[p.specialty]" :size="28"/></span>
          <h3>{{ p.name }}</h3>
          <p class="spec">{{ tr(p.title) }} · {{ p.room }}</p>
          <p class="muted">{{ tr(p.bio) }}</p>
          <ul class="types"><li v-for="ty in p.types" :key="ty.code"><span>{{ tr(ty.label) }}</span><small>{{ ty.minutes }} min · {{ fmt.money(ty.price_da) }}</small></li></ul>
          <router-link class="btn block" :to="'/book/' + p.slug">{{ t('book') }}</router-link>
        </article>
      </div>
    </section>
    <section class="container section info">
      <div class="panel"><Icon name="pin" :size="22"/><div><h3>{{ t('address') }}</h3><p>{{ t('addressText') }}</p></div></div>
      <div class="panel"><Icon name="clock" :size="22"/><div><h3>{{ t('openingHours') }}</h3><p>{{ t('openingText') }}</p></div></div>
      <div class="panel"><Icon name="phone" :size="22"/><div><h3>{{ t('reception') }}</h3><p dir="ltr">031 00 00 00</p></div></div>
    </section>`,
};

export const Book = {
  components: { Icon },
  setup() {
    const route = useRoute(), router = useRouter();
    const practitioner = ref(null);
    const type = ref(route.query.type || "");
    const days = ref([]);
    const date = ref("");
    const time = ref("");
    const from = ref(today());
    const loading = ref(false);
    const form = reactive({ name: "", phone: "", birth_year: "", email: "", lang: i18n.lang, consent: false });
    const error = ref("");
    const sending = ref(false);

    onMounted(async () => {
      practitioner.value = (await api("/api/practitioners")).find((p) => p.slug === route.params.slug);
      if (practitioner.value && !practitioner.value.types.some((x) => x.code === type.value)) type.value = "";
    });
    const chosenType = computed(() => practitioner.value?.types.find((x) => x.code === type.value));
    const step = computed(() => (!type.value ? 1 : !time.value ? 2 : 3));

    async function loadDays() {
      if (!type.value) return;
      loading.value = true;
      const res = await api(`/api/availability?practitioner=${route.params.slug}&type=${type.value}&from=${from.value}&days=14`);
      days.value = res.days;
      if (!days.value.some((d) => d.date === date.value && d.slots.length)) date.value = days.value.find((d) => d.slots.length)?.date || "";
      loading.value = false;
    }
    watch([type, from], () => { time.value = ""; loadDays(); });
    watch(practitioner, loadDays);

    const dayObj = computed(() => days.value.find((d) => d.date === date.value));
    const morning = computed(() => (dayObj.value?.slots || []).filter((s) => s < "13:00"));
    const afternoon = computed(() => (dayObj.value?.slots || []).filter((s) => s >= "13:00"));

    async function submit() {
      error.value = ""; sending.value = true;
      try {
        const a = await api("/api/appointments", { method: "POST", body: {
          practitioner: route.params.slug, type: type.value, date: date.value, time: time.value, consent: form.consent,
          patient: { name: form.name, phone: form.phone, birth_year: form.birth_year || null, email: form.email, lang: form.lang },
        } });
        mine.add(a.ref, form.phone);
        router.push({ path: "/rdv/" + a.ref, query: { new: 1 } });
      } catch (e) {
        error.value = errMsg(e);
        if (e.status === 409 && e.message.includes("no longer available")) { time.value = ""; loadDays(); }
      }
      sending.value = false;
    }
    const shiftWeek = (n) => { const d = new Date(from.value + "T12:00"); d.setDate(d.getDate() + n * 14); const s = d.toISOString().slice(0, 10); from.value = s < today() ? today() : s; };
    return { practitioner, type, chosenType, step, days, date, time, dayObj, morning, afternoon, loading, form, error, sending, submit, shiftWeek, from, today, t, tr, fmt, SPECIALTY_ICON };
  },
  template: `
    <div class="container page book" v-if="practitioner">
      <router-link to="/" class="back"><Icon name="back" :size="16" class="flip"/>{{ t('allDoctors') }}</router-link>
      <div class="book-grid">
        <aside class="panel summary" :style="{ '--c': practitioner.color }">
          <span class="doc-icon big"><Icon :name="SPECIALTY_ICON[practitioner.specialty]" :size="28"/></span>
          <h1>{{ practitioner.name }}</h1>
          <p class="spec">{{ tr(practitioner.title) }} · {{ practitioner.room }}</p>
          <dl>
            <div :class="{ done: chosenType }"><dt>{{ t('reason') }}</dt><dd>{{ chosenType ? tr(chosenType.label) + ' · ' + chosenType.minutes + ' min' : '—' }}</dd></div>
            <div :class="{ done: time }"><dt>{{ t('when') }}</dt><dd>{{ time ? fmt.day(date) + ' · ' + time : '—' }}</dd></div>
            <div v-if="chosenType"><dt>{{ t('price') }}</dt><dd>{{ fmt.money(chosenType.price_da) }} <small class="muted">{{ t('payAtClinic') }}</small></dd></div>
          </dl>
        </aside>

        <div>
          <ol class="steps"><li v-for="n in 3" :key="n" :class="{ on: step === n, done: step > n }"><span>{{ n }}</span>{{ t('step' + n) }}</li></ol>

          <section class="panel">
            <h2>{{ t('step1Title') }}</h2>
            <div class="type-grid">
              <button v-for="ty in practitioner.types" :key="ty.code" class="type-card" :class="{ on: type === ty.code }" @click="type = ty.code" :aria-pressed="type === ty.code">
                <b>{{ tr(ty.label) }}</b><small>{{ ty.minutes }} min · {{ fmt.money(ty.price_da) }}</small>
              </button>
            </div>
          </section>

          <section class="panel" v-if="type">
            <div class="panel-head">
              <h2>{{ t('step2Title') }}</h2>
              <div class="week-nav">
                <button class="icon-btn" @click="shiftWeek(-1)" :disabled="from <= today()" :aria-label="t('earlier')"><Icon name="left" class="flip"/></button>
                <button class="icon-btn" @click="shiftWeek(1)" :aria-label="t('later')"><Icon name="right" class="flip"/></button>
              </div>
            </div>
            <div class="days" :class="{ dim: loading }">
              <button v-for="d in days" :key="d.date" class="day" :class="{ on: d.date === date, empty: !d.slots.length }" :disabled="!d.slots.length" @click="date = d.date; time = ''">
                <small>{{ fmt.weekday(d.date) }}</small><b>{{ fmt.dayNum(d.date) }}</b><small>{{ fmt.month(d.date) }}</small>
                <i>{{ d.slots.length ? t('slotsN', { n: d.slots.length }) : t('closedShort') }}</i>
              </button>
            </div>
            <div v-if="dayObj" class="slots-wrap">
              <h3>{{ fmt.day(date) }}</h3>
              <template v-for="[label, list] in [[t('morning'), morning], [t('afternoon'), afternoon]]" :key="label">
                <div v-if="list.length" class="slot-group">
                  <small>{{ label }}</small>
                  <div class="slots"><button v-for="s in list" :key="s" class="slot" :class="{ on: s === time }" @click="time = s">{{ s }}</button></div>
                </div>
              </template>
            </div>
            <p v-else-if="!loading" class="muted">{{ t('noSlot14') }}</p>
          </section>

          <section class="panel" v-if="time">
            <h2>{{ t('step3Title') }}</h2>
            <form class="form grid2" @submit.prevent="submit" novalidate>
              <label>{{ t('patientName') }}<input v-model="form.name" autocomplete="name" required></label>
              <label>{{ t('mobile') }}<input v-model="form.phone" type="tel" autocomplete="tel" dir="ltr" placeholder="0661 23 45 67" required></label>
              <label>{{ t('birthYear') }}<input v-model="form.birth_year" type="number" min="1900" :max="new Date().getFullYear()" inputmode="numeric" placeholder="1990"></label>
              <label>{{ t('emailOptional') }}<input v-model="form.email" type="email" autocomplete="email" dir="ltr"></label>
              <label>{{ t('smsLang') }}<select v-model="form.lang"><option value="fr">Français</option><option value="ar">العربية</option><option value="en">English</option></select></label>
              <label class="check full"><input type="checkbox" v-model="form.consent">{{ t('consent') }}</label>
              <p class="form-error full" role="alert" v-if="error">{{ error }}</p>
              <button class="btn big full" :disabled="sending">{{ sending ? t('sending') : t('confirmBooking', { time }) }}</button>
            </form>
          </section>
        </div>
      </div>
    </div>`,
};

export const Appointment = {
  components: { Icon },
  setup() {
    const route = useRoute(), router = useRouter();
    const a = ref(null);
    const phone = ref(mine.all()[route.params.ref] || "");
    const error = ref("");
    const isNew = computed(() => route.query.new);
    async function load() {
      error.value = "";
      try { a.value = await api(`/api/appointments/${route.params.ref}/lookup`, { method: "POST", body: { phone: phone.value } }); mine.add(a.value.ref, phone.value); }
      catch (e) { error.value = errMsg(e); }
    }
    onMounted(() => { if (phone.value) load(); });
    async function cancel() {
      if (!confirm(t("cancelConfirm"))) return;
      try { a.value = await api(`/api/appointments/${a.value.ref}/cancel`, { method: "POST", body: { phone: phone.value } }); router.replace("/rdv/" + a.value.ref); }
      catch (e) { error.value = errMsg(e); }
    }
    const calendar = () => download(`rdv-${a.value.ref}.ics`, ics(a.value, `RDV ${a.value.practitioner.name}`), "text/calendar");
    return { a, phone, error, isNew, load, cancel, calendar, print: () => window.print(), t, tr, fmt };
  },
  template: `
    <div class="container page narrow">
      <div v-if="!a" class="panel">
        <h1>{{ t('myAppointment') }}</h1>
        <p class="muted">{{ t('enterPhone', { ref: $route.params.ref }) }}</p>
        <form class="form" @submit.prevent="load"><label>{{ t('mobile') }}<input v-model="phone" type="tel" dir="ltr" required></label>
          <p class="form-error" v-if="error">{{ error }}</p><button class="btn">{{ t('show') }}</button></form>
      </div>
      <template v-else>
        <div v-if="isNew && a.status === 'booked'" class="notice ok"><Icon name="check"/>{{ t('bookedDone') }}</div>
        <article class="ticket" :class="a.status" :style="{ '--c': a.practitioner.color }">
          <header>
            <span class="big-date"><b>{{ fmt.dayNum(a.starts_at) }}</b><small>{{ fmt.month(a.starts_at) }}</small></span>
            <div><small>{{ fmt.day(a.starts_at) }}</small><h1>{{ fmt.time(a.starts_at) }}</h1></div>
            <span class="pill" :class="a.status">{{ t('status_' + a.status) }}</span>
          </header>
          <dl>
            <div><dt>{{ t('doctor') }}</dt><dd>{{ a.practitioner.name }} <small>· {{ tr(a.practitioner.title) }}</small></dd></div>
            <div><dt>{{ t('reason') }}</dt><dd>{{ tr(a.type.label) }} <small>· {{ fmt.money(a.type.price_da) }}</small></dd></div>
            <div><dt>{{ t('patient') }}</dt><dd>{{ a.patient.name }} <small dir="ltr">{{ a.patient.phone }}</small></dd></div>
            <div><dt>{{ t('where') }}</dt><dd>Centre médical El Amel · {{ a.practitioner.room }}</dd></div>
            <div><dt>{{ t('reference') }}</dt><dd><code dir="ltr">{{ a.ref }}</code></dd></div>
          </dl>
          <footer v-if="a.status === 'booked'"><Icon name="sms" :size="16"/>{{ t('smsInfo') }}</footer>
        </article>
        <p class="form-error center" v-if="error">{{ error }}</p>
        <div class="actions" v-if="a.status === 'booked'">
          <button class="btn ghost" @click="calendar"><Icon name="calendar"/>{{ t('addCalendar') }}</button>
          <button class="btn ghost" @click="print"><Icon name="print"/>{{ t('print') }}</button>
          <button class="btn ghost danger" v-if="a.can_cancel" @click="cancel"><Icon name="x"/>{{ t('cancelAppt') }}</button>
        </div>
        <p class="muted center small" v-if="a.status === 'booked' && !a.can_cancel">{{ t('lateCancel') }}</p>
        <p class="center"><router-link class="link" :to="'/book/' + a.practitioner.slug">{{ t('bookAnother') }}</router-link></p>
      </template>
    </div>`,
};

export const Manage = {
  components: { Icon },
  setup() {
    const router = useRouter();
    const form = reactive({ ref: "", phone: "" });
    const error = ref("");
    const list = ref([]);
    onMounted(async () => {
      const m = mine.all();
      list.value = (await Promise.all(Object.entries(m).map(([ref, phone]) => api(`/api/appointments/${ref}/lookup`, { method: "POST", body: { phone } }).catch(() => null)))).filter(Boolean)
        .sort((x, y) => y.starts_at.localeCompare(x.starts_at));
    });
    async function find() {
      error.value = "";
      try {
        const a = await api(`/api/appointments/${encodeURIComponent(form.ref.trim())}/lookup`, { method: "POST", body: { phone: form.phone } });
        mine.add(a.ref, form.phone);
        router.push("/rdv/" + a.ref);
      } catch (e) { error.value = errMsg(e); }
    }
    return { form, error, find, list, t, tr, fmt };
  },
  template: `
    <div class="container page narrow">
      <h1>{{ t('manageMine') }}</h1>
      <div class="panel" v-if="list.length">
        <h2>{{ t('fromThisPhone') }}</h2>
        <ul class="appt-list">
          <li v-for="a in list" :key="a.ref"><router-link :to="'/rdv/' + a.ref" :style="{ '--c': a.practitioner.color }">
            <span class="big-date small"><b>{{ fmt.dayNum(a.starts_at) }}</b><small>{{ fmt.month(a.starts_at) }}</small></span>
            <span><b>{{ fmt.time(a.starts_at) }} · {{ a.practitioner.name }}</b><small>{{ tr(a.type.label) }}</small></span>
            <span class="pill" :class="a.status">{{ t('status_' + a.status) }}</span>
          </router-link></li>
        </ul>
      </div>
      <form class="panel form" @submit.prevent="find" novalidate>
        <h2>{{ t('findByRef') }}</h2>
        <label>{{ t('reference') }}<input v-model="form.ref" dir="ltr" placeholder="EA-XXXXXX" required></label>
        <label>{{ t('mobile') }}<input v-model="form.phone" type="tel" dir="ltr" required></label>
        <p class="form-error" v-if="error">{{ error }}</p>
        <button class="btn">{{ t('show') }}</button>
      </form>
    </div>`,
};
