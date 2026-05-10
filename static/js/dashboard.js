import { auth, db } from "/static/js/firebase-config.js";
import { logoutEverywhere } from "/static/js/auth-session.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const dashboardTranslations = {
  ar: {
    dir: "rtl",
    lang: "ar",
    sidebarSubtitle: "لوحة المريض",
    navDashboard: "الرئيسية",
    navExercises: "التمارين",
    navProgress: "التقدم",
    navAvc: "الوقاية من السكتة الدماغية",
    navMotor: "الحركي والتقييم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",

    title: "مرحبًا",
    titlePrefix: "مرحبًا",
    subtitle: "كل تمرين هو خطوة جديدة نحو تعافٍ أقوى وثقة أكبر وتقدم أفضل.",
    heroBadge: "Neuro ReWire",

    missionCardTitle: "مهمة اليوم",
    missionCardText: "اختر فئة واحدة وابدأ تمرينًا قصيرًا اليوم.",
    missionMemory: "الذاكرة",
    missionAttention: "الانتباه",
    missionCoordination: "التنسيق",
    missionTrajectory: "المسار",
    missionQuiz: "السرعة والاختبارات",
    missionLanguage: "اللغة",

    cognitiveCardTitle: "الملف المعرفي",
    chartMemory: "ذاكرة",
    chartAttention: "انتباه",
    chartLanguage: "لغة",
    chartCoordination: "تنسيق",
    chartSpeed: "سرعة",

    overviewCardTitle: "نظرة على الفئات",
    overviewCardNote: "استكشف تقدمك عبر الفئات المختلفة بطريقة بسيطة وواضحة.",
    completedText: "مكتمل",
    averageText: "المتوسط",
    emptyOverview: "لا توجد نتائج كافية حتى الآن لعرض الفئات.",

    avcEduTitle: "مخطط تعليمي AVC",
    avcEduSubtitle: "السكتة الدماغية تحتاج إلى تصرف فوري. ملاحظة الوجه والذراع والكلام بسرعة تساعد على اكتشاف علامات الخطر والتدخل دون تأخير.",
    avcFaceTitle: "الوجه",
    avcFaceText: "اعوجاج مفاجئ أو هبوط في أحد جانبي الوجه.",
    avcArmTitle: "الذراع",
    avcArmText: "ضعف أو صعوبة في رفع أحد الذراعين.",
    avcSpeechTitle: "الكلام",
    avcSpeechText: "صعوبة في الكلام أو كلام غير واضح.",
    avcEmergencyTitle: "الاستعجال",
    avcEmergencyText: "اتصل فورًا بالإسعاف أو بالطوارئ.",
    avcCenterText: "تدخل سريع",

    preventionCardTitle: "تذكير لطيف حول الوقاية من AVC",
    preventionPill1: "الترطيب",
    preventionPill2: "الحركة الخفيفة",
    preventionPill3: "الانتظام",
    preventionPill4: "الراحة",
    preventionCardNote: "العادات الصغيرة المتكررة تصنع فرقًا كبيرًا في رحلة التعافي.",
    preventionCardButton: "عرض نصائح الوقاية",

    miniStat1: "الألعاب المكتملة",
    miniStat2: "المتوسط العام",
    miniStat3: "الفئات النشطة",
    miniStat4: "الوقت الإجمالي",

    rhythmCardTitle: "إيقاع الأسبوع",
    rhythmLeftLabel: "التقدم",
    rhythmCardText: "الحفاظ على إيقاع منتظم يساعد على دعم التعافي على المدى الطويل.",

    motivationCardTitle: "قوة اليوم",
    motivationCardText: "كل مجهود صغير له قيمة. حتى جلسة قصيرة اليوم يمكن أن تعزز ثقتك، وتنشّط دماغك، وتقربك من تقدم ثابت وجميل. واصل خطوة بخطوة، فالإستمرار هو سر التحسن الحقيقي."
  },

  fr: {
    dir: "ltr",
    lang: "fr",
    sidebarSubtitle: "Tableau patient",
    navDashboard: "Accueil",
    navExercises: "Exercices",
    navProgress: "Progrès",
    navAvc: "Prévention AVC",
    navMotor: "Moteur et bilan",
    navSettings: "Paramètres",
    logout: "Se déconnecter",

    title: "Bienvenue",
    titlePrefix: "Bienvenue",
    subtitle: "Chaque exercice est une nouvelle étape vers une récupération plus forte, plus confiante et plus sereine.",
    heroBadge: "Neuro ReWire",

    missionCardTitle: "Mission du jour",
    missionCardText: "Choisissez une catégorie et lancez un petit exercice aujourd’hui.",
    missionMemory: "Mémoire",
    missionAttention: "Attention",
    missionCoordination: "Coordination",
    missionTrajectory: "Trajectoire",
    missionQuiz: "Quiz & rapidité",
    missionLanguage: "Langage",

    cognitiveCardTitle: "Profil cognitif",
    chartMemory: "Mémoire",
    chartAttention: "Attention",
    chartLanguage: "Langage",
    chartCoordination: "Coordination",
    chartSpeed: "Vitesse",

    overviewCardTitle: "Aperçu des catégories",
    overviewCardNote: "Explorez votre progression dans les différentes catégories de façon simple et claire.",
    completedText: "Terminés",
    averageText: "Moyenne",
    emptyOverview: "Pas encore assez de résultats pour afficher les catégories.",

    avcEduTitle: "Schéma éducatif AVC",
    avcEduSubtitle: "Un AVC demande une réaction immédiate. Observer rapidement le visage, la force du bras et la parole permet d’identifier les signes d’alerte et d’agir sans attendre.",
    avcFaceTitle: "Visage",
    avcFaceText: "Déformation soudaine du visage.",
    avcArmTitle: "Bras",
    avcArmText: "Faiblesse ou difficulté à lever un bras.",
    avcSpeechTitle: "Parole",
    avcSpeechText: "Paroles troubles ou difficiles à comprendre.",
    avcEmergencyTitle: "Urgence",
    avcEmergencyText: "Appelez immédiatement les urgences.",
    avcCenterText: "Agir vite",

    preventionCardTitle: "Petit rappel prévention AVC",
    preventionPill1: "Hydratation",
    preventionPill2: "Mouvement doux",
    preventionPill3: "Régularité",
    preventionPill4: "Repos",
    preventionCardNote: "De petites habitudes régulières peuvent faire une grande différence dans la récupération.",
    preventionCardButton: "Voir les conseils AVC",

    miniStat1: "Jeux terminés",
    miniStat2: "Score moyen",
    miniStat3: "Catégories actives",
    miniStat4: "Temps total",

    rhythmCardTitle: "Rythme de la semaine",
    rhythmLeftLabel: "Progression",
    rhythmCardText: "Garder un rythme régulier aide à renforcer la récupération sur la durée.",

    motivationCardTitle: "Force du jour",
    motivationCardText: "Chaque petit effort compte. Même une courte séance aujourd’hui peut renforcer votre confiance, stimuler votre cerveau et vous rapprocher d’un progrès durable. Continuez pas à pas, car la régularité crée les plus belles améliorations."
  },

  en: {
    dir: "ltr",
    lang: "en",
    sidebarSubtitle: "Patient dashboard",
    navDashboard: "Home",
    navExercises: "Exercises",
    navProgress: "Progrès",
    navAvc: "Stroke prevention",
    navMotor: "Motor & Assessment",
    navSettings: "Settings",
    logout: "Log out",

    title: "Welcome",
    titlePrefix: "Welcome",
    subtitle: "Each exercise is a new step toward stronger recovery, greater confidence, and better progress.",
    heroBadge: "Neuro ReWire",

    missionCardTitle: "Today's mission",
    missionCardText: "Choose one category and start a short exercise today.",
    missionMemory: "Memory",
    missionAttention: "Attention",
    missionCoordination: "Coordination",
    missionTrajectory: "Trajectory",
    missionQuiz: "Quiz & speed",
    missionLanguage: "Language",

    cognitiveCardTitle: "Cognitive profile",
    chartMemory: "Memory",
    chartAttention: "Attention",
    chartLanguage: "Language",
    chartCoordination: "Coordination",
    chartSpeed: "Speed",

    overviewCardTitle: "Category overview",
    overviewCardNote: "Explore your progress across different categories in a simple and clear way.",
    completedText: "Completed",
    averageText: "Average",
    emptyOverview: "Not enough results yet to display category overview.",

    avcEduTitle: "Stroke educational diagram",
    avcEduSubtitle: "A stroke requires immediate action. Quickly checking the face, arm strength, and speech helps identify warning signs and respond without delay.",
    avcFaceTitle: "Face",
    avcFaceText: "Sudden facial drooping or asymmetry.",
    avcArmTitle: "Arm",
    avcArmText: "Weakness or difficulty raising one arm.",
    avcSpeechTitle: "Speech",
    avcSpeechText: "Slurred or difficult speech.",
    avcEmergencyTitle: "Emergency",
    avcEmergencyText: "Call emergency services immediately.",
    avcCenterText: "Act fast",

    preventionCardTitle: "Gentle stroke-prevention reminder",
    preventionPill1: "Hydration",
    preventionPill2: "Light movement",
    preventionPill3: "Consistency",
    preventionPill4: "Rest",
    preventionCardNote: "Small repeated habits can make a big difference in recovery.",
    preventionCardButton: "View prevention tips",

    miniStat1: "Games completed",
    miniStat2: "Average score",
    miniStat3: "Active categories",
    miniStat4: "Total time",

    rhythmCardTitle: "Weekly rhythm",
    rhythmLeftLabel: "Progress",
    rhythmCardText: "Keeping a steady rhythm helps strengthen recovery over time.",

    motivationCardTitle: "Strength of the Day",
    motivationCardText: "Every small effort matters. Even a short session today can build confidence, stimulate your brain, and move you closer to lasting progress. Keep going step by step, because consistency creates the most meaningful improvement."
  }
};

