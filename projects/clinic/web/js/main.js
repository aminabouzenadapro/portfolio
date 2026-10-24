// Starts the API (the PHP app running in the browser in demo mode), then mounts the Vue app.
import { createApp, ref } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { DEMO, restoreSession, session, signIn, signOut } from "./api.js";
import { resetDemoData, startPhp } from "./php-api.js";
import { LANGS, i18n, setLang, t } from "./i18n.js";
import { Icon } from "./util.js";
import { Appointment, Book, Home, Manage } from "./pages/public.js";
import { Agenda, Login, Patients, Sms, Stats } from "./pages/staff.js";

const staff = (roles) => ({ requiresStaff: true, roles });
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: "/", component: Home },
    { path: "/book/:slug", component: Book },
    { path: "/rdv/:ref", component: Appointment },
    { path: "/manage", component: Manage },
    { path: "/staff/login", component: Login },
    { path: "/staff", component: Agenda, meta: staff(["reception", "doctor"]) },
    { path: "/staff/patients", component: Patients, meta: staff(["reception", "doctor"]) },
    { path: "/staff/stats", component: Stats, meta: staff(["reception"]) },
    { path: "/staff/sms", component: Sms, meta: staff(["reception"]) },
    { path: "/:rest(.*)", redirect: "/" },
  ],
});
router.beforeEach((to) => {
  if (!to.meta.requiresStaff) return true;
  if (!session.user) return { path: "/staff/login", query: { next: to.fullPath } };
  if (!to.meta.roles.includes(session.user.role)) return "/staff";
  return true;
});

const Shell = {
  components: { Icon },
  setup() {
    const menu = ref(false);
    router.afterEach(() => { menu.value = false; });
    async function demoLogin(email) {
      await signIn(email, "demo1234");
      router.push("/staff");
    }
    async function reset() {
      if (!confirm(t("resetConfirm"))) return;
      await resetDemoData();
      signOut();
      location.hash = "#/";
      location.reload();
    }
    function logout() { signOut(); router.push("/"); }
    return { session, LANGS, i18n, setLang, t, DEMO, demoLogin, reset, logout, menu };
  },
  template: `
    <div class="demo-bar" v-if="DEMO">
      <div class="container demo-inner">
        <span class="tag">{{ t('demoTag') }}</span><span class="demo-text">{{ t('demoText') }}</span>
        <span class="demo-actions">
          <button @click="demoLogin('accueil@centre-elamel.dz')"><Icon name="users" :size="14"/>{{ t('roleReception') }}</button>
          <button @click="demoLogin('dr.mansouri@centre-elamel.dz')"><Icon name="user" :size="14"/>{{ t('roleDoctor') }}</button>
          <button @click="reset"><Icon name="refresh" :size="14"/>{{ t('reset') }}</button>
        </span>
      </div>
    </div>
    <header class="header">
      <div class="container header-inner">
        <router-link to="/" class="brand"><span class="cross"></span><span>El Amel<small>{{ t('brandSub') }}</small></span></router-link>
        <nav class="nav" :aria-label="t('menu')">
          <template v-if="!session.user">
            <router-link to="/" exact-active-class="active">{{ t('navBook') }}</router-link>
            <router-link to="/manage" active-class="active">{{ t('navManage') }}</router-link>
          </template>
          <template v-else>
            <router-link to="/staff" exact-active-class="active">{{ t('navAgenda') }}</router-link>
            <router-link to="/staff/patients" active-class="active">{{ t('patients') }}</router-link>
            <router-link v-if="session.user.role === 'reception'" to="/staff/stats" active-class="active">{{ t('stats') }}</router-link>
            <router-link v-if="session.user.role === 'reception'" to="/staff/sms" active-class="active">SMS</router-link>
          </template>
        </nav>
        <div class="header-end">
          <div class="langs" role="group" :aria-label="t('language')">
            <button v-for="l in LANGS" :key="l.code" :lang="l.code" :class="{ on: i18n.lang === l.code }" :aria-pressed="i18n.lang === l.code" @click="setLang(l.code)">{{ l.label }}</button>
          </div>
          <template v-if="session.user">
            <span class="who"><b>{{ session.user.name.split(' ')[0] }}</b><small>{{ t(session.user.role === 'reception' ? 'roleReception' : 'roleDoctor') }}</small></span>
            <button class="icon-btn" @click="logout" :title="t('signOut')" :aria-label="t('signOut')"><Icon name="logout"/></button>
          </template>
          <router-link v-else class="btn small ghost" to="/staff/login">{{ t('staffSpace') }}</router-link>
        </div>
      </div>
    </header>
    <main id="main"><router-view :key="$route.path + i18n.lang"/></main>
    <footer class="footer"><div class="container">{{ t('footer') }}</div></footer>`,
};

// Boot screen while PHP starts in the browser
const Boot = {
  components: { Icon },
  setup() {
    const step = ref("runtime");
    const failed = ref("");
    const STEPS = ["runtime", "app", "data"];
    return { step, failed, STEPS, t };
  },
  template: `
    <div class="boot"><div class="boot-card">
      <span class="logo"><span class="cross big"></span></span>
      <h1>{{ t('bootTitle') }}</h1>
      <p>{{ failed || t('bootLead') }}</p>
      <ol><li v-for="(s, i) in STEPS" :key="s" :class="{ done: STEPS.indexOf(step) > i, now: step === s }"><span class="tick"></span>{{ t('boot_' + s) }}</li></ol>
      <p class="muted small">{{ t('bootHint') }}</p>
    </div></div>`,
};

async function start() {
  if (DEMO) {
    const boot = createApp(Boot);
    const vm = boot.mount("#app");
    try {
      await startPhp((s) => { vm.step = s; });
    } catch (e) {
      vm.failed = t("bootFailed") + " (" + e.message + ")";
      return;
    }
    boot.unmount();
  }
  await restoreSession();
  createApp(Shell).use(router).mount("#app");
}
start();
