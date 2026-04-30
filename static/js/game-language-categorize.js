import { auth } from "/static/js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createSession, completeSession, cancelSession } from "/static/js/session-service.js";
import { startExercise, completeExercise, abandonExercise } from "/static/js/exercise-service.js";

const T = {
  ar: {
    sidebarSubtitle: "إعادة التأهيل",
    navDashboard: "الرئيسية",
    navGames: "التمارين",
    navProgress: "التقدم",
    navAvc: "الوقاية من السكتة الدماغية",
    navMotor: "الحركي والتقييم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",
    back: "رجوع",
    title: "التصنيف",
    subtitle: "انظر إلى الصورة ثم انطق الكلمة الصحيحة من بين الكلمات المقترحة.",
    introTitle: "لعبة التصنيف",
    introText: "تظهر صورة حقيقية ومعها كلمتان أو ثلاث كلمات. يجب عليك نطق الكلمة التي تناسب الصورة.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    item: "العنصر",
    correct: "نطق صحيح",
    wrong: "نطق غير صحيح",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnLanguage: "العودة إلى اللغة",
    choicesTitle: "الخيارات الممكنة",
    speakNow: "تحدث الآن",
    listening: "جاري الاستماع...",
    practiceHint: "اضغط على الميكروفون ثم انطق الكلمة الصحيحة.",
    startMic: "ابدأ التسجيل",
    retry: "إعادة المحاولة",
    next: "التالي",
    wrongAnswers: "الأخطاء",
    correctAnswers: "النطق الصحيح",
    recognized: "النص الملتقط",
    micUnsupported: "التعرف الصوتي غير مدعوم في هذا المتصفح.",
    micDenied: "تعذر الوصول إلى الميكروفون أو فشل التعرف الصوتي.",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/language/."
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Accueil",
    navGames: "Exercices",
    navProgress: "Progrès",
    navAvc: "Prévention AVC",
    navMotor: "Moteur et bilan",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Catégoriser",
    subtitle: "Regardez l’image puis prononcez le bon mot parmi les catégories proposées.",
    introTitle: "Jeu catégoriser",
    introText: "Une vraie image s’affiche avec deux ou trois mots possibles. Vous devez prononcer celui qui correspond à l’image.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    item: "Élément",
    correct: "Prononciation correcte",
    wrong: "Prononciation incorrecte",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnLanguage: "Retour langage",
    choicesTitle: "Choix possibles",
    speakNow: "Parlez maintenant",
    listening: "Écoute en cours...",
    practiceHint: "Appuyez sur le micro puis prononcez le bon mot.",
    startMic: "Démarrer le micro",
    retry: "Réessayer",
    next: "Suivant",
    wrongAnswers: "Erreurs",
    correctAnswers: "Prononciations justes",
    recognized: "Texte reconnu",
    micUnsupported: "La reconnaissance vocale n’est pas prise en charge par ce navigateur.",
    micDenied: "Impossible d’accéder au micro ou échec de la reconnaissance vocale.",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/language/."
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Home",
    navGames: "Exercises",
    navProgress: "Progress",
    navAvc: "Stroke Prevention",
    navMotor: "Motor and assessment",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Categorize",
    subtitle: "Look at the image, then pronounce the correct word among the proposed categories.",
    introTitle: "Categorize game",
    introText: "A real image is shown with two or three possible words. You must pronounce the one that matches the image.",
    start: "Start",
    level: "Level",
    score: "Score",
    item: "Item",
    correct: "Correct pronunciation",
    wrong: "Incorrect pronunciation",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnLanguage: "Back to language",
    choicesTitle: "Possible choices",
    speakNow: "Speak now",
    listening: "Listening...",
    practiceHint: "Press the microphone, then pronounce the correct word.",
    startMic: "Start microphone",
    retry: "Try again",
    next: "Next",
    wrongAnswers: "Mistakes",
    correctAnswers: "Correct pronunciations",
    recognized: "Recognized text",
    micUnsupported: "Speech recognition is not supported in this browser.",
    micDenied: "Could not access the microphone or recognition failed.",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/language/."
  }
};

const ITEM_LIBRARY = {
  apple: {
    src: "/static/images/language/apple.png",
    correctFr: "tefaha",
    correctAr: "تفاحة",
    accepted: ["tefaha", "tfaha", "تفاحة"],
    options: [
      { fr: "tefaha", ar: "تفاحة" },
      { fr: "kelb", ar: "كلب" },
      { fr: "bab", ar: "باب" }
    ]
  },
  dog: {
    src: "/static/images/language/dog.png",
    correctFr: "kelb",
    correctAr: "كلب",
    accepted: ["kelb", "kalb", "كلب"],
    options: [
      { fr: "kelb", ar: "كلب" },
      { fr: "warda", ar: "وردة" },
      { fr: "ma", ar: "ما" }
    ]
  },
  phone: {
    src: "/static/images/language/phone.png",
    correctFr: "tilifoun",
    correctAr: "تيليفون",
    accepted: ["tilifoun", "telefon", "تيليفون"],
    options: [
      { fr: "tilifoun", ar: "تيليفون" },
      { fr: "khobz", ar: "خبز" },
      { fr: "dar", ar: "دار" }
    ]
  },
  bread: {
    src: "/static/images/language/bread.png",
    correctFr: "khobz",
    correctAr: "خبز",
    accepted: ["khobz", "خبز"],
    options: [
      { fr: "khobz", ar: "خبز" },
      { fr: "nahla", ar: "نحلة" },
      { fr: "kas", ar: "كاس" }
    ]
  },
  water: {
    src: "/static/images/language/water.png",
    correctFr: "ma",
    correctAr: "ما",
    accepted: ["ma", "maa", "ما"],
    options: [
      { fr: "ma", ar: "ما" },
      { fr: "meftah", ar: "مفتاح" },
      { fr: "kelb", ar: "كلب" }
    ]
  },
  book: {
    src: "/static/images/language/book.png",
    correctFr: "ktab",
    correctAr: "كتاب",
    accepted: ["ktab", "كتاب"],
    options: [
      { fr: "ktab", ar: "كتاب" },
      { fr: "warda", ar: "وردة" },
      { fr: "douda", ar: "دودة" }
    ]
  },
  chair: {
    src: "/static/images/language/chair.png",
    correctFr: "koursi",
    correctAr: "كورسي",
    accepted: ["koursi", "kursi", "كورسي", "كرسي"],
    options: [
      { fr: "koursi", ar: "كورسي" },
      { fr: "teldj", ar: "تلج" },
      { fr: "bab", ar: "باب" }
    ]
  },
  house: {
    src: "/static/images/language/house.png",
    correctFr: "dar",
    correctAr: "دار",
    accepted: ["dar", "دار"],
    options: [
      { fr: "dar", ar: "دار" },
      { fr: "faracha", ar: "فراشة" },
      { fr: "kas", ar: "كاس" }
    ]
  },
  tree: {
    src: "/static/images/language/tree.png",
    correctFr: "chedjra",
    correctAr: "شجرة",
    accepted: ["chedjra", "chadjra", "shajra", "شجرة"],
    options: [
      { fr: "chedjra", ar: "شجرة" },
      { fr: "douda", ar: "دودة" },
      { fr: "tilifoun", ar: "تيليفون" }
    ]
  },
  flower: {
    src: "/static/images/language/flower.png",
    correctFr: "warda",
    correctAr: "وردة",
    accepted: ["warda", "وردة"],
    options: [
      { fr: "warda", ar: "وردة" },
      { fr: "khobz", ar: "خبز" },
      { fr: "djbel", ar: "جبل" }
    ]
  },
  cup: {
    src: "/static/images/language/cup.png",
    correctFr: "kas",
    correctAr: "كاس",
    accepted: ["kas", "kass", "كاس"],
    options: [
      { fr: "kas", ar: "كاس" },
      { fr: "richa", ar: "ريشة" },
      { fr: "bab", ar: "باب" }
    ]
  },
  hand: {
    src: "/static/images/language/hand.png",
    correctFr: "yed",
    correctAr: "يد",
    accepted: ["yed", "يد"],
    options: [
      { fr: "yed", ar: "يد" },
      { fr: "nahla", ar: "نحلة" },
      { fr: "dar", ar: "دار" }
    ]
  },
  star: {
    src: "/static/images/language/star.png",
    correctFr: "nedjma",
    correctAr: "نجمة",
    accepted: ["nedjma", "nejma", "نجمة"],
    options: [
      { fr: "nedjma", ar: "نجمة" },
      { fr: "khobz", ar: "خبز" },
      { fr: "kelb", ar: "كلب" }
    ]
  },
  mountain: {
    src: "/static/images/language/mountain.png",
    correctFr: "djbel",
    correctAr: "جبل",
    accepted: ["djbel", "jbel", "جبل"],
    options: [
      { fr: "djbel", ar: "جبل" },
      { fr: "warda", ar: "وردة" },
      { fr: "kas", ar: "كاس" }
    ]
  },
  rock: {
    src: "/static/images/language/rock.png",
    correctFr: "hdjer",
    correctAr: "حجر",
    accepted: ["hdjer", "hjar", "حجر"],
    options: [
      { fr: "hdjer", ar: "حجر" },
      { fr: "tilifoun", ar: "تيليفون" },
      { fr: "faracha", ar: "فراشة" }
    ]
  },
  snow: {
    src: "/static/images/language/snow.png",
    correctFr: "teldj",
    correctAr: "تلج",
    accepted: ["teldj", "telj", "تلج"],
    options: [
      { fr: "teldj", ar: "تلج" },
      { fr: "kelb", ar: "كلب" },
      { fr: "tefaha", ar: "تفاحة" }
    ]
  },
  feather: {
    src: "/static/images/language/feather.png",
    correctFr: "richa",
    correctAr: "ريشة",
    accepted: ["richa", "ريشة"],
    options: [
      { fr: "richa", ar: "ريشة" },
      { fr: "khobz", ar: "خبز" },
      { fr: "ma", ar: "ما" }
    ]
  },
  key: {
    src: "/static/images/language/key.png",
    correctFr: "meftah",
    correctAr: "مفتاح",
    accepted: ["meftah", "miftah", "مفتاح"],
    options: [
      { fr: "meftah", ar: "مفتاح" },
      { fr: "warda", ar: "وردة" },
      { fr: "yed", ar: "يد" }
    ]
  },
  worm: {
    src: "/static/images/language/worm.png",
    correctFr: "douda",
    correctAr: "دودة",
    accepted: ["douda", "دودة"],
    options: [
      { fr: "douda", ar: "دودة" },
      { fr: "dar", ar: "دار" },
      { fr: "kas", ar: "كاس" }
    ]
  },
  butterfly: {
    src: "/static/images/language/butterfly.png",
    correctFr: "faracha",
    correctAr: "فراشة",
    accepted: ["faracha", "farasha", "فراشة"],
    options: [
      { fr: "faracha", ar: "فراشة" },
      { fr: "khobz", ar: "خبز" },
      { fr: "djbel", ar: "جبل" }
    ]
  },
  bee: {
    src: "/static/images/language/bee.png",
    correctFr: "nahla",
    correctAr: "نحلة",
    accepted: ["nahla", "نحلة"],
    options: [
      { fr: "nahla", ar: "نحلة" },
      { fr: "bab", ar: "باب" },
      { fr: "teldj", ar: "تلج" }
    ]
  }
};

