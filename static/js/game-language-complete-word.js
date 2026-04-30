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
    title: "إكمال الكلمة",
    subtitle: "انطق الكلمة الكاملة انطلاقاً من الكلمة الناقصة.",
    introTitle: "لعبة إكمال الكلمة",
    introText: "تظهر صورة وكلمة ناقصة، يجب عليك النظر إلى الصورة ثم نطق الكلمة المناسبة.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    item: "العنصر",
    correct: "نطق صحيح",
    wrong: "نطق غير صحيح",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnLanguage: "العودة إلى اللغة",
    wordHint: "الكلمة الناقصة",
    speakNow: "تحدث الآن",
    listening: "جاري الاستماع...",
    practiceHint: "اضغط على الميكروفون ثم انطق الكلمة الكاملة بوضوح.",
    startMic: "ابدأ التسجيل",
    retry: "إعادة المحاولة",
    next: "التالي",
    wrongAnswers: "الأخطاء",
    correctAnswers: "النطق الصحيح",
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
    title: "Compléter le mot",
    subtitle: "Prononcez le mot complet à partir du mot incomplet.",
    introTitle: "Jeu compléter le mot",
    introText: "Une image et un mot incomplet s’affichent, vous devez regarder l'image puis prononcer le mot qui convient.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    item: "Élément",
    correct: "Prononciation correcte",
    wrong: "Prononciation incorrecte",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnLanguage: "Retour langage",
    wordHint: "Mot incomplet",
    speakNow: "Parlez maintenant",
    listening: "Écoute en cours...",
    practiceHint: "Appuyez sur le micro puis prononcez clairement le mot complet.",
    startMic: "Démarrer le micro",
    retry: "Réessayer",
    next: "Suivant",
    wrongAnswers: "Erreurs",
    correctAnswers: "Prononciations justes",
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
    title: "Complete the word",
    subtitle: "Pronounce the full word from the incomplete word.",
    introTitle: "Complete the word game",
    introText: "An image and an incomplete word are shown. You must look at the image, then pronounce the matching word.",
    start: "Start",
    level: "Level",
    score: "Score",
    item: "Item",
    correct: "Correct pronunciation",
    wrong: "Incorrect pronunciation",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnLanguage: "Back to language",
    wordHint: "Incomplete word",
    speakNow: "Speak now",
    listening: "Listening...",
    practiceHint: "Press the microphone, then pronounce the full word clearly.",
    startMic: "Start microphone",
    retry: "Try again",
    next: "Next",
    wrongAnswers: "Mistakes",
    correctAnswers: "Correct pronunciations",
    micUnsupported: "Speech recognition is not supported in this browser.",
    micDenied: "Could not access the microphone or recognition failed.",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/language/."
  }
};

const WORD_LIBRARY = {
  book:      { src: "/static/images/language/book.png",      full: "ktab",     display: "ك□اب",     accepted: ["ktab", "كتاب"] },
  door:      { src: "/static/images/language/door.png",      full: "bab",      display: "ب□ب",      accepted: ["bab", "باب"] },
  chair:     { src: "/static/images/language/chair.png",     full: "koursi",   display: "كو□سي",    accepted: ["koursi", "kursi", "كورسي", "كرسي"] },
  house:     { src: "/static/images/language/house.png",     full: "dar",      display: "د□ر",      accepted: ["dar", "دار"] },
  tree:      { src: "/static/images/language/tree.png",      full: "chedjra",  display: "شج□ة",     accepted: ["chedjra", "chadjra", "shajra", "شجرة"] },
  flower:    { src: "/static/images/language/flower.png",    full: "warda",    display: "ور□ة",     accepted: ["warda", "وردة"] },
  dog:       { src: "/static/images/language/dog.png",       full: "kelb",     display: "ك□ب",      accepted: ["kelb", "kalb", "كلب"] },
  apple:     { src: "/static/images/language/apple.png",     full: "tefaha",   display: "تف□حة",    accepted: ["tefaha", "tfaha", "تفاحة"] },
  phone:     { src: "/static/images/language/phone.png",     full: "tilifoun", display: "تيلي□ون",  accepted: ["tilifoun", "telefon", "تيليفون"] },
  cup:       { src: "/static/images/language/cup.png",       full: "kas",      display: "ك□س",      accepted: ["kas", "kass", "كاس"] },
  hand:      { src: "/static/images/language/hand.png",      full: "yed",      display: "ي□د",      accepted: ["yed", "يد"] },
  bread:     { src: "/static/images/language/bread.png",     full: "khobz",    display: "خ□ز",      accepted: ["khobz", "خبز"] },
  water:     { src: "/static/images/language/water.png",     full: "ma",       display: "م□",       accepted: ["ma", "maa", "ما"] },
  star:      { src: "/static/images/language/star.png",      full: "nedjma",   display: "نج□ة",     accepted: ["nedjma", "nejma", "نجمة"] },
  mountain:  { src: "/static/images/language/mountain.png",  full: "djbel",    display: "ج□ل",      accepted: ["djbel", "jbel", "جبل"] },
  rock:      { src: "/static/images/language/rock.png",      full: "hdjer",    display: "ح□ر",      accepted: ["hdjer", "hjar", "حجر"] },
  snow:      { src: "/static/images/language/snow.png",      full: "teldj",    display: "ت□ج",      accepted: ["teldj", "telj", "تلج"] },
  feather:   { src: "/static/images/language/feather.png",   full: "richa",    display: "ري□ة",     accepted: ["richa", "ريشة"] },
  key:       { src: "/static/images/language/key.png",       full: "meftah",   display: "مفت□ح",    accepted: ["meftah", "miftah", "مفتاح"] },
  worm:      { src: "/static/images/language/worm.png",      full: "douda",    display: "دو□ة",     accepted: ["douda", "دودة"] },
  butterfly: { src: "/static/images/language/butterfly.png", full: "faracha",  display: "فرا□ة",    accepted: ["faracha", "farasha", "فراشة"] },
  bee:       { src: "/static/images/language/bee.png",       full: "nahla",    display: "نح□ة",     accepted: ["nahla", "نحلة"] }
};

