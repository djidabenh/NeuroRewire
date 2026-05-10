import { auth, db } from "/static/js/firebase-config.js";
import { logoutEverywhere } from "/static/js/auth-session.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
/**
 * Escapes HTML special characters to prevent XSS.
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


let lang = localStorage.getItem("nrw_lang") || "ar";
let currentUserData = null;

const UI = {
  ar: {
    sidebarSubtitle: "الحركي والتقييم",
    navDashboard: "الرئيسية",
    navExercises: "التمارين",
    navProgress: "التقدم",
    navAvc: "الوقاية من السكتة الدماغية",
    navMotor: "الحركي والتقييم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",

    title: "التقييم الحركي العصبي",
    subtitle: "للمرضى الذين يعانون من عجز حركي منعزل (AVC عميق/تحت قشري)",

    current: "وضعك الحالي",
    currently: "أنت حاليًا",
    tab_mRS: "مقياس رانكين (mRS)",
    tab_nihss: "مقياس NIHSS",

    mrs_intro:
      "مقياس Rankin المعدّل يوضح درجة الاستقلالية الوظيفية بعد السكتة الدماغية. هذا المقياس مهم جدًا بعد 2 إلى 3 أشهر لأنه يوضح هل أصبح المريض أكثر قدرة على الاعتماد على نفسه في المشي، التنقل، والأنشطة اليومية.",
    nihss_intro:
      "مقياس NIHSS يقدّر شدة العجز العصبي الأولي. وحتى عندما يكون AVC عميقًا ويعطي عجزًا حركيًا معزولًا دون تأثر واضح للوظائف العليا، فإنه يبقى مهمًا لوصف شدة البداية وتحديد نقطة الانطلاق.",

    mrs_items: [
      { v: 0, title: "mRS 0", label: "لا أعراض", desc: "لا توجد أعراض وظيفية، والمريض في وضع طبيعي من ناحية الاستقلالية." },
      { v: 1, title: "mRS 1", label: "أعراض بسيطة", desc: "توجد أعراض طفيفة لكن دون تأثير مهم على النشاطات اليومية أو الاستقلالية." },
      { v: 2, title: "mRS 2", label: "عجز خفيف", desc: "المريض مستقل عمومًا، لكن بعض المهام أصبحت أبطأ أو أصعب من السابق." },
      { v: 3, title: "mRS 3", label: "عجز متوسط", desc: "المريض يحتاج إلى بعض المساعدة، لكنه يستطيع القيام بجزء من نشاطاته وربما المشي دون مساعدة كاملة." },
      { v: 4, title: "mRS 4", label: "عجز متوسط إلى شديد", desc: "الحاجة للمساعدة أوضح، والحركة أو المشي أو التنقل أصبحوا أكثر صعوبة." },
      { v: 5, title: "mRS 5", label: "عجز شديد", desc: "المريض يحتاج إلى مساعدة كبيرة ومستمرة في أغلب النشاطات اليومية." },
      { v: 6, title: "mRS 6", label: "وفاة", desc: "أعلى درجة في هذا السلم." }
    ],

    nihss_items: [
  { v: 0, title: "NIHSS 0", label: "لا يوجد عجز مهم", desc: "لا يظهر عجز عصبي مهم عند الفحص السريري." },
  { v: 1, title: "NIHSS 1", label: "إصابة طفيفة جدًا", desc: "عجز خفيف جدًا وقد يكون تأثيره محدودًا في الحياة اليومية." },
  { v: 2, title: "NIHSS 2", label: "خفيف جدًا", desc: "إصابة بسيطة مع تأثير وظيفي محدود." },
  { v: 3, title: "NIHSS 3", label: "خفيف", desc: "عجز خفيف مع إمكانية جيدة للتحسن." },
  { v: 4, title: "NIHSS 4", label: "خفيف إلى متوسط", desc: "توجد إصابة ملحوظة لكن مع بقاء جزء مهم من الاستقلالية." },
  { v: 5, title: "NIHSS 5", label: "متوسط", desc: "العجز أوضح ويؤثر بشكل مرئي على الأداء الحركي أو العصبي." },
  { v: 6, title: "NIHSS 6", label: "متوسط", desc: "التحسن ممكن لكن يحتاج متابعة وتمارين منتظمة." },
  { v: 7, title: "NIHSS 7", label: "متوسط", desc: "العجز أصبح أكثر وضوحًا ويؤثر أكثر على النشاطات." },
  { v: 8, title: "NIHSS 8", label: "متوسط إلى مهم", desc: "القيود الحركية أو العصبية أصبحت واضحة جدًا." },
  { v: 9, title: "NIHSS 9", label: "مهم", desc: "إصابة مهمة تتطلب متابعة وإعادة تأهيل منظمة." },
  { v: 10, title: "NIHSS 10", label: "مهم", desc: "العجز له تأثير واضح على الوظيفة اليومية." },
  { v: 11, title: "NIHSS 11", label: "مهم إلى شديد", desc: "يحتاج المريض غالبًا إلى مرافقة ومتابعة أقرب." },
  { v: 12, title: "NIHSS 12", label: "شديد", desc: "إصابة شديدة مع تأثير كبير على الحركة والوظيفة." },
  { v: 13, title: "NIHSS 13", label: "شديد جدًا", desc: "إصابة شديدة جدًا وتحتاج إلى تكفل مكثف وتحفيز مستمر." }
],

    mrs_more:
      "في المتابعة الحركية، mRS مهم لأنه يترجم العجز إلى استقلالية عملية: هل يستطيع المريض أن يمشي؟ أن ينهض؟ أن يلبس نفسه؟ أن يحتاج إلى أقل قدر من المساعدة؟",
    nihss_more:
      "في AVC العميق أو تحت القشري، قد لا تظهر اضطرابات معرفية كبيرة، لكن الضعف الحركي قد يكون واضحًا. هنا يظل NIHSS مفيدًا لأنه يحدد شدة البداية، بينما تكمّل المتابعة الوظيفية الصورة الحقيقية للتعافي.",

    motivation_mrs_low:
      "هذا مستوى مشجّع نسبيًا. واصل التدريب للمحافظة على استقلاليتك وتحسينها أكثر.",
    motivation_mrs_mid:
      "ما زالت هناك صعوبات وظيفية، لكن التقدّم ممكن جدًا مع التكرار وإعادة التأهيل.",
    motivation_mrs_high:
      "حتى لو كنت تحتاج مساعدة الآن، فكل تحسن صغير في الحركة والاستقلالية مهم جدًا.",

    motivation_nihss_low:
      "الانطلاقة مشجعة نسبيًا. الاستمرار في التمارين قد يساعدك على تحسين الأداء أكثر.",
    motivation_nihss_mid:
      "هناك صعوبات متوسطة، لكن العمل المنتظم يمكن أن يصنع فرقًا واضحًا.",
    motivation_nihss_high:
      "قد تكون البداية أصعب، لكن الصبر، التدرج، وإعادة التأهيل المنظمة يمكن أن تحسن الوظيفة."
  },

  fr: {
    sidebarSubtitle: "Moteur et bilan",
    navDashboard: "Accueil",
    navExercises: "Exercices",
    navProgress: "Progrès",
    navAvc: "Prévention AVC",
    navMotor: "Moteur et bilan",
    navSettings: "Paramètres",
    logout: "Se déconnecter",

    title: "Bilan Moteur Neurologique",
    subtitle: "Pour patients avec déficit moteur isolé (AVC profond/sous-cortical)",

    current: "Votre situation actuelle",
    currently: "Vous êtes actuellement",
    tab_mRS: "Échelle de Rankin (mRS)",
    tab_nihss: "Score NIHSS",

    mrs_intro:
      "L’échelle de Rankin modifiée reflète le niveau d’autonomie fonctionnelle après un AVC. Elle devient particulièrement utile après 2 à 3 mois pour voir si le patient retrouve davantage d’indépendance dans la marche, les transferts et la vie quotidienne.",
    nihss_intro:
      "Le NIHSS estime la sévérité neurologique initiale. Même lorsqu’un AVC profond ou sous-cortical entraîne surtout un déficit moteur isolé sans altération majeure des fonctions supérieures, ce score reste essentiel pour situer la gravité du départ.",

    mrs_items: [
  { v: 0, title: "mRS 0", label: "Aucun symptôme", desc: "Aucun symptôme fonctionnel, indépendance complète." },
  { v: 1, title: "mRS 1", label: "Symptômes sans handicap significatif", desc: "Symptômes légers sans perte importante d’autonomie." },
  { v: 2, title: "mRS 2", label: "Handicap léger", desc: "Handicap léger avec autonomie globale conservée, malgré une gêne réelle." },
  { v: 3, title: "mRS 3", label: "Handicap modéré", desc: "Besoin d’une aide partielle, mais une partie des activités reste possible." },
  { v: 4, title: "mRS 4", label: "Handicap modéré à sévère", desc: "Dépendance plus marquée dans les activités quotidiennes et les déplacements." },
  { v: 5, title: "mRS 5", label: "Handicap sévère", desc: "Aide importante nécessaire dans presque tous les gestes du quotidien." },
  { v: 6, title: "mRS 6", label: "Décès", desc: "Niveau maximal de l’échelle." }
],

    nihss_items: [
  { v: 0, title: "NIHSS 0", label: "Aucun déficit significatif", desc: "Pas de déficit neurologique détectable cliniquement." },
  { v: 1, title: "NIHSS 1", label: "Atteinte minime", desc: "Déficit très léger, parfois discret dans la vie quotidienne." },
  { v: 2, title: "NIHSS 2", label: "Très léger", desc: "Atteinte faible avec retentissement fonctionnel limité." },
  { v: 3, title: "NIHSS 3", label: "Léger", desc: "Déficit modéré léger, souvent compatible avec une bonne récupération." },
  { v: 4, title: "NIHSS 4", label: "Léger à modéré", desc: "Atteinte encore modérée mais avec autonomie souvent partiellement conservée." },
  { v: 5, title: "NIHSS 5", label: "Modéré", desc: "Déficit plus net, avec impact moteur ou neurologique visible." },
  { v: 6, title: "NIHSS 6", label: "Modéré", desc: "La récupération reste possible, mais l’atteinte demande un suivi sérieux." },
  { v: 7, title: "NIHSS 7", label: "Modéré", desc: "Le déficit devient plus marqué et gêne davantage les activités." },
  { v: 8, title: "NIHSS 8", label: "Modéré à important", desc: "Les limitations motrices ou neurologiques sont bien visibles." },
  { v: 9, title: "NIHSS 9", label: "Important", desc: "Atteinte importante nécessitant rééducation et accompagnement structurés." },
  { v: 10, title: "NIHSS 10", label: "Important", desc: "Déficit sévérisant avec retentissement fonctionnel notable." },
  { v: 11, title: "NIHSS 11", label: "Important à sévère", desc: "Le patient a souvent besoin d’un encadrement plus étroit." },
  { v: 12, title: "NIHSS 12", label: "Sévère", desc: "Déficit sévère avec retentissement moteur et fonctionnel important." },
  { v: 13, title: "NIHSS 13", label: "Très sévère", desc: "Atteinte très marquée, nécessitant une prise en charge intensive et motivante." }
],

    mrs_more:
      "Dans le suivi moteur, le mRS est précieux car il transforme le déficit en autonomie concrète : marcher seul, se lever, s’habiller, faire ses transferts, avoir besoin de moins d’aide.",
    nihss_more:
      "Dans les AVC profonds, les troubles cognitifs peuvent être peu visibles, alors que la faiblesse motrice est importante. Le NIHSS reste donc utile pour décrire la sévérité initiale, puis le suivi fonctionnel permet de voir la récupération réelle.",

    motivation_mrs_low:
      "Le niveau d’autonomie est relativement encourageant. Continuez les exercices pour le préserver et l’améliorer.",
    motivation_mrs_mid:
      "Certaines difficultés restent présentes, mais une amélioration fonctionnelle est tout à fait possible.",
    motivation_mrs_high:
      "Même si vous avez besoin d’aide aujourd’hui, chaque petit progrès d’autonomie compte beaucoup.",

    motivation_nihss_low:
      "Le point de départ est plutôt encourageant. Continuez les exercices pour consolider la récupération.",
    motivation_nihss_mid:
      "Il existe des difficultés modérées, mais un travail régulier peut faire une vraie différence.",
    motivation_nihss_high:
      "Le départ peut être plus difficile, mais la patience et la rééducation structurée peuvent améliorer la fonction."
  },

  en: {
    sidebarSubtitle: "Motor & Assessment",
    navDashboard: "Home",
    navExercises: "Exercises",
    navProgress: "Progrès",
    navAvc: "Stroke Prevention",
    navMotor: "Motor & Assessment",
    navSettings: "Settings",
    logout: "Log out",

    title: "Neurological Motor Assessment",
    subtitle: "For patients with isolated motor deficit (deep/subcortical stroke)",

    current: "Your current situation",
    currently: "You are currently",
    tab_mRS: "Rankin Scale (mRS)",
    tab_nihss: "NIHSS Score",

    mrs_intro:
      "The modified Rankin Scale reflects the level of functional independence after stroke. It becomes especially important after 2 to 3 months to understand whether the patient is regaining walking ability, transfers and daily autonomy.",
    nihss_intro:
      "NIHSS estimates initial neurological severity. Even when a deep or subcortical stroke mainly causes isolated motor deficit without major higher-function impairment, this score still helps define the starting severity.",

    mrs_items: [
      { v: 0, title: "mRS 0", label: "No symptoms", desc: "No functional symptoms, full independence." },
      { v: 1, title: "mRS 1", label: "Nonsignificant disability", desc: "Mild symptoms without major loss of autonomy." },
      { v: 2, title: "mRS 2", label: "Slight disability", desc: "Slight disability with overall independence preserved." },
      { v: 3, title: "mRS 3", label: "Moderate disability", desc: "Partial help is needed, but some independence remains." },
      { v: 4, title: "mRS 4", label: "Moderately severe disability", desc: "Clearer dependence in daily activities and mobility." },
      { v: 5, title: "mRS 5", label: "Severe disability", desc: "Major assistance is needed in almost all daily tasks." },
      { v: 6, title: "mRS 6", label: "Dead", desc: "Highest level on the scale." }
    ],

    nihss_items: [
  { v: 0, title: "NIHSS 0", label: "No significant deficit", desc: "No clinically significant neurological deficit is detected." },
  { v: 1, title: "NIHSS 1", label: "Very minimal", desc: "Very slight deficit, sometimes barely noticeable in daily life." },
  { v: 2, title: "NIHSS 2", label: "Minimal", desc: "Mild involvement with limited functional impact." },
  { v: 3, title: "NIHSS 3", label: "Mild", desc: "Mild neurological deficit, often compatible with good recovery." },
  { v: 4, title: "NIHSS 4", label: "Mild to moderate", desc: "Noticeable deficit, though partial independence is often preserved." },
  { v: 5, title: "NIHSS 5", label: "Moderate", desc: "Deficit is clearer and more visible in motor or neurological function." },
  { v: 6, title: "NIHSS 6", label: "Moderate", desc: "Recovery remains possible, but structured follow-up is important." },
  { v: 7, title: "NIHSS 7", label: "Moderate", desc: "The deficit becomes more marked and interferes more with activities." },
  { v: 8, title: "NIHSS 8", label: "Moderate to marked", desc: "Motor or neurological limitations are now clearly visible." },
  { v: 9, title: "NIHSS 9", label: "Marked", desc: "Important deficit requiring structured rehabilitation and follow-up." },
  { v: 10, title: "NIHSS 10", label: "Marked", desc: "The deficit has a notable functional impact." },
  { v: 11, title: "NIHSS 11", label: "Marked to severe", desc: "The patient often needs closer support and guidance." },
  { v: 12, title: "NIHSS 12", label: "Severe", desc: "Severe deficit with major motor and functional consequences." },
  { v: 13, title: "NIHSS 13", label: "Very severe", desc: "Very significant impairment requiring intensive care and motivation." }
],

    mrs_more:
      "In motor follow-up, mRS is valuable because it translates impairment into real independence: walking alone, standing up, dressing, doing transfers, and needing less help.",
    nihss_more:
      "In deep strokes, cognitive problems may be less obvious while motor weakness is significant. NIHSS therefore remains helpful for describing initial severity, while functional follow-up shows real recovery.",

    motivation_mrs_low:
      "The level of independence is relatively encouraging. Keep training to preserve and improve it.",
    motivation_mrs_mid:
      "Some limitations remain, but meaningful functional improvement is still possible.",
    motivation_mrs_high:
      "Even if more help is needed today, every small gain in independence matters.",

    motivation_nihss_low:
      "The starting point is relatively encouraging. Keep exercising to consolidate recovery.",
    motivation_nihss_mid:
      "There are moderate difficulties, but regular work can make a real difference.",
    motivation_nihss_high:
      "The starting point may be harder, but patience and structured rehabilitation can improve function."
  }
};

function t(key) {
  return UI[lang][key] || key;
}

function applySidebarTexts() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.getElementById("sidebar-subtitle").textContent = t("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = t("navDashboard");
  document.getElementById("nav-exercises").textContent = t("navExercises");
  document.getElementById("nav-progress").textContent = t("navProgress");
  document.getElementById("nav-avc").textContent = t("navAvc");
  document.getElementById("nav-motor").textContent = t("navMotor");
  document.getElementById("nav-settings").textContent = t("navSettings");
  document.getElementById("logout-text").textContent = t("logout");

  document.querySelectorAll(".slp").forEach(btn => btn.classList.remove("on"));
  const activeBtn = document.getElementById(`lang-${lang}`);
  if (activeBtn) activeBtn.classList.add("on");
}

function getCurrentScoreMessage(type, value) {
  const num = Number(value);

  if (type === "rankin") {
    if (num <= 1) return t("motivation_mrs_low");
    if (num <= 3) return t("motivation_mrs_mid");
    return t("motivation_mrs_high");
  }

  if (type === "nihss") {
    if (num <= 4) return t("motivation_nihss_low");
    if (num <= 9) return t("motivation_nihss_mid");
    return t("motivation_nihss_high");
  }

  return "";
}

function renderCurrentScoreBlock() {
  const holder = document.getElementById("motor-current-holder");
  const type = String(currentUserData?.strokeScoreType || "").trim().toLowerCase();
  const value = String(currentUserData?.strokeScoreValue || "").trim();

  if (!type || value === "") {
    holder.innerHTML = "";
    return;
  }

  holder.innerHTML = `
  <section class="motor-proto-score-big">
    <div class="progress-card-head" style="margin-bottom:10px;justify-content:center;">
      <div class="progress-mini-dot"></div>
      <span>${t("current")}</span>
    </div>
    <div class="motor-proto-score-big-row">
      <div class="motor-proto-score-chip">${type === "nihss" ? "NIHSS" : "Rankin"}</div>
      <div class="motor-proto-score-main">
        <span>${t("currently")}</span>
        <strong>${type === "nihss" ? "NIHSS" : "Rankin"} ${escapeHtml(value)}</strong>
      </div>
    </div>
    <p>${getCurrentScoreMessage(type, value)}</p>
  </section>
`;
}

function renderMotor() {
  const el = document.getElementById("motor-content");
  if (!el) return;

  renderCurrentScoreBlock();

  el.innerHTML = `
    <div id="motor-tabs" style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      ${[
        ["mRS", t("tab_mRS")],
        ["nihss", t("tab_nihss")]
      ].map(([id, lbl], i) => `
        <button onclick="motorTab('${escapeHtml(id)}')" id="mtab-${escapeHtml(id)}"
          class="motor-proto-tab ${i === 0 ? "on" : ""}">
          ${lbl}
        </button>
      `).join("")}
    </div>

    <div id="motor-panel"></div>
  `;

  function renderMRS(panel) {
  panel.innerHTML = `
    <div class="motor-proto-wrap">
      <div class="motor-proto-intro big">
        <h3>${t("tab_mRS")}</h3>
        <p>${t("mrs_intro")}</p>
      </div>

      <div class="motor-proto-rankin rich">
        ${UI[lang].mrs_items.map(item => `
          <div class="motor-rs-card rs-${item.v} rich">
            <div class="motor-rs-head">${item.title}</div>
            <div class="motor-rs-label">${item.label}</div>
            <div class="motor-rs-desc">${item.desc}</div>
            <div class="motor-rs-extra">
              ${
                item.v === 0 ? (lang === "ar"
                  ? "استقلالية كاملة، لا يوجد تأثير وظيفي ظاهر في الحياة اليومية."
                  : lang === "fr"
                    ? "Autonomie complète, sans impact visible sur la vie quotidienne."
                    : "Full independence, with no visible impact on daily life.")
                : item.v === 1 ? (lang === "ar"
                  ? "قد توجد شكاوى بسيطة، لكن المريض يبقى مستقلاً تقريبًا في نشاطاته."
                  : lang === "fr"
                    ? "De petites plaintes peuvent exister, mais la personne reste pratiquement autonome."
                    : "Minor complaints may exist, but the person remains almost fully independent.")
                : item.v === 2 ? (lang === "ar"
                  ? "يمكن للمريض أن يعيش بشكل مستقل، لكن بعض الأنشطة صارت أصعب أو أبطأ."
                  : lang === "fr"
                    ? "La personne peut vivre de manière autonome, mais certaines activités deviennent plus lentes ou plus difficiles."
                    : "The person can live independently, but some activities become slower or harder.")
                : item.v === 3 ? (lang === "ar"
                  ? "توجد حاجة إلى مساعدة جزئية، خاصة في بعض التنقلات أو الأنشطة اليومية."
                  : lang === "fr"
                    ? "Une aide partielle devient nécessaire, surtout pour certains déplacements ou gestes quotidiens."
                    : "Partial help becomes necessary, especially for some mobility or daily tasks.")
                : item.v === 4 ? (lang === "ar"
                  ? "الاعتماد أصبح أوضح، والمشي أو الوقوف أو خدمة النفس صار أكثر صعوبة."
                  : lang === "fr"
                    ? "La dépendance est plus nette, et marcher, se lever ou se servir seul devient plus difficile."
                    : "Dependence is clearer, and walking, standing, or self-care becomes more difficult.")
                : item.v === 5 ? (lang === "ar"
                  ? "المريض يحتاج إلى مساعدة كبيرة ومستمرة، مع فقدان واضح للاستقلالية."
                  : lang === "fr"
                    ? "Le patient a besoin d’une aide importante et continue, avec une perte marquée d’autonomie."
                    : "The patient needs major ongoing assistance, with marked loss of independence.")
                : (lang === "ar"
                  ? "تمثل أعلى درجة في السلم."
                  : lang === "fr"
                    ? "Représente le niveau maximal de l’échelle."
                    : "Represents the highest level on the scale.")
              }
            </div>
          </div>
        `).join("")}
      </div>

      <div class="motor-extra-box warm">
        <h4>${t("tab_mRS")}</h4>
        <p>${t("mrs_more")}</p>
      </div>
    </div>
  `;
}

  function renderNIHSS(panel) {
  panel.innerHTML = `
    <div class="motor-proto-wrap">
      <div class="motor-proto-intro big">
        <h3>${t("tab_nihss")}</h3>
        <p>${t("nihss_intro")}</p>
      </div>

      <div class="motor-proto-nihss rich full-nihss">
        ${UI[lang].nihss_items.map((item) => `
          <div class="motor-nihss-proto-card detailed vivid score-${item.v}">
            <div class="motor-nihss-proto-index">${item.v}</div>
            <div class="motor-nihss-proto-text">
              <strong>${item.title}</strong>
              <span>${item.label}</span>
              <small>${item.desc}</small>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="motor-extra-box cool">
        <h4>${t("tab_nihss")}</h4>
        <p>${t("nihss_more")}</p>
      </div>
    </div>
  `;
}

  window.motorTab = function motorTab(tab) {
    document.querySelectorAll('[id^="mtab-"]').forEach(b => b.classList.remove("on"));
    document.getElementById(`mtab-${tab}`)?.classList.add("on");

    const panel = document.getElementById("motor-panel");
    if (tab === "nihss") renderNIHSS(panel);
    else renderMRS(panel);
  };

  window.motorTab("mRS");
}

window.setMotorLang = function setMotorLang(nextLang) {
  localStorage.setItem("nrw_lang", nextLang);
  lang = nextLang;
  applySidebarTexts();
  renderMotor();
};

window.logout = logoutEverywhere;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  lang = localStorage.getItem("nrw_lang") || "ar";
  applySidebarTexts();

  const snap = await get(ref(db, `users/${user.uid}`));
  currentUserData = snap.exists() ? snap.val() : {};
  renderMotor();
});