const LEVELS = [3, 3, 4, 4, 5, 5];
const ITEM_KEYS = Object.keys(ITEM_LIBRARY);

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let wrongAnswers = 0;
let itemCursor = 0;
let levelItems = [];
let gameEnded = false;
let loadedAssets = new Set();
let missingAssets = [];
let usedKeys = new Set();
let currentRecognitionInProgress = false;

function t(key) {
  return T[currentLang][key];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

function matchesAccepted(transcript, acceptedList) {
  const clean = normalizeText(transcript);
  if (!clean) return false;
  return acceptedList.some((candidate) => normalizeText(candidate) === clean);
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function recognizeOnce(SpeechCtor) {
  return new Promise((resolve, reject) => {
    const recognition = new SpeechCtor();
    recognition.lang = currentLang === "ar" ? "ar-DZ" : (currentLang === "fr" ? "fr-FR" : "en-US");
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let done = false;

    recognition.onresult = (event) => {
      if (done) return;
      done = true;

      const transcripts = [];
      for (let i = 0; i < event.results.length; i += 1) {
        for (let j = 0; j < event.results[i].length; j += 1) {
          transcripts.push(event.results[i][j].transcript);
        }
      }

      recognition.stop();
      resolve((transcripts[0] || "").trim());
    };

    recognition.onerror = (event) => {
      if (done) return;
      done = true;
      recognition.stop();
      reject(new Error(event.error || "speech-error"));
    };

    recognition.onnomatch = () => {
      if (done) return;
      done = true;
      recognition.stop();
      resolve("");
    };

    recognition.onend = () => {
      if (done) return;
      done = true;
      resolve("");
    };

    recognition.start();
  });
}

function updateTexts() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

  document.getElementById("sidebar-subtitle").textContent = t("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = t("navDashboard");
  document.getElementById("nav-games").textContent = t("navGames");
  document.getElementById("nav-progress").textContent = t("navProgress");
  document.getElementById("nav-avc").textContent = t("navAvc");
  document.getElementById("nav-motor").textContent = t("navMotor");
  document.getElementById("nav-settings").textContent = t("navSettings");
  document.getElementById("logout-text").textContent = t("logout");
  document.getElementById("back-text").textContent = t("back");
  document.getElementById("game-title").textContent = t("title");
  document.getElementById("game-subtitle").textContent = t("subtitle");
  document.getElementById("game-round-label").textContent = `${t("level")} ${Math.min(currentLevelIndex + 1, LEVELS.length)} / ${LEVELS.length}`;
  document.getElementById("game-score-label").textContent = `${t("score")} : ${currentScore}`;

  document.querySelectorAll(".slp").forEach((btn) => btn.classList.remove("on"));
  const activeBtn = document.getElementById(`lang-${currentLang}`);
  if (activeBtn) activeBtn.classList.add("on");
}

window.setGameLang = function setGameLang(lang) {
  localStorage.setItem("nrw_lang", lang);
  currentLang = lang;
  updateTexts();
  renderCurrentScreen();
};

async function preloadImages() {
  const entries = Object.entries(ITEM_LIBRARY);
  const results = await Promise.all(
    entries.map(([key, asset]) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ key, ok: true });
      img.onerror = () => resolve({ key, ok: false });
      img.src = asset.src;
    }))
  );

  loadedAssets = new Set(results.filter((r) => r.ok).map((r) => r.key));
  missingAssets = results.filter((r) => !r.ok).map((r) => r.key);
}