const LEVELS = [3, 3, 4, 4, 5, 5];
const WORD_KEYS = Object.keys(WORD_LIBRARY);

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
  const entries = Object.entries(WORD_LIBRARY);
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
  const root = document.getElementById("language-complete-word-root");
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
  let available = WORD_KEYS.filter((key) => loadedAssets.has(key) && !usedKeys.has(key));

  if (available.length < count) {
    usedKeys = new Set();
    available = WORD_KEYS.filter((key) => loadedAssets.has(key));
  }

  const picked = shuffle(available).slice(0, count);
  picked.forEach((k) => usedKeys.add(k));
  return picked;
}

function renderIntro() {
  updateTexts();

  const root = document.getElementById("language-complete-word-root");

  if (missingAssets.length > 0) {
    renderMissingAssets();
    return;
  }

  root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-language-complete-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-language-complete-btn").onclick = startGame;
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

  const root = document.getElementById("language-complete-word-root");
  const key = levelItems[itemCursor];
  const asset = WORD_LIBRARY[key];

  currentRecognitionInProgress = false;

  root.innerHTML = `
    <div class="language-shell-card">
      <div class="quiz-meta-row">
        <div class="quiz-mini-badge">${t("item")} ${itemCursor + 1} / ${levelItems.length}</div>
        <div class="quiz-mini-badge">${t("wrongAnswers")} : ${wrongAnswers}</div>
      </div>

      <div class="language-image-card">
        <img src="${asset.src}" alt="${asset.full}" class="language-main-image" draggable="false">
      </div>

      <div class="language-pronunciation-card language-pronunciation-card-main">
        <div class="language-pronunciation-head">${t("wordHint")}</div>
        <div class="language-word-main">${asset.display}</div>
        <div class="language-pronunciation-hint">${t("practiceHint")}</div>
      </div>

      <div class="language-action-row">
        <button class="go-btn" id="start-mic-btn">${t("startMic")}</button>
        <button class="btn-sec" id="retry-btn">${t("retry")}</button>
        <button class="btn-sec" id="next-btn" disabled>${t("next")}</button>
      </div>

      <div class="game-feedback" id="language-complete-feedback"></div>
    </div>
  `;

  document.getElementById("start-mic-btn").onclick = startRecognitionForCurrentItem;
  document.getElementById("retry-btn").onclick = () => renderPracticeItem();
  document.getElementById("next-btn").onclick = goNextItem;
}

async function startRecognitionForCurrentItem() {
  if (currentRecognitionInProgress) return;

  const key = levelItems[itemCursor];
  const asset = WORD_LIBRARY[key];
  const fb = document.getElementById("language-complete-feedback");
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
    source: "language-complete-word"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "language_complete_word",
    category: "language",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      itemsShown: maxScore,
      correctPronunciations: 0,
      wrongPronunciations: 0,
      speechRecognitionEnabled: true,
      mode: "complete-word-pronunciation"
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
      assetMode: "local-images",
      imagePoolSize: WORD_KEYS.length,
      speechRecognitionEnabled: true,
      mode: "complete-word-pronunciation"
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "language-complete-word completed"
  });

  const root = document.getElementById("language-complete-word-root");
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
        notes: "language-complete-word abandoned"
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