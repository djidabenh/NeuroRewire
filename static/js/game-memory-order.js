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
    title: "إعادة ترتيب الصور",
    subtitle: "أعد الصور إلى ترتيبها الصحيح.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة ترتيب الصور",
    introText: "ستظهر لك مجموعة صور بترتيب معين. احفظ الترتيب ثم أعد وضع الصور بنفس الترتيب الصحيح.",
    start: "إبدأ",
    continue: "متابعة",
    memorize: "احفظ هذا الترتيب",
    reorder: "أعد ترتيب الصور",
    validate: "تأكيد الترتيب",
    success: "ترتيب صحيح",
    fail: "الترتيب غير صحيح",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/memory/.",
    imageLabelFallback: "صورة",
    currentSequence: "الترتيب المطلوب",
    yourSequence: "الترتيب الحالي",
    tip: "اسحب الصور وأفلتها لإعادتها إلى الترتيب الصحيح."
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Remettre en ordre",
    subtitle: "Remettez les images dans le bon ordre.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de remise en ordre",
    introText: "Une série d’images sera affichée dans un ordre précis. Mémorisez cet ordre puis remettez-les exactement dans le bon ordre.",
    start: "Commencer",
    continue: "Continuer",
    memorize: "Mémorisez cet ordre",
    reorder: "Remettez les images en ordre",
    validate: "Valider l’ordre",
    success: "Ordre correct",
    fail: "Ordre incorrect",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/memory/.",
    imageLabelFallback: "Image",
    currentSequence: "Ordre à mémoriser",
    yourSequence: "Votre ordre actuel",
    tip: "Faites glisser les images pour les remettre dans le bon ordre."
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Put in order",
    subtitle: "Put the images back in the correct order.",
    level: "Level",
    score: "Score",
    introTitle: "Order memory game",
    introText: "A sequence of images will be shown in a specific order. Memorize it, then place the images back in the exact same order.",
    start: "Start",
    continue: "Continue",
    memorize: "Memorize this order",
    reorder: "Put the images back in order",
    validate: "Validate order",
    success: "Correct order",
    fail: "Wrong order",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/.",
    imageLabelFallback: "Image",
    currentSequence: "Target order",
    yourSequence: "Your current order",
    tip: "Drag and drop the images to restore the correct order."
  }
};

const IMAGE_LIBRARY = {
  apple: { src: "/static/images/memory/apple.png", label: { ar: "تفاحة", fr: "Pomme", en: "Apple" } },
  banana: { src: "/static/images/memory/banana.png", label: { ar: "موز", fr: "Banane", en: "Banana" } },
  orange: { src: "/static/images/memory/orange.png", label: { ar: "برتقال", fr: "Orange", en: "Orange" } },
  grape: { src: "/static/images/memory/grape.png", label: { ar: "عنب", fr: "Raisin", en: "Grape" } },
  lemon: { src: "/static/images/memory/lemon.png", label: { ar: "ليمون", fr: "Citron", en: "Lemon" } },
  tree: { src: "/static/images/memory/tree.png", label: { ar: "شجرة", fr: "Arbre", en: "Tree" } },
  flower: { src: "/static/images/memory/flower.png", label: { ar: "زهرة", fr: "Fleur", en: "Flower" } },
  lion: { src: "/static/images/memory/lion.png", label: { ar: "أسد", fr: "Lion", en: "Lion" } },
  house: { src: "/static/images/memory/house.png", label: { ar: "منزل", fr: "Maison", en: "House" } },
  book: { src: "/static/images/memory/book.png", label: { ar: "كتاب", fr: "Livre", en: "Book" } },
  car: { src: "/static/images/memory/car.png", label: { ar: "سيارة", fr: "Voiture", en: "Car" } },
  dog: { src: "/static/images/memory/dog.png", label: { ar: "كلب", fr: "Chien", en: "Dog" } },
  cat: { src: "/static/images/memory/cat.png", label: { ar: "قط", fr: "Chat", en: "Cat" } }
};

const ROUNDS = [
  { shown: 3 },
  { shown: 4 },
  { shown: 5 }
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
let totalCorrectPlacements = 0;
let totalPlacements = 0;
let draggedIndex = null;

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

function renderMissingAssetsMessage() {
  const root = document.getElementById("memory-order-root");
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

function renderIntro() {
  const root = document.getElementById("memory-order-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M8 6h13M8 12h13M8 18h13"/>
          <circle cx="4" cy="6" r="1.5"/>
          <circle cx="4" cy="12" r="1.5"/>
          <circle cx="4" cy="18" r="1.5"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-order-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-order-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));
  const targetOrder = shuffle(availableKeys).slice(0, config.shown);

  let shuffledOrder = shuffle(targetOrder);
  let protection = 0;

  while (JSON.stringify(shuffledOrder) === JSON.stringify(targetOrder) && protection < 10) {
    shuffledOrder = shuffle(targetOrder);
    protection += 1;
  }

  currentRoundData = {
    targetOrder,
    workingOrder: shuffledOrder,
    phase: "memorize"
  };
}

function moveDraggedItem(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex == null || toIndex == null) return;

  const copy = [...currentRoundData.workingOrder];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  currentRoundData.workingOrder = copy;
}