const CATEGORY_META = {
  memory:       { key: "memory",       color: "#2C7A8C", light: "rgba(44,122,140,.10)" },
  attention:    { key: "attention",    color: "#3D8FA0", light: "rgba(61,143,160,.10)" },
  coordination: { key: "coordination", color: "#4A98A8", light: "rgba(74,152,168,.10)" },
  trajectory:   { key: "trajectory",   color: "#3F8797", light: "rgba(63,135,151,.10)" },
  quiz:         { key: "quiz",         color: "#5AAABB", light: "rgba(90,170,187,.10)" },
  language:     { key: "language",     color: "#2F8192", light: "rgba(47,129,146,.10)" }
};

let currentDashboardProfile = null;
let currentAuthUser = null;
let allExerciseResults = [];
let currentDashboardLang = localStorage.getItem("nrw_lang") || "ar";
let radarAnimationFrame = null;

function safeText(v) {
  return String(v || "").trim();
}

/**
 * Escapes HTML special characters to prevent XSS when inserting
 * database-sourced strings via innerHTML.
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

function getUserGivenName(data, user) {
  if (safeText(data?.givenName)) return safeText(data.givenName).split(/\s+/)[0];

  if (safeText(user?.displayName)) {
    const parts = safeText(user.displayName).split(/\s+/);
    return parts[0] || "";
  }

  if (safeText(user?.email)) return safeText(user.email).split("@")[0];
  return "";
}

function updateDashboardWelcomeTitle() {
  const t = dashboardTranslations[currentDashboardLang] || dashboardTranslations.ar;
  const givenName = getUserGivenName(currentDashboardProfile, currentAuthUser);
document.getElementById("dashboard-title").textContent = givenName
  ? `${t.titlePrefix} ${givenName}`
  : t.title;
}

function getCategoryLabel(categoryKey) {
  const t = dashboardTranslations[currentDashboardLang] || dashboardTranslations.ar;
  const map = {
    memory: t.missionMemory,
    attention: t.missionAttention,
    coordination: t.missionCoordination,
    trajectory: t.missionTrajectory,
    quiz: t.missionQuiz,
    language: t.missionLanguage
  };
  return map[categoryKey] || categoryKey;
}

function normalizePercent(score, maxScore) {
  const s = Number(score);
  const m = Number(maxScore);
  if (!Number.isFinite(s) || !Number.isFinite(m) || m <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((s / m) * 100)));
}

function normalizeGameCategory(item) {
  const raw = safeText(item?.category).toLowerCase();
  if (CATEGORY_META[raw]) return raw;

  const key = safeText(item?.exerciseKey).toLowerCase();
  if (key.includes("memory")) return "memory";
  if (key.includes("attention")) return "attention";
  if (key.includes("coordination")) return "coordination";
  if (key.includes("trajectory")) return "trajectory";
  if (key.includes("quiz")) return "quiz";
  if (key.includes("language")) return "language";

  return raw || "";
}

function computeDashboardStats(results) {
  const completed = results
    .filter(item => item && item.status === "completed")
    .map(item => ({ ...item, normalizedCategory: normalizeGameCategory(item) }));

  const byCategory = {};
  Object.keys(CATEGORY_META).forEach(key => {
    byCategory[key] = {
      category: key,
      completedCount: 0,
      avgPercent: 0,
      totalPercent: 0,
      durations: []
    };
  });

  completed.forEach(item => {
    const category = item.normalizedCategory;
    if (!byCategory[category]) return;

    const percent = normalizePercent(item.score, item.maxScore);
    byCategory[category].completedCount += 1;
    byCategory[category].totalPercent += percent;

    if (Number.isFinite(Number(item.durationSeconds)) && Number(item.durationSeconds) > 0) {
      byCategory[category].durations.push(Number(item.durationSeconds));
    }
  });

  Object.values(byCategory).forEach(cat => {
    if (cat.completedCount > 0) {
      cat.avgPercent = Math.round(cat.totalPercent / cat.completedCount);
    }
  });

  const allCompletedWithScore = completed.filter(
    item => Number.isFinite(Number(item.maxScore)) && Number(item.maxScore) > 0
  );

  let overallAccuracy = 0;
  if (allCompletedWithScore.length > 0) {
    overallAccuracy = Math.round(
      allCompletedWithScore.reduce((sum, item) => sum + normalizePercent(item.score, item.maxScore), 0)
      / allCompletedWithScore.length
    );
  }

  const validDurations = completed
    .map(item => Number(item.durationSeconds))
    .filter(v => Number.isFinite(v) && v > 0);

  let totalSeconds = 0;
  if (validDurations.length > 0) {
    totalSeconds = Math.round(validDurations.reduce((a, b) => a + b, 0));
  }

  let speedScore = overallAccuracy;
  if (validDurations.length > 0) {
    const avgDuration = validDurations.reduce((a, b) => a + b, 0) / validDurations.length;
    const normalizedDuration = Math.max(0, Math.min(100, Math.round(100 - ((avgDuration - 25) / 140) * 100)));
    speedScore = Math.round((overallAccuracy + normalizedDuration) / 2);
  }

  const activeCategories = Object.values(byCategory).filter(cat => cat.completedCount > 0).length;

  const coordinationParts = [
    byCategory.coordination.completedCount ? byCategory.coordination.avgPercent : null,
    byCategory.trajectory.completedCount ? byCategory.trajectory.avgPercent : null
  ].filter(v => v !== null);

  return {
    completed,
    byCategory,
    overview: {
      gamesCompleted: completed.length,
      averageScore: overallAccuracy,
      activeCategories,
      totalSeconds
    },
    cognitiveProfile: {
      memory: byCategory.memory.avgPercent || 0,
      attention: byCategory.attention.avgPercent || 0,
      language: byCategory.language.avgPercent || 0,
      coordination: coordinationParts.length
        ? Math.round(coordinationParts.reduce((a, b) => a + b, 0) / coordinationParts.length)
        : 0,
      speed: speedScore || 0
    }
  };
}

function animateCounter(el, target, suffix = "") {
  if (!el) return;
  const duration = 900;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * ease);
    el.textContent = `${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderMiniStats(stats) {
  const t = dashboardTranslations[currentDashboardLang] || dashboardTranslations.ar;
  document.getElementById("mini-stat-1-label").textContent = t.miniStat1;
  document.getElementById("mini-stat-2-label").textContent = t.miniStat2;
  document.getElementById("mini-stat-3-label").textContent = t.miniStat3;
  document.getElementById("mini-stat-4-label").textContent = t.miniStat4;

  animateCounter(document.getElementById("mini-stat-1-value"), stats.overview.gamesCompleted);
  animateCounter(document.getElementById("mini-stat-2-value"), stats.overview.averageScore, "%");
  animateCounter(document.getElementById("mini-stat-3-value"), stats.overview.activeCategories);
  animateCounter(document.getElementById("mini-stat-4-value"), Math.round(stats.overview.totalSeconds / 60), "m");
}

function renderCategoryOverview(stats) {
  const t = dashboardTranslations[currentDashboardLang] || dashboardTranslations.ar;
  const container = document.getElementById("dashboardCategoryOverview");
  if (!container) return;

  const categories = Object.keys(CATEGORY_META);
  const hasData = categories.some(key => stats.byCategory[key]?.completedCount > 0);

  if (!hasData) {
    container.innerHTML = `<div class="dashboard-empty-overview">${t.emptyOverview}</div>`;
    return;
  }

  container.innerHTML = categories.map(key => {
    const meta = CATEGORY_META[key];
    const item = stats.byCategory[key];
    const count = item?.completedCount || 0;
    const avg = item?.avgPercent || 0;
    const label = getCategoryLabel(key);

    return `
      <div class="dashboard-category-chip glass-chip" style="background:${meta.light};">
        <div class="dashboard-category-chip-top">
          <span class="dashboard-category-dot" style="background:${meta.color};"></span>
          <span class="dashboard-category-name">${label}</span>
        </div>
        <div class="dashboard-category-stats">
          <div class="dashboard-category-stat">
            <strong>${count}</strong>
            <span>${t.completedText}</span>
          </div>
          <div class="dashboard-category-stat">
            <strong>${avg}%</strong>
            <span>${t.averageText}</span>
          </div>
        </div>
        <div class="dashboard-category-progress">
          <div class="dashboard-category-progress-fill" style="width:${avg}%; background:linear-gradient(90deg, ${meta.color}, #5AAABB);"></div>
        </div>
      </div>
    `;
  }).join("");
}

function drawRadar(progressValues) {
  const canvas = document.getElementById("cognitiveRadarChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const t = dashboardTranslations[currentDashboardLang] || dashboardTranslations.ar;

  const labels = [
    t.chartMemory,
    t.chartAttention,
    t.chartLanguage,
    t.chartCoordination,
    t.chartSpeed
  ];

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.30;
  const levels = 4;
  const angleStep = (Math.PI * 2) / labels.length;

  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);
    ctx.beginPath();
    for (let i = 0; i < labels.length; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(184,220,232,.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < labels.length; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(208,232,240,.7)";
    ctx.stroke();

    const labelDistance = radius + 18;
    const lx = centerX + Math.cos(angle) * labelDistance;
    const ly = centerY + Math.sin(angle) * labelDistance;

    ctx.fillStyle = "#43535E";
    ctx.font = "12px Arial";
    const w = ctx.measureText(labels[i]).width;
    ctx.fillText(labels[i], lx - w / 2, ly + 4);
  }

  ctx.beginPath();
  progressValues.forEach((value, i) => {
    const ratio = Math.max(0, Math.min(100, value)) / 100;
    const r = radius * ratio;
    const angle = -Math.PI / 2 + i * angleStep;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(61,143,160,.20)";
  ctx.strokeStyle = "#3D8FA0";
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  progressValues.forEach((value, i) => {
    const ratio = Math.max(0, Math.min(100, value)) / 100;
    const r = radius * ratio;
    const angle = -Math.PI / 2 + i * angleStep;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#2C7A8C";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function animateRadarChart(profile) {
  const canvas = document.getElementById("cognitiveRadarChart");
  if (!canvas) return;

  const parent = canvas.parentElement;
  const width = Math.max(300, Math.min(parent.clientWidth - 8, 360));
  const height = 220;
  canvas.width = width;
  canvas.height = height;

  const targetValues = [
    profile.memory || 0,
    profile.attention || 0,
    profile.language || 0,
    profile.coordination || 0,
    profile.speed || 0
  ];

  if (radarAnimationFrame) {
    cancelAnimationFrame(radarAnimationFrame);
    radarAnimationFrame = null;
  }

  const startTime = performance.now();
  const duration = 1100;

  function frame(now) {
    const elapsed = now - startTime;
    const p = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    const currentValues = targetValues.map(v => Math.round(v * ease));
    drawRadar(currentValues);

    if (p < 1) radarAnimationFrame = requestAnimationFrame(frame);
    else radarAnimationFrame = null;
  }

  radarAnimationFrame = requestAnimationFrame(frame);
}

function renderDashboardData() {
  const stats = computeDashboardStats(allExerciseResults);
  renderMiniStats(stats);

  const rhythmValue = Math.max(0, Math.min(100, stats.overview.averageScore || 0));
  const rhythmFill = document.getElementById("dashboardRhythmFill");
  const rhythmValueEl = document.getElementById("dashboardRhythmValue");
  if (rhythmFill) rhythmFill.style.width = `${rhythmValue}%`;
  if (rhythmValueEl) animateCounter(rhythmValueEl, rhythmValue, "%");

  renderCategoryOverview(stats);
  animateRadarChart(stats.cognitiveProfile);
}

function updateDashboardWelcomeAndData() {
  updateDashboardWelcomeTitle();
  renderDashboardData();
}

window.setDashboardLang = function(lang) {
  const t = dashboardTranslations[lang] || dashboardTranslations.ar;
  currentDashboardLang = lang;
  localStorage.setItem("nrw_lang", lang);

  document.documentElement.lang = t.lang;
  document.documentElement.dir = t.dir;

  document.getElementById("sidebar-subtitle").textContent = t.sidebarSubtitle;
  document.getElementById("nav-dashboard").textContent = t.navDashboard;
  document.getElementById("nav-exercises").textContent = t.navExercises;
  document.getElementById("nav-progress").textContent = t.navProgress;
  document.getElementById("nav-avc").textContent = t.navAvc;
  document.getElementById("nav-motor").textContent = t.navMotor;
  document.getElementById("nav-settings").textContent = t.navSettings;
  document.getElementById("logout-text").textContent = t.logout;

  document.getElementById("dashboard-hero-badge").textContent = t.heroBadge;
  document.getElementById("dashboard-subtitle").textContent = t.subtitle;

  document.getElementById("mission-card-title").textContent = t.missionCardTitle;
  document.getElementById("mission-card-text").textContent = t.missionCardText;
  document.getElementById("mission-btn-memory").textContent = t.missionMemory;
  document.getElementById("mission-btn-attention").textContent = t.missionAttention;
  document.getElementById("mission-btn-coordination").textContent = t.missionCoordination;
  document.getElementById("mission-btn-trajectory").textContent = t.missionTrajectory;
  document.getElementById("mission-btn-quiz").textContent = t.missionQuiz;
  document.getElementById("mission-btn-language").textContent = t.missionLanguage;
  document.getElementById("cognitive-card-title").textContent = t.cognitiveCardTitle;

  document.getElementById("overview-card-title").textContent = t.overviewCardTitle;
  document.getElementById("overview-card-note").textContent = t.overviewCardNote;

  document.getElementById("avc-edu-title").textContent = t.avcEduTitle;
  document.getElementById("avc-edu-subtitle").textContent = t.avcEduSubtitle;
  document.getElementById("avc-face-title").textContent = t.avcFaceTitle;
  document.getElementById("avc-face-text").textContent = t.avcFaceText;
  document.getElementById("avc-arm-title").textContent = t.avcArmTitle;
  document.getElementById("avc-arm-text").textContent = t.avcArmText;
  document.getElementById("avc-speech-title").textContent = t.avcSpeechTitle;
  document.getElementById("avc-speech-text").textContent = t.avcSpeechText;
  document.getElementById("avc-emergency-title").textContent = t.avcEmergencyTitle;
  document.getElementById("avc-emergency-text").textContent = t.avcEmergencyText;
  document.getElementById("avc-center-text").textContent = t.avcCenterText;

  document.getElementById("prevention-card-title").textContent = t.preventionCardTitle;
  document.getElementById("prevention-pill-1").textContent = t.preventionPill1;
  document.getElementById("prevention-pill-2").textContent = t.preventionPill2;
  document.getElementById("prevention-pill-3").textContent = t.preventionPill3;
  document.getElementById("prevention-pill-4").textContent = t.preventionPill4;
  document.getElementById("prevention-card-note").textContent = t.preventionCardNote;
  document.getElementById("prevention-card-button").textContent = t.preventionCardButton;

  document.getElementById("mini-stat-1-label").textContent = t.miniStat1;
  document.getElementById("mini-stat-2-label").textContent = t.miniStat2;
  document.getElementById("mini-stat-3-label").textContent = t.miniStat3;
  document.getElementById("mini-stat-4-label").textContent = t.miniStat4;

  document.getElementById("rhythm-card-title").textContent = t.rhythmCardTitle;
  document.getElementById("rhythm-left-label").textContent = t.rhythmLeftLabel;
  document.getElementById("rhythm-card-text").textContent = t.rhythmCardText;

  document.getElementById("motivation-card-title").textContent = t.motivationCardTitle;
  document.getElementById("motivation-card-text").textContent = t.motivationCardText;

  document.querySelectorAll(".slp").forEach(btn => {
    btn.classList.remove("on");
    if (btn.textContent.trim().toLowerCase() === lang) {
      btn.classList.add("on");
    }
  });

  updateDashboardWelcomeAndData();
};

async function loadUserProfile(user) {
  currentAuthUser = user;
  try {
    const snapshot = await get(ref(db, `users/${user.uid}`));
    currentDashboardProfile = snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Profile load error:", error);
    currentDashboardProfile = null;
  }
}

async function loadExerciseResults(user) {
  try {
    const snapshot = await get(ref(db, `exercise_results/${user.uid}`));
    const data = snapshot.exists() ? snapshot.val() : {};
    allExerciseResults = Object.values(data || {});
  } catch (error) {
    console.error("Results load error:", error);
    allExerciseResults = [];
  }
}

window.openMissionCategory = function(category) {
  const categoryRoutes = {
    memory: "/exercises/memory",
    attention: "/exercises/attention",
    coordination: "/exercises/coordination",
    trajectory: "/exercises/trajectory",
    quiz: "/exercises/quiz",
    language: "/exercises/language"
  };

  window.location.href = categoryRoutes[category] || "/exercises";
};

window.logout = logoutEverywhere;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  await Promise.all([
    loadUserProfile(user),
    loadExerciseResults(user)
  ]);

  setDashboardLang(localStorage.getItem("nrw_lang") || "ar");
});

window.addEventListener("resize", () => {
  renderDashboardData();
});

setDashboardLang(localStorage.getItem("nrw_lang") || "ar");
