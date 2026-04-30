import { auth } from "/static/js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createSession, completeSession, cancelSession } from "/static/js/session-service.js";
import { startExercise, completeExercise, abandonExercise } from "/static/js/exercise-service.js";

const GAME_TRANSLATIONS = {
  ar: {
    sidebarSubtitle: "إعادة التأهيل",
    navDashboard: "الرئيسية",
    navGames: "التمارين",
    navProgress: "التقدم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",
    back: "رجوع",
    title: "حفظ الصور",
    subtitle: "شاهد الصور ثم تعرّف عليها لاحقًا.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة حفظ الصور",
    introText: "سيتم عرض مجموعة من الصور لثوانٍ قليلة، ثم ستظهر شبكة أكبر. اختر فقط الصور التي شاهدتها.",
    start: "إبدأ",
    memorize: "احفظ هذه الصور جيدًا",
    continue: "متابعة",
    chooseSeen: "اختر الصور التي رأيتها",
    validate: "تأكيد الإجابة",
    success: "إجابة صحيحة",
    fail: "إجابة غير كاملة",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/memory/.",
    imageLabelFallback: "صورة"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Mémoriser les images",
    subtitle: "Regardez puis retrouvez les images vues.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de mémorisation d’images",
    introText: "Un groupe d’images sera affiché pendant quelques secondes, puis une grille plus grande apparaîtra. Sélectionnez uniquement les images que vous avez vues.",
    start: "Commencer",
    memorize: "Mémorisez bien ces images",
    continue: "Continuer",
    chooseSeen: "Choisissez les images vues",
    validate: "Valider la réponse",
    success: "Bonne réponse",
    fail: "Réponse incomplète",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/memory/.",
    imageLabelFallback: "Image"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Memorize images",
    subtitle: "Observe then find the images you saw.",
    level: "Level",
    score: "Score",
    introTitle: "Image memory game",
    introText: "A group of images will be shown for a few seconds, then a larger grid will appear. Select only the images you actually saw.",
    start: "Start",
    memorize: "Memorize these images carefully",
    continue: "Continue",
    chooseSeen: "Choose the images you saw",
    validate: "Validate answer",
    success: "Correct answer",
    fail: "Incomplete answer",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/.",
    imageLabelFallback: "Image"
  }
};

const IMAGE_LIBRARY = {
  apple: {
    src: "/static/images/memory/apple.png",
    label: { ar: "تفاحة", fr: "Pomme", en: "Apple" }
  },
  banana: {
    src: "/static/images/memory/banana.png",
    label: { ar: "موز", fr: "Banane", en: "Banana" }
  },
  orange: {
    src: "/static/images/memory/orange.png",
    label: { ar: "برتقال", fr: "Orange", en: "Orange" }
  },
  grape: {
    src: "/static/images/memory/grape.png",
    label: { ar: "عنب", fr: "Raisin", en: "Grape" }
  },
  lemon: {
    src: "/static/images/memory/lemon.png",
    label: { ar: "ليمون", fr: "Citron", en: "Lemon" }
  },
  tree: {
    src: "/static/images/memory/tree.png",
    label: { ar: "شجرة", fr: "Arbre", en: "Tree" }
  },
  flower: {
    src: "/static/images/memory/flower.png",
    label: { ar: "زهرة", fr: "Fleur", en: "Flower" }
  },
  lion: {
    src: "/static/images/memory/lion.png",
    label: { ar: "أسد", fr: "Lion", en: "Lion" }
  },
  house: {
    src: "/static/images/memory/house.png",
    label: { ar: "منزل", fr: "Maison", en: "House" }
  },
  book: {
    src: "/static/images/memory/book.png",
    label: { ar: "كتاب", fr: "Livre", en: "Book" }
  },
  car: {
    src: "/static/images/memory/car.png",
    label: { ar: "سيارة", fr: "Voiture", en: "Car" }
  },
  dog: {
    src: "/static/images/memory/dog.png",
    label: { ar: "كلب", fr: "Chien", en: "Dog" }
  },
  cat: {
    src: "/static/images/memory/cat.png",
    label: { ar: "قط", fr: "Chat", en: "Cat" }
  }
};