function renderImageOrderCard(key, index, mode = "display") {
  const label = getImageLabel(key);
  const asset = IMAGE_LIBRARY[key];
  const roundClass = currentRoundData?.targetOrder?.length === 3 ? " round-small" : "";

  if (mode === "display") {
    return `
      <div class="memory-order-display-card${roundClass}">
        <div class="memory-order-index">${index + 1}</div>
        <div class="memory-card-media">
          <img src="${asset.src}" alt="${label}" class="memory-real-img" loading="eager" draggable="false">
        </div>
      </div>
    `;
  }

  return `
    <div
      class="memory-order-play-card${roundClass}"
      draggable="true"
      data-index="${index}"
    >
      <div class="memory-order-index">${index + 1}</div>
      <div class="memory-card-media">
        <img src="${asset.src}" alt="${label}" class="memory-real-img" loading="eager" draggable="false">
      </div>
    </div>
  `;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  if (currentRoundData.phase === "memorize") {
    renderMemorizePhase();
  } else if (currentRoundData.phase === "reorder") {
    renderReorderPhase();
  }
}

function renderMemorizePhase() {
  const root = document.getElementById("memory-order-root");
  root.innerHTML = `
    <div class="game-note">${t("memorize")}</div>
    <div class="memory-order-section-title">${t("currentSequence")}</div>
    <div class="memory-order-display-grid">
      ${currentRoundData.targetOrder.map((key, index) => renderImageOrderCard(key, index, "display")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="continue-memory-order-btn">${t("continue")}</button>
    </div>
  `;

  document.getElementById("continue-memory-order-btn").onclick = () => {
    currentRoundData.phase = "reorder";
    renderCurrentScreen();
  };
}

function attachDragHandlers() {
  const cards = document.querySelectorAll(".memory-order-play-card");

  cards.forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggedIndex = Number(card.dataset.index);
      card.classList.add("dragging");

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(draggedIndex));
      }
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedIndex = null;
      document.querySelectorAll(".memory-order-play-card").forEach((c) => c.classList.remove("drag-over"));
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("drag-over");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over");
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const targetIndex = Number(card.dataset.index);
      const fromIndex = draggedIndex ?? Number(e.dataTransfer?.getData("text/plain"));
      moveDraggedItem(fromIndex, targetIndex);
      renderReorderPhase();
    });
  });
}

function renderReorderPhase() {
  const root = document.getElementById("memory-order-root");
  root.innerHTML = `
    <div class="game-note">${t("reorder")}</div>
    <div class="memory-order-section-title">${t("yourSequence")}</div>
    <p class="memory-order-tip">${t("tip")}</p>
    <div class="memory-order-play-grid">
      ${currentRoundData.workingOrder.map((key, index) => renderImageOrderCard(key, index, "play")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="validate-memory-order-btn">${t("validate")}</button>
    </div>
    <div class="game-feedback" id="memory-order-feedback"></div>
  `;

  attachDragHandlers();

  document.getElementById("validate-memory-order-btn").onclick = validateRound;
}

function validateRound() {
  const target = currentRoundData.targetOrder;
  const working = currentRoundData.workingOrder;

  let correctPlacements = 0;
  for (let i = 0; i < target.length; i += 1) {
    if (target[i] === working[i]) {
      correctPlacements += 1;
    }
  }

  totalCorrectPlacements += correctPlacements;
  totalPlacements += target.length;
  currentScore += correctPlacements;

  const perfect = correctPlacements === target.length;

  const feedback = document.getElementById("memory-order-feedback");
  if (feedback) {
    feedback.textContent = perfect ? t("success") : `${t("fail")} (${correctPlacements}/${target.length})`;
    feedback.className = `game-feedback ${perfect ? "ok" : "bad"}`;
  }

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

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  totalCorrectPlacements = 0;
  totalPlacements = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-order"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_order",
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
        correctPlacements: totalCorrectPlacements,
        totalPlacements,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-order completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-order-root");
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
          correctPlacements: totalCorrectPlacements,
          totalPlacements,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-order abandoned"
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