import { auth } from "/static/js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const SVG_ICONS = {
  brain:`<svg viewBox="0 0 24 24"><path d="M9.5 2a2.5 2.5 0 0 1 4.9.44C16.1 3 17.5 4.4 17.5 6c0 .34-.04.67-.11 1H18a3 3 0 0 1 3 3c0 1.1-.6 2.1-1.5 2.6A3 3 0 0 1 18 18h-.5a2.5 2.5 0 0 1-4.9.44A2.5 2.5 0 0 1 9.5 16H9a3 3 0 0 1-1.5-5.6A3 3 0 0 1 9 4h.11A2.5 2.5 0 0 1 9.5 2z"/></svg>`,
  eye:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>`,
  hand:`<svg viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  robot:`<svg viewBox="0 0 24 24"><rect x="7" y="4" width="10" height="8" rx="2"/><path d="M12 2v2"/><circle cx="10" cy="8" r="1"/><circle cx="14" cy="8" r="1"/><path d="M9 16v4M15 16v4M5 14l2-2M19 14l-2-2"/><rect x="6" y="12" width="12" height="6" rx="2"/></svg>`,
  pen:`<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  chat:`<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  quiz:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

const CATEGORY_CONFIG = {
  memory: {
    icon: "brain",
    ar: { title: "ألعاب الذاكرة", subtitle: "نفس البنية الموجودة في البروتوتايب: 3 واجهات فرعية للذاكرة.", items: [
      ["01","مَemoriser les images","شاهد الصور ثم تعرّف عليها لاحقًا","/games/memory-images"],
      ["02","إعادة الترتيب","أعد العناصر إلى الترتيب الصحيح","/games/memory-order"],
      ["03","العثور على الأزواج","طابق الصور المتشابهة في شبكة البطاقات","/games/memory-pairs"] ] },
    fr: { title: "Mémoire", subtitle: "Sous-interfaces mémoire fidèles au prototype.", items: [
      ["01","Mémoriser les images","Observer puis retrouver les images vues","/games/memory-images"],
      ["02","Remettre en ordre","Replacer les éléments dans le bon ordre","/games/memory-order"],
      ["03","Trouver les paires","Associer les cartes identiques","/games/memory-pairs"] ] },
    en: { title: "Memory", subtitle: "Memory sub-interfaces matching the prototype structure.", items: [
      ["01","Memorize images","Observe then find the images you saw","/games/memory-images"],
      ["02","Put in order","Restore the correct order of items","/games/memory-order"],
      ["03","Find the pairs","Match identical cards in a grid","/games/memory-pairs"] ] }
  },
  attention: {
    icon: "eye",
    ar: { title: "ألعاب الانتباه", subtitle: "3 واجهات للتركيز والتمييز البصري.", items: [
      ["01","العنصر المختلف","اكتشف الصورة المختلفة داخل الشبكة","/games/attention-odd"],
      ["02","اضغط الهدف","اضغط فقط على الهدف المطلوب بسرعة ودقة","/games/attention-target"],
      ["03","ابحث في المشهد","ابحث عن العنصر المطلوب داخل مشهد كبير","/games/attention-scene"] ] },
    fr: { title: "Attention", subtitle: "3 sous-interfaces pour la concentration et la discrimination visuelle.", items: [
      ["01","Trouver l’intrus","Repérer l’image différente dans la grille","/games/attention-odd"],
      ["02","Cliquer la cible","Cliquer uniquement sur la cible demandée","/games/attention-target"],
      ["03","Chercher dans la scène","Retrouver l’objet demandé dans une grande scène","/games/attention-scene"] ] },
    en: { title: "Attention", subtitle: "3 interfaces for focus and visual discrimination.", items: [
      ["01","Find the odd one","Spot the different image in the grid","/games/attention-odd"],
      ["02","Click the target","Click only the requested target","/games/attention-target"],
      ["03","Search the scene","Find the requested item inside a large scene","/games/attention-scene"] ] }
  },
  coordination: {
    icon: "hand",
    ar: { title: "التنسيق الحركي", subtitle: "واجهات خاصة بالسرعة والدقة والتنسيق اليدوي.", items: [
      ["01","التقاط العناصر","التقط العناصر المتساقطة داخل السلة أو المنطقة","/games/coordination-catch"],
      ["02","السحب والإفلات","اسحب كل عنصر إلى مكانه الصحيح","/games/coordination-dnd"],
      ["03","اللمس بالتسلسل","اضغط الأهداف المضيئة حسب الترتيب","/games/coordination-tap"] ] },
    fr: { title: "Coordination", subtitle: "Interfaces orientées vitesse, précision et coordination manuelle.", items: [
      ["01","Attraper les objets","Attraper les objets qui tombent","/games/coordination-catch"],
      ["02","Glisser-déposer","Déposer chaque objet au bon endroit","/games/coordination-dnd"],
      ["03","Taper en séquence","Taper les cibles lumineuses dans l’ordre","/games/coordination-tap"] ] },
    en: { title: "Coordination", subtitle: "Interfaces focused on speed, precision and hand coordination.", items: [
      ["01","Catch the objects","Catch falling objects in the target area","/games/coordination-catch"],
      ["02","Drag and drop","Drop each object in the correct zone","/games/coordination-dnd"],
      ["03","Tap in sequence","Tap glowing targets in the right order","/games/coordination-tap"] ] }
  },
  robot: {
    icon: "robot",
    ar: { title: "الروبوت", subtitle: "واجهات التقليد الحركي ورد الفعل السريع.", items: [
      ["01","تقليد الوضعية","شاهد وضعية الروبوت واختر المطابقة","/games/robot-follow"],
      ["02","تسلسل الحركات","احفظ تسلسل الحركات وأعده","/games/robot-sequence"],
      ["03","رد الفعل السريع","اختر اسم الإشارة الصحيحة قبل انتهاء الوقت","/games/robot-reaction"] ] },
    fr: { title: "Robot", subtitle: "Interfaces d’imitation gestuelle et de réaction rapide.", items: [
      ["01","Imiter la posture","Observer la posture du robot puis choisir la bonne","/games/robot-follow"],
      ["02","Séquence gestuelle","Mémoriser puis reproduire la séquence","/games/robot-sequence"],
      ["03","Réaction rapide","Choisir le bon geste avant la fin du temps","/games/robot-reaction"] ] },
    en: { title: "Robot", subtitle: "Gesture imitation and quick reaction interfaces.", items: [
      ["01","Imitate the posture","Watch the robot posture and pick the match","/games/robot-follow"],
      ["02","Gesture sequence","Memorize then replay the gesture sequence","/games/robot-sequence"],
      ["03","Quick reaction","Choose the correct gesture label before timeout","/games/robot-reaction"] ] }
  },
  trajectory: {
    icon: "pen",
    ar: { title: "المسار والرسم", subtitle: "واجهات التتبع والرسم والتحكم البصري الحركي.", items: [
      ["01","ربط النقاط","اربط النقاط بالترتيب الصحيح","/games/trajectory-dots"],
      ["02","رسم شكل","ارسم الشكل المطلوب حول أو داخل الهدف","/games/trajectory-shape"],
      ["03","المتاهة","قد المؤشر من البداية إلى النهاية داخل المسار","/games/trajectory-maze"] ] },
    fr: { title: "Trajectoire", subtitle: "Interfaces de tracé, dessin et contrôle visuo-moteur.", items: [
      ["01","Relier les points","Connecter les points dans le bon ordre","/games/trajectory-dots"],
      ["02","Dessiner une forme","Dessiner la forme demandée autour de la cible","/games/trajectory-shape"],
      ["03","Le labyrinthe","Guider le point jusqu’à la sortie","/games/trajectory-maze"] ] },
    en: { title: "Trajectory", subtitle: "Tracing, drawing and visuo-motor control interfaces.", items: [
      ["01","Connect the dots","Connect numbered dots in order","/games/trajectory-dots"],
      ["02","Draw a shape","Draw the requested shape around the target","/games/trajectory-shape"],
      ["03","Maze","Guide the point from start to finish","/games/trajectory-maze"] ] }
  },
  language: {
    icon: "chat",
    ar: { title: "اللغة", subtitle: "واجهات الكلمات والصور والتصنيف اللغوي.", items: [
      ["01","الكلمة والصورة","اختر الكلمة المطابقة للصورة","/games/language-word"],
      ["02","إكمال الكلمة","أكمل الكلمة الناقصة بالحرف أو الجزء الصحيح","/games/language-complete"],
      ["03","تصنيف الكلمات","ضع الكلمات داخل الفئة المناسبة","/games/language-categorize"] ] },
    fr: { title: "Langage", subtitle: "Interfaces mots, images et catégorisation linguistique.", items: [
      ["01","Mot et image","Choisir le mot correspondant à l’image","/games/language-word"],
      ["02","Compléter le mot","Compléter le mot manquant","/games/language-complete"],
      ["03","Catégoriser les mots","Placer les mots dans la bonne catégorie","/games/language-categorize"] ] },
    en: { title: "Language", subtitle: "Word, image and language categorization interfaces.", items: [
      ["01","Word and image","Choose the word matching the image","/games/language-word"],
      ["02","Complete the word","Complete the missing word or fragment","/games/language-complete"],
      ["03","Categorize words","Place words into the correct category","/games/language-categorize"] ] }
  },
  quiz: {
    icon: "quiz",
    ar: { title: "الاختبارات والسرعة", subtitle: "واجهات الأسئلة السريعة والمقارنة والحساب.", items: [
      ["01","أسئلة عامة","أسئلة بسيطة مرتبطة بالحياة اليومية","/games/quiz-general"],
      ["02","مقارنة سريعة","اختر الأكبر أو الأصغر بسرعة","/games/quiz-compare"],
      ["03","حساب سريع","حل العمليات البسيطة قبل انتهاء المؤقت","/games/quiz-math"] ] },
    fr: { title: "Quiz & rapidité", subtitle: "Interfaces de questions rapides, comparaison et calcul.", items: [
      ["01","Questions générales","Questions simples de la vie quotidienne","/games/quiz-general"],
      ["02","Comparaison rapide","Choisir le plus grand ou le plus petit rapidement","/games/quiz-compare"],
      ["03","Calcul rapide","Résoudre des opérations simples avant la fin du temps","/games/quiz-math"] ] },
    en: { title: "Quiz & speed", subtitle: "Quick questions, comparison and math interfaces.", items: [
      ["01","General questions","Simple everyday cognitive questions","/games/quiz-general"],
      ["02","Quick comparison","Choose the larger or smaller value quickly","/games/quiz-compare"],
      ["03","Quick math","Solve simple operations before time runs out","/games/quiz-math"] ] }
  }
};