function renderMissingAssets() {
  const root = document.getElementById("language-categorize-root");
  root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t("imageLoadError")}</h3>
      <p>${t("assetsMissing")}</p>
      <div class="memory-missing-list">
        ${missingAssets.map((key) => `<span class="memory-missing-chip">${key}</span>`).join("")}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/language'">${t("returnLanguage")}</button>
      </div>
    </div>
  `;
}

function pickLevelItems(levelIndex) {
  const count = LEVELS[levelIndex];
  let available = ITEM_KEYS.filter((key) => loadedAssets.has(key) && !usedKeys.has(key));

  if (available.length < count) {
    usedKeys = new Set();
    available = ITEM_KEYS.filter((key) => loadedAssets.has(key));
  }

  const picked = shuffle(available).slice(0, count);
  picked.forEach((k) => usedKeys.add(k));
  return picked;
}

function renderIntro() {
  updateTexts();

  const root = document.getElementById("language-categorize-root");

  if (missingAssets.length > 0) {
    renderMissingAssets();
    return;
  }

  root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-language-categorize-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-language-categorize-btn").onclick = startGame;
}

function renderCurrentScreen() {
  updateTexts();

  if (!levelItems.length && !gameEnded) {
    renderIntro();
    return;
  }

  renderPracticeItem();
}

function renderPracticeItem() {
  updateTexts();

  const root = document.getElementById("language-categorize-root");
  const key = levelItems[itemCursor];
  const asset = ITEM_LIBRARY[key];

  currentRecognitionInProgress = false;

  root.innerHTML = `
    <div class="language-shell-card">
      <div class="quiz-meta-row">
        <div class="quiz-mini-badge">${t("item")} ${itemCursor + 1} / ${levelItems.length}</div>
        <div class="quiz-mini-badge">${t("wrongAnswers")} : ${wrongAnswers}</div>
      </div>

      <div class="language-image-card">
        <img src="${asset.src}" alt="${asset.correctFr}" class="language-main-image" draggable="false">
      </div>

      <div class="language-pronunciation-card language-pronunciation-card-main">
        <div class="language-pronunciation-head">${t("choicesTitle")}</div>
        <div class="language-category-options">
          ${asset.options.map((opt) => `
            <span class="language-category-chip">
              <span class="language-chip-ar">${opt.ar}</span>
              <span class="language-chip-fr">${opt.fr}</span>
            </span>
          `).join("")}
        </div>
        <div class="language-pronunciation-hint">${t("practiceHint")}</div>
      </div>

      <div class="language-action-row">
        <button class="go-btn" id="start-mic-btn">${t("startMic")}</button>
        <button class="btn-sec" id="retry-btn">${t("retry")}</button>
        <button class="btn-sec" id="next-btn" disabled>${t("next")}</button>
      </div>

      <div class="game-feedback" id="language-categorize-feedback"></div>
    </div>
  `;

  document.getElementById("start-mic-btn").onclick = startRecognitionForCurrentItem;
  document.getElementById("retry-btn").onclick = () => renderPracticeItem();
  document.getElementById("next-btn").onclick = goNextItem;
}
async function startRecognitionForCurrentItem() {
  if (currentRecognitionInProgress) return;

  const key = levelItems[itemCursor];
  const asset = ITEM_LIBRARY[key];
  const fb = document.getElementById("language-categorize-feedback");
  const nextBtn = document.getElementById("next-btn");
  const micBtn = document.getElementById("start-mic-btn");
  const SpeechCtor = getSpeechRecognitionCtor();

  if (!SpeechCtor) {
    fb.textContent = t("micUnsupported");
    fb.className = "game-feedback bad";
    return;
  }

  currentRecognitionInProgress = true;
  micBtn.disabled = true;
  micBtn.textContent = t("listening");
  fb.textContent = t("speakNow");
  fb.className = "game-feedback";

  try {
    const transcript = await recognizeOnce(SpeechCtor);
    const ok = matchesAccepted(transcript, asset.accepted);

    if (ok) {
      currentScore += 1;
      fb.textContent = t("correct");
      fb.className = "game-feedback ok";
    } else {
      wrongAnswers += 1;
      fb.textContent = t("wrong");
      fb.className = "game-feedback bad";
    }

    nextBtn.disabled = false;
  } catch (err) {
    console.error(err);
    fb.textContent = t("micDenied");
    fb.className = "game-feedback bad";
  } finally {
    currentRecognitionInProgress = false;
    micBtn.disabled = false;
    micBtn.textContent = t("startMic");
  }
}

function goNextItem() {
  itemCursor += 1;

  if (itemCursor < levelItems.length) {
    renderPracticeItem();
    return;
  }

  currentLevelIndex += 1;

  if (currentLevelIndex < LEVELS.length) {
    levelItems = pickLevelItems(currentLevelIndex);
    itemCursor = 0;
    renderPracticeItem();
  } else {
    finishGame();
  }
}

async function startGame() {
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  wrongAnswers = 0;
  itemCursor = 0;
  usedKeys = new Set();
  gameEnded = false;

  levelItems = pickLevelItems(0);

  const maxScore = LEVELS.reduce((sum, v) => sum + v, 0);

  const session = await createSession(currentUser.uid, {
    source: "language-categorize"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "language_categorize",
    category: "language",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      itemsShown: maxScore,
      correctPronunciations: 0,
      wrongPronunciations: 0,
      speechRecognitionEnabled: true,
      mode: "categorize-pronunciation",
      assetMode: "local-images",
      imagePoolSize: ITEM_KEYS.length
    }
  });
  currentResultId = exercise.resultId;

  renderPracticeItem();
}

async function finishGame() {
  gameEnded = true;
  const maxScore = LEVELS.reduce((sum, v) => sum + v, 0);
  const accuracyPercent = Math.round((currentScore / maxScore) * 100);

  await completeExercise(currentUser.uid, currentResultId, {
    score: currentScore,
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      itemsShown: maxScore,
      correctPronunciations: currentScore,
      wrongPronunciations: wrongAnswers,
      accuracyPercent,
      speechRecognitionEnabled: true,
      mode: "categorize-pronunciation",
      assetMode: "local-images",
      imagePoolSize: ITEM_KEYS.length
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "language-categorize completed"
  });

  const root = document.getElementById("language-categorize-root");
  root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("correctAnswers")} : ${currentScore}</p>
      <p>${t("wrongAnswers")} : ${wrongAnswers}</p>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/language'">${t("returnLanguage")}</button>
      </div>
    </div>
  `;
}

window.leaveGame = async function leaveGame() {
  try {
    if (currentUser && currentResultId && !gameEnded) {
      await abandonExercise(currentUser.uid, currentResultId, {
        metadata: {
          leftEarly: true,
          round: currentLevelIndex + 1,
          correctPronunciations: currentScore,
          wrongPronunciations: wrongAnswers
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "language-categorize abandoned"
      });
    }
  } catch (e) {
    console.error(e);
  }

  window.location.href = "/exercises/language";
};

window.logout = function logout() {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  currentUser = user;
  await preloadImages();
  renderIntro();
});