const ROUNDS = [
  { shown: 3, totalChoices: 6 },
  { shown: 4, totalChoices: 8 },
  { shown: 5, totalChoices: 10 }
];

const IMAGE_KEYS = Object.keys(IMAGE_LIBRARY);

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentRoundIndex = 0;
let currentScore = 0;
let currentRoundData = null;
let gameEnded = false;
let loadedAssets = new Set();
let missingAssets = [];

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
}

function getImageLabel(key) {
  return (
    IMAGE_LIBRARY[key]?.label?.[currentLang] ||
    IMAGE_LIBRARY[key]?.label?.fr ||
    t("imageLabelFallback")
  );
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateStaticTexts() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

  document.getElementById("sidebar-subtitle").textContent = t("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = t("navDashboard");
  document.getElementById("nav-games").textContent = t("navGames");
  document.getElementById("nav-progress").textContent = t("navProgress");
  document.getElementById("nav-settings").textContent = t("navSettings");
  document.getElementById("logout-text").textContent = t("logout");
  document.getElementById("back-text").textContent = t("back");
  document.getElementById("game-title").textContent = t("title");
  document.getElementById("game-subtitle").textContent = t("subtitle");
  document.getElementById("game-round-label").textContent = `${t("level")} ${Math.min(currentRoundIndex + 1, ROUNDS.length)} / ${ROUNDS.length}`;
  document.getElementById("game-score-label").textContent = `${t("score")} : ${currentScore}`;

  document.querySelectorAll(".slp").forEach((btn) => btn.classList.remove("on"));
  const activeBtn = document.getElementById(`lang-${currentLang}`);
  if (activeBtn) activeBtn.classList.add("on");
}

window.setGameLang = function setGameLang(lang) {
  localStorage.setItem("nrw_lang", lang);
  currentLang = lang;
  updateStaticTexts();
  renderCurrentScreen();
};

function renderImageCard(key, cardClass = "") {
  const asset = IMAGE_LIBRARY[key];
  const label = getImageLabel(key);

  return `
    <div class="${cardClass}">
      <div class="memory-card-media">
        <img
          src="${asset.src}"
          alt="${label}"
          class="memory-real-img"
          loading="eager"
          draggable="false"
        >
      </div>
    </div>
  `;
}

function renderMissingAssetsMessage() {
  const root = document.getElementById("memory-game-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("imageLoadError")}</h3>
      <p>${t("assetsMissing")}</p>
      <div class="memory-missing-list">
        ${missingAssets.map((key) => `<span class="memory-missing-chip">${key}</span>`).join("")}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/memory'">${t("returnMemory")}</button>
      </div>
    </div>
  `;
}

async function preloadImages() {
  const entries = Object.entries(IMAGE_LIBRARY);

  const results = await Promise.all(
    entries.map(([key, asset]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ key, ok: true });
        img.onerror = () => resolve({ key, ok: false });
        img.src = asset.src;
      });
    })
  );

  loadedAssets = new Set(results.filter((r) => r.ok).map((r) => r.key));
  missingAssets = results.filter((r) => !r.ok).map((r) => r.key);
}

function renderIntro() {
  const root = document.getElementById("memory-game-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M9.5 2a2.5 2.5 0 0 1 4.9.44C16.1 3 17.5 4.4 17.5 6c0 .34-.04.67-.11 1H18a3 3 0 0 1 3 3c0 1.1-.6 2.1-1.5 2.6A3 3 0 0 1 18 18h-.5a2.5 2.5 0 0 1-4.9.44A2.5 2.5 0 0 1 9.5 16H9a3 3 0 0 1-1.5-5.6A3 3 0 0 1 9 4h.11A2.5 2.5 0 0 1 9.5 2z"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-game-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-game-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));

  const shownImages = shuffle(availableKeys).slice(0, config.shown);
  const distractors = shuffle(
    availableKeys.filter((key) => !shownImages.includes(key))
  ).slice(0, config.totalChoices - config.shown);

  const choices = shuffle([...shownImages, ...distractors]);

  currentRoundData = {
    shownImages,
    choices,
    selected: new Set(),
    phase: "memorize"
  };
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  if (currentRoundData.phase === "memorize") {
    renderMemorizePhase();
  } else if (currentRoundData.phase === "select") {
    renderSelectPhase();
  } else if (currentRoundData.phase === "result") {
    renderResultPhase();
  }
}

function renderMemorizePhase() {
  const root = document.getElementById("memory-game-root");
  root.innerHTML = `
    <div class="game-note">${t("memorize")}</div>
    <div class="memory-preview-grid">
      ${currentRoundData.shownImages.map((key) => renderImageCard(key, "memory-preview-card")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="continue-memory-btn">${t("continue")}</button>
    </div>
  `;

  document.getElementById("continue-memory-btn").onclick = () => {
    currentRoundData.phase = "select";
    renderCurrentScreen();
  };
}

function renderSelectPhase() {
  const root = document.getElementById("memory-game-root");
  root.innerHTML = `
    <div class="game-note">${t("chooseSeen")}</div>
    <div class="memory-choice-grid">
      ${currentRoundData.choices.map((key) => `
        <div class="memory-choice-card ${currentRoundData.selected.has(key) ? "selected" : ""}" data-key="${key}">
  <div class="memory-card-media">
    <img
      src="${IMAGE_LIBRARY[key].src}"
      alt="${getImageLabel(key)}"
      class="memory-real-img"
      loading="eager"
      draggable="false"
    >
  </div>
</div>
      `).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="validate-memory-btn">${t("validate")}</button>
    </div>
    <div class="game-feedback" id="memory-feedback"></div>
  `;

  document.querySelectorAll(".memory-choice-card").forEach((card) => {
    card.onclick = () => {
      const { key } = card.dataset;

      if (currentRoundData.selected.has(key)) {
        currentRoundData.selected.delete(key);
      } else {
        currentRoundData.selected.add(key);
      }

      renderSelectPhase();
    };
  });

  document.getElementById("validate-memory-btn").onclick = validateRound;
}

function validateRound() {
  const seenSet = new Set(currentRoundData.shownImages);
  const selectedSet = currentRoundData.selected;

  let roundScore = 0;
  for (const key of seenSet) {
    if (selectedSet.has(key)) roundScore += 1;
  }

  currentScore += roundScore;

  document.querySelectorAll(".memory-choice-card").forEach((card) => {
    const { key } = card.dataset;

    if (seenSet.has(key) && selectedSet.has(key)) {
      card.classList.add("ok");
    } else if (selectedSet.has(key) && !seenSet.has(key)) {
      card.classList.add("bad");
    } else if (seenSet.has(key) && !selectedSet.has(key)) {
      card.classList.add("missed");
    }

    card.style.pointerEvents = "none";
  });

  const feedback = document.getElementById("memory-feedback");
  const perfect = roundScore === currentRoundData.shownImages.length && selectedSet.size === seenSet.size;

  feedback.textContent = perfect ? t("success") : t("fail");
  feedback.className = `game-feedback ${perfect ? "ok" : "bad"}`;

  currentRoundData.phase = "result";

  setTimeout(() => {
    currentRoundIndex += 1;

    if (currentRoundIndex < ROUNDS.length) {
      generateRoundData();
      renderCurrentScreen();
    } else {
      finishGame();
    }
  }, 1400);
}

function renderResultPhase() {
  // phase transitoire gérée par validateRound + timeout
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-images"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_images",
    category: "memory",
    maxScore,
    metadata: {
      rounds: ROUNDS.length,
      assetMode: "local-images",
      imagePoolSize: IMAGE_KEYS.length
    }
  });
  currentResultId = exercise.resultId;

  generateRoundData();
  renderCurrentScreen();
}

async function finishGame() {
  gameEnded = true;

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);
  const accuracyPercent = Math.round((currentScore / maxScore) * 100);

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        accuracyPercent,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-images completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-game-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/memory'">${t("returnMemory")}</button>
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
          round: currentRoundIndex + 1,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-images abandoned"
      });
    }
  } catch (error) {
    console.error("Leave game error:", error);
  }

  window.location.href = "/exercises/memory";
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
  updateStaticTexts();

  await preloadImages();
  renderIntro();
});