const COMMON_TR = {
  ar: { lang:"ar", dir:"rtl", sidebarSubtitle:"واجهة الفئة", navDashboard:"الرئيسية", navExercises:"التمارين", navProgress:"التقدم", navSettings:"الإعدادات", logout:"تسجيل الخروج", back:"رجوع", categorySubtitleFallback:"اختر الواجهة أو اللعبة المناسبة" },
  fr: { lang:"fr", dir:"ltr", sidebarSubtitle:"Interface de catégorie", navDashboard:"Accueil", navExercises:"Exercices", navProgress:"Progrès", navSettings:"Paramètres", logout:"Se déconnecter", back:"Retour", categorySubtitleFallback:"Choisissez l’interface ou le jeu approprié" },
  en: { lang:"en", dir:"ltr", sidebarSubtitle:"Category interface", navDashboard:"Dashboard", navExercises:"Exercises", navProgress:"Progress", navSettings:"Settings", logout:"Sign out", back:"Back", categorySubtitleFallback:"Choose the relevant interface or game" }
};

let currentLang = localStorage.getItem("nrw_lang") || "ar";
const categoryKey = document.body.dataset.category;

function getCategoryConfig() {
  return CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.memory;
}

function renderCategoryPage() {
  const common = COMMON_TR[currentLang] || COMMON_TR.ar;
  const category = getCategoryConfig();
  const local = category[currentLang] || category.ar;

  document.documentElement.lang = common.lang;
  document.documentElement.dir = common.dir;
  document.getElementById("sidebar-subtitle").textContent = common.sidebarSubtitle;
  document.getElementById("nav-dashboard").textContent = common.navDashboard;
  document.getElementById("nav-exercises").textContent = common.navExercises;
  document.getElementById("nav-progress").textContent = common.navProgress;
  document.getElementById("nav-settings").textContent = common.navSettings;
  document.getElementById("logout-text").textContent = common.logout;
  document.getElementById("back-label").textContent = common.back;
  document.getElementById("category-title").textContent = local.title;
  document.getElementById("category-subtitle").textContent = local.subtitle || common.categorySubtitleFallback;
  document.getElementById("category-icon").innerHTML = SVG_ICONS[category.icon] || SVG_ICONS.brain;

  document.getElementById("subcategory-grid").innerHTML = local.items.map(item => `
    <div class="sg-c" onclick="window.location.href='${item[3]}'">
      <div class="sg-num">${item[0]}</div>
      <div class="sg-t">${item[1]}</div>
      <div class="sg-d">${item[2]}</div>
    </div>
  `).join("");

  document.querySelectorAll(".slp").forEach(btn => {
    btn.classList.toggle("on", btn.textContent.trim().toLowerCase() === currentLang);
  });
}

window.setCategoryLang = function(lang) {
  localStorage.setItem("nrw_lang", lang);
  currentLang = lang;
  renderCategoryPage();
};

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "/";
});

window.logout = function() {
  signOut(auth).then(() => window.location.href = "/");
};

renderCategoryPage();
