import { auth } from "/static/js/firebase-config.js";
import { logoutEverywhere } from "/static/js/auth-session.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getUserProgressData } from "/static/js/progress-data.js";


/**
 * Escapes HTML special characters to prevent XSS when inserting
 * user-controlled or database-sourced strings via innerHTML.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
const progressTranslations = {
  ar: {
    dir: "rtl",
    lang: "ar",
    sidebarSubtitle: "متابعة التقدم",
    navDashboard: "الرئيسية",
    navExercises: "التمارين",
    navProgress: "التقدم",
    navAvc: "الوقاية من السكتة الدماغية",
    navMotor: "الحركي والتقييم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",

    heroBadge: "🌿 مساري",
    title: "مساري",
    subtitle: "كل مجهود صغير له قيمة. هذه الصفحة تعرض تقدمك الحقيقي المحفوظ في قاعدة البيانات.",

    completedSessionsLabel: "جلسات منجزة",
    completedExercisesLabel: "تمارين مكتملة",
    totalTimeLabel: "الوقت المقضي",
    lastActivityLabel: "آخر جلسة",

    categoryTitle: "ما الذي عملت عليه",

    journeyTitle: "طريق التقدم",
    journeyStart: "البداية",
    journeyStep1: "خطوات أولى",
    journeyStep2: "استمرارية",
    journeyStep3: "ثقة",
    journeyNoteStart: "أنت في البداية، وكل خطوة مهمة.",
    journeyNote1: "لقد بدأت بشكل جميل، واصل بهدوء.",
    journeyNote2: "أنت تبني روتينًا جيدًا، هذا ممتاز.",
    journeyNote3: "تقدم رائع، استمر بنفس النسق.",

    weekTitle: "هذا الأسبوع",
    weekNoteZero: "لم يتم تسجيل أي يوم نشط هذا الأسبوع بعد.",
    weekNoteOne: "يوم نشط واحد هذا الأسبوع.",
    weekNoteMany: "أيام نشطة هذا الأسبوع.",

    badgesTitle: "نجاحاتي الصغيرة",

    historyTitle: "سجل الجلسات",
    emptyHistory: "لا توجد جلسات محفوظة بعد.",
    noCategoryData: "لا توجد بيانات فئات متاحة بعد.",

    thDate: "التاريخ",
    thStatus: "الحالة",
    thDuration: "المدة",
    thCompleted: "المكتمل",

    statusCompleted: "مكتملة",
    statusStarted: "قيد التنفيذ",
    statusCancelled: "ملغاة",

    badgeFirstSession: "⭐ أول جلسة",
    badgeThreeSessions: "🌿 3 جلسات",
    badgeTenExercises: "🎯 10 تمارين",
    badgeThirtyMinutes: "⏱️ 30 دقيقة",
    badgeComeback: "✨ نشاط اليوم",
    badgeActiveWeek: "📅 أسبوع نشط",

    category_memory: "الذاكرة",
    category_attention: "الانتباه",
    category_language: "اللغة",
    category_coordination: "التنسيق",
    category_trajectory: "المسار",
    category_quiz: "السرعة والاختبار",
    category_memory_short: "الذاكرة",
    category_attention_short: "الانتباه",
    category_coordination_short: "التنسيق",
    category_trajectory_short: "المسار",
    category_language_short: "اللغة",
    category_quiz_short: "السرعة"
  },

  fr: {
    dir: "ltr",
    lang: "fr",
    sidebarSubtitle: "Suivi de progression",
    navDashboard: "Accueil",
    navExercises: "Exercices",
    navProgress: "Progrès",
    navAvc: "Prévention AVC",
    navMotor: "Moteur et bilan",
    navSettings: "Paramètres",
    logout: "Se déconnecter",

    heroBadge: "🌿 Mon parcours",
    title: "Mon parcours",
    subtitle: "Chaque petit effort compte. Cette page montre vos vraies données enregistrées.",

    completedSessionsLabel: "Séances faites",
    completedExercisesLabel: "Exercices terminés",
    totalTimeLabel: "Temps passé",
    lastActivityLabel: "Dernière séance",

    categoryTitle: "Ce que j’ai travaillé",

    journeyTitle: "Le chemin du progrès",
    journeyStart: "Début",
    journeyStep1: "Premiers pas",
    journeyStep2: "Régularité",
    journeyStep3: "Confiance",
    journeyNoteStart: "Vous êtes au début, chaque pas compte.",
    journeyNote1: "Vous avez bien commencé, continuez doucement.",
    journeyNote2: "Vous installez une bonne régularité.",
    journeyNote3: "Très belle progression, continuez comme ça.",

    weekTitle: "Cette semaine",
    weekNoteZero: "Aucun jour actif enregistré cette semaine pour le moment.",
    weekNoteOne: "1 jour actif cette semaine.",
    weekNoteMany: "jours actifs cette semaine.",

    badgesTitle: "Mes petites victoires",

    historyTitle: "Historique des séances",
    emptyHistory: "Aucune séance enregistrée pour le moment.",
    noCategoryData: "Aucune donnée de catégorie disponible pour le moment.",

    thDate: "Date",
    thStatus: "Statut",
    thDuration: "Durée",
    thCompleted: "Terminés",

    statusCompleted: "Terminée",
    statusStarted: "En cours",
    statusCancelled: "Annulée",

    badgeFirstSession: "⭐ Première séance",
    badgeThreeSessions: "🌿 3 séances",
    badgeTenExercises: "🎯 10 exercices",
    badgeThirtyMinutes: "⏱️ 30 minutes",
    badgeComeback: "✨ Activité aujourd’hui",
    badgeActiveWeek: "📅 Semaine active",

    category_memory: "Mémoire",
    category_attention: "Attention",
    category_language: "Langage",
    category_coordination: "Coordination",
    category_trajectory: "Trajectoire",
    category_quiz: "Quiz & rapidité",
    category_memory_short: "Mémoire",
    category_attention_short: "Attention",
    category_coordination_short: "Coordination",
    category_trajectory_short: "Trajectoire",
    category_language_short: "Langage",
    category_quiz_short: "Quiz & rapidité"
  },

  en: {
    dir: "ltr",
    lang: "en",
    sidebarSubtitle: "Progress tracking",
    navDashboard: "Home",
    navExercises: "Exercises",
    navProgress: "Progrès",
    navAvc: "Stroke Prevention",
    navMotor: "Motor & Assessment",
    navSettings: "Settings",
    logout: "Log out",

    heroBadge: "🌿 My journey",
    title: "My journey",
    subtitle: "Every small effort matters. This page shows your real saved progress data.",

    completedSessionsLabel: "Sessions done",
    completedExercisesLabel: "Completed exercises",
    totalTimeLabel: "Time spent",
    lastActivityLabel: "Last session",

    categoryTitle: "What I worked on",

    journeyTitle: "The progress path",
    journeyStart: "Start",
    journeyStep1: "First steps",
    journeyStep2: "Consistency",
    journeyStep3: "Confidence",
    journeyNoteStart: "You are at the beginning, every step matters.",
    journeyNote1: "You started well, keep going gently.",
    journeyNote2: "You are building good consistency.",
    journeyNote3: "Great progress, keep it up.",

    weekTitle: "This week",
    weekNoteZero: "No active day recorded this week yet.",
    weekNoteOne: "1 active day this week.",
    weekNoteMany: "active days this week.",

    badgesTitle: "My small wins",

    historyTitle: "Session history",
    emptyHistory: "No session recorded yet.",
    noCategoryData: "No category data available yet.",

    thDate: "Date",
    thStatus: "Status",
    thDuration: "Duration",
    thCompleted: "Completed",

    statusCompleted: "Completed",
    statusStarted: "Started",
    statusCancelled: "Cancelled",

    badgeFirstSession: "⭐ First session",
    badgeThreeSessions: "🌿 3 sessions",
    badgeTenExercises: "🎯 10 exercises",
    badgeThirtyMinutes: "⏱️ 30 minutes",
    badgeComeback: "✨ Active today",
    badgeActiveWeek: "📅 Active week",

    category_memory: "Memory",
    category_attention: "Attention",
    category_language: "Language",
    category_coordination: "Coordination",
    category_trajectory: "Trajectory",
    category_quiz: "Quiz & speed",
    category_memory_short: "Memory",
    category_attention_short: "Attention",
    category_coordination_short: "Coordination",
    category_trajectory_short: "Trajectory",
    category_language_short: "Language",
    category_quiz_short: "Quiz & speed"
  }
};

let currentProgressLang = "ar";
let latestProgressData = null;

const CATEGORY_ORDER = [
  "memory",
  "attention",
  "coordination",
  "trajectory",
  "language",
  "quiz"
];

function t(key) {
  return progressTranslations[currentProgressLang][key] || key;
}

function safeValue(value) {
  if (value === undefined || value === null || value === "") return "—";
  return value;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatDuration(totalSeconds) {
  if (typeof totalSeconds !== "number" || totalSeconds <= 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function translateSessionStatus(status) {
  if (status === "completed") return t("statusCompleted");
  if (status === "started") return t("statusStarted");
  if (status === "cancelled") return t("statusCancelled");
  return escapeHtml(safeValue(status));
}

function getJourneyStep(completedSessions) {
  if (completedSessions <= 0) {
    return { index: 0, fill: "6%", note: t("journeyNoteStart") };
  }
  if (completedSessions <= 2) {
    return { index: 1, fill: "34%", note: t("journeyNote1") };
  }
  if (completedSessions <= 5) {
    return { index: 2, fill: "68%", note: t("journeyNote2") };
  }
  return { index: 3, fill: "100%", note: t("journeyNote3") };
}

function getCategoryLabel(category) {
  return t(`category_${category}_short`);
}

function getCategoryEmoji(category) {
  const map = {
    memory: "🧠",
    attention: "🎯",
    coordination: "🤲",
    trajectory: "🌀",
    language: "💬",
    quiz: "⚡"
  };
  return map[category] || "✨";
}

function buildWeekActivity(sessionHistory) {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - diffToMonday);

  const labels = currentProgressLang === "ar"
    ? ["ن", "ث", "ر", "خ", "ج", "س", "ح"]
    : currentProgressLang === "fr"
      ? ["L", "M", "M", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const hasActivity = (sessionHistory || []).some((item) => {
      if (!item.startedAt) return false;
      const d = new Date(item.startedAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    return { label, active: hasActivity };
  });
}

function buildBadges(summary, weekActiveDays) {
  const badges = [];

  if ((summary.completedSessions || 0) >= 1) badges.push(t("badgeFirstSession"));
  if ((summary.completedSessions || 0) >= 3) badges.push(t("badgeThreeSessions"));
  if ((summary.completedExercises || 0) >= 10) badges.push(t("badgeTenExercises"));

  const totalDuration =
    (summary.totalSessionDurationSeconds || 0) +
    (summary.totalExerciseDurationSeconds || 0);

  if (totalDuration >= 1800) badges.push(t("badgeThirtyMinutes"));

  if (summary.lastActivityAt) {
    const last = new Date(summary.lastActivityAt);
    const now = new Date();
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    ) {
      badges.push(t("badgeComeback"));
    }
  }

  if (weekActiveDays >= 3) badges.push(t("badgeActiveWeek"));

  if (badges.length === 0) {
    badges.push(currentProgressLang === "ar" ? "🌱 بداية جميلة" : currentProgressLang === "fr" ? "🌱 Un joli début" : "🌱 A lovely start");
  }

  return badges;
}

function renderCategoryAverages(categoryAverages) {
  const container = document.getElementById("category-list");
  container.innerHTML = "";

  const normalized = CATEGORY_ORDER.map((category) => {
    const values = categoryAverages?.[category] || {};
    return {
      category,
      averagePercent: typeof values.averagePercent === "number" ? Math.round(values.averagePercent) : 0,
      completedCount: typeof values.completedCount === "number" ? values.completedCount : 0
    };
  });

  normalized.forEach(({ category, averagePercent, completedCount }) => {
    const item = document.createElement("div");
    item.className = "progress-category-card progress-category-card-small";
    item.innerHTML = `
      <div class="progress-category-top">
        <div class="progress-category-name">
          <span class="progress-category-emoji">${getCategoryEmoji(category)}</span>
          <span>${getCategoryLabel(category)}</span>
        </div>
        <strong>${averagePercent}%</strong>
      </div>
      <div class="progress-category-bar">
        <span style="width:${averagePercent}%"></span>
      </div>
      <div class="progress-category-meta">${completedCount}</div>
    `;
    container.appendChild(item);
  });
}

function renderWeek(sessionHistory) {
  const grid = document.getElementById("week-grid");
  const note = document.getElementById("week-note");
  const days = buildWeekActivity(sessionHistory);
  const activeCount = days.filter((d) => d.active).length;

  grid.innerHTML = days.map((day) => `
    <div class="progress-week-day ${day.active ? "active" : ""}">
      <span>${day.label}</span>
      <i></i>
    </div>
  `).join("");

  if (activeCount === 0) {
    note.textContent = t("weekNoteZero");
  } else if (activeCount === 1) {
    note.textContent = t("weekNoteOne");
  } else {
    note.textContent = `${activeCount} ${t("weekNoteMany")}`;
  }

  return activeCount;
}

function renderBadges(summary, weekActiveDays) {
  const wrap = document.getElementById("badges-wrap");
  const badges = buildBadges(summary, weekActiveDays);
  wrap.innerHTML = badges.map((badge) => `<span class="progress-badge-chip">${badge}</span>`).join("");
}

function renderJourney(summary) {
  const step = getJourneyStep(summary.completedSessions || 0);
  const line = document.getElementById("journey-line-fill");
  const note = document.getElementById("journey-note");

  line.style.width = step.fill;
  note.textContent = step.note;

  [0, 1, 2, 3].forEach((index) => {
    const node = document.getElementById(`journey-node-${index}`);
    if (node) node.classList.toggle("active", index <= step.index);
  });

  document.getElementById("journey-step-0").textContent = t("journeyStart");
  document.getElementById("journey-step-1").textContent = t("journeyStep1");
  document.getElementById("journey-step-2").textContent = t("journeyStep2");
  document.getElementById("journey-step-3").textContent = t("journeyStep3");
}

function renderSessionHistory(history) {
  const body = document.getElementById("history-body");
  const emptyBox = document.getElementById("history-empty");
  const table = document.getElementById("history-table");

  body.innerHTML = "";

  if (!history || history.length === 0) {
    table.style.display = "none";
    emptyBox.style.display = "block";
    emptyBox.textContent = t("emptyHistory");
    return;
  }

  table.style.display = "table";
  emptyBox.style.display = "block";
  emptyBox.textContent = "";
  emptyBox.style.display = "none";

  const sorted = [...history].sort((a, b) => {
    return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
  });

  sorted.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(item.startedAt)}</td>
      <td><span class="progress-history-status-chip ${escapeHtml(item.status || "started")}">${translateSessionStatus(item.status)}</span></td>
      <td>${formatDuration(item.durationSeconds)}</td>
      <td>${safeValue(item.completedExerciseCount)}</td>
    `;
    body.appendChild(tr);
  });
}

function applyTranslations() {
  document.documentElement.lang = progressTranslations[currentProgressLang].lang;
  document.documentElement.dir = progressTranslations[currentProgressLang].dir;

  document.getElementById("sidebar-subtitle").textContent = t("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = t("navDashboard");
  document.getElementById("nav-exercises").textContent = t("navExercises");
  document.getElementById("nav-progress").textContent = t("navProgress");
  document.getElementById("nav-avc").textContent = t("navAvc");
  document.getElementById("nav-motor").textContent = t("navMotor");
  document.getElementById("nav-settings").textContent = t("navSettings");
  document.getElementById("logout-text").textContent = t("logout");

  const heroBadge = document.getElementById("progress-hero-badge");
    if (heroBadge) heroBadge.textContent = t("heroBadge");
  document.getElementById("progress-title").textContent = t("title");
  document.getElementById("progress-subtitle").textContent = t("subtitle");

  document.getElementById("completed-sessions-label").textContent = t("completedSessionsLabel");
  document.getElementById("completed-exercises-label").textContent = t("completedExercisesLabel");
  document.getElementById("total-time-label").textContent = t("totalTimeLabel");
  document.getElementById("last-activity-label").textContent = t("lastActivityLabel");

  document.getElementById("category-title").textContent = t("categoryTitle");
  document.getElementById("journey-title").textContent = t("journeyTitle");
  document.getElementById("week-title").textContent = t("weekTitle");
  document.getElementById("badges-title").textContent = t("badgesTitle");

  document.getElementById("history-title").textContent = t("historyTitle");
  document.getElementById("th-date").textContent = t("thDate");
  document.getElementById("th-status").textContent = t("thStatus");
  document.getElementById("th-duration").textContent = t("thDuration");
  document.getElementById("th-completed").textContent = t("thCompleted");

  document.querySelectorAll(".slp").forEach((btn) => {
    btn.classList.remove("on");
    if (btn.textContent.trim().toLowerCase() === currentProgressLang) {
      btn.classList.add("on");
    }
  });
}

function renderAll(data) {
  latestProgressData = data;
  applyTranslations();

  document.getElementById("completed-sessions").textContent = safeValue(data.summary.completedSessions);
  document.getElementById("completed-exercises").textContent = safeValue(data.summary.completedExercises);

  const totalDuration =
    (data.summary.totalSessionDurationSeconds || 0) +
    (data.summary.totalExerciseDurationSeconds || 0);

  document.getElementById("total-time").textContent = formatDuration(totalDuration);
  document.getElementById("last-activity").textContent = formatDate(data.summary.lastActivityAt);

  renderJourney(data.summary);
  renderCategoryAverages(data.categoryAverages || {});
  const weekActiveDays = renderWeek(data.sessionHistory || []);
  renderBadges(data.summary, weekActiveDays);
  renderSessionHistory(data.sessionHistory || []);
}

window.setProgressLang = function setProgressLang(lang) {
  localStorage.setItem("nrw_lang", lang);
  currentProgressLang = lang;

  if (latestProgressData) {
    renderAll(latestProgressData);
  } else {
    applyTranslations();
  }
};

async function loadProgress(uid) {
  try {
    const data = await getUserProgressData(uid);
    renderAll(data);
  } catch (error) {
    console.error("Progress load error:", error);
  }
}

window.logout = logoutEverywhere;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentProgressLang = localStorage.getItem("nrw_lang") || "ar";
    await loadProgress(user.uid);
  } else {
    window.location.href = "/";
  }
});
