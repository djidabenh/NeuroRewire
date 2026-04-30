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
    title: "النقر على الهدف",
    subtitle: "انقر فقط على الفاكهة المطلوبة.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة النقر على الهدف",
    introText: "في كل مستوى سيتم عرض عدة صور. انقر فقط على جميع الصور المطابقة للفاكهة المطلوبة وتجنب الصور الأخرى.",
    start: "إبدأ",
    target: "انقر على كل",
    hits: "الإصابات",
    misses: "الأخطاء",
    success: "ممتاز",
    fail: "خطأ",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnAttention: "العودة إلى الانتباه",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/memory/.",
    finishRound: "إنهاء المستوى"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Cliquer la cible",
    subtitle: "Cliquez uniquement sur le fruit demandé.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de la cible",
    introText: "À chaque niveau, plusieurs images seront affichées. Cliquez uniquement sur toutes les images du fruit demandé et évitez les autres.",
    start: "Commencer",
    target: "Cliquez sur tous les",
    hits: "Touches",
    misses: "Erreurs",
    success: "Bravo",
    fail: "Erreur",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnAttention: "Retour attention",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/memory/.",
    finishRound: "Terminer le niveau"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Click the target",
    subtitle: "Click only on the requested fruit.",
    level: "Level",
    score: "Score",
    introTitle: "Target click game",
    introText: "At each level, several images will appear. Click only all images matching the requested fruit and avoid the others.",
    start: "Start",
    target: "Click all",
    hits: "Hits",
    misses: "Mistakes",
    success: "Great",
    fail: "Wrong",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnAttention: "Back to attention",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/.",
    finishRound: "Finish level"
  }
};

const FRUIT_LIBRARY = {
  apple: "/static/images/memory/apple.png",
  banana: "/static/images/memory/banana.png",
  orange: "/static/images/memory/orange.png",
  grape: "/static/images/memory/grape.png",
  lemon: "/static/images/memory/lemon.png"
};

const FRUIT_LABELS = {
  apple: { ar: "تفاح", fr: "pommes", en: "apples" },
  banana: { ar: "موز", fr: "bananes", en: "bananas" },
  orange: { ar: "برتقال", fr: "oranges", en: "oranges" },
  grape: { ar: "عنب", fr: "raisins", en: "grapes" },
  lemon: { ar: "ليمون", fr: "citrons", en: "lemons" }
};

const ROUNDS = [
  { total: 6, targets: 2 },
  { total: 8, targets: 2 },
  { total: 10, targets: 3 },
  { total: 12, targets: 3 },
  { total: 14, targets: 4 },
  { total: 16, targets: 4 }
];

const FRUIT_KEYS = Object.keys(FRUIT_LIBRARY);

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
let totalTargetsShown = 0;
let totalTargetsHit = 0;
let totalWrongClicks = 0;

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
}

function getTargetLabel(key) {
  return FRUIT_LABELS[key]?.[currentLang] || FRUIT_LABELS[key]?.fr || key;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderTargetPrompt() {
  return `
    <div class="attention-target-prompt">
      <div class="attention-target-prompt-text">
        ${t("target")} ${getTargetLabel(currentRoundData.targetKey)}
      </div>
      <div class="attention-target-prompt-card">
        <img
          src="${FRUIT_LIBRARY[currentRoundData.targetKey]}"
          alt=""
          class="attention-target-prompt-img"
          loading="eager"
          draggable="false"
        >
      </div>
    </div>
  `;
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
  const entries = Object.entries(FRUIT_LIBRARY);

  const results = await Promise.all(
    entries.map(([key, src]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ key, ok: true });
        img.onerror = () => resolve({ key, ok: false });
        img.src = src;
      });
    })
  );

  loadedAssets = new Set(results.filter((r) => r.ok).map((r) => r.key));
  missingAssets = results.filter((r) => !r.ok).map((r) => r.key);
}

function renderMissingAssetsMessage() {
  const root = document.getElementById("attention-click-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("imageLoadError")}</h3>
      <p>${t("assetsMissing")}</p>
      <div class="memory-missing-list">
        ${missingAssets.map((key) => `<span class="memory-missing-chip">${key}</span>`).join("")}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/attention'">${t("returnAttention")}</button>
      </div>
    </div>
  `;
}

function renderIntro() {
  const root = document.getElementById("attention-click-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-attention-click-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-attention-click-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = FRUIT_KEYS.filter((key) => loadedAssets.has(key));

  const targetKey = shuffle(availableKeys)[0];
  const otherKeys = availableKeys.filter((key) => key !== targetKey);

  const cards = [
    ...Array.from({ length: config.targets }, () => ({
      key: targetKey,
      isTarget: true,
      status: "idle"
    })),
    ...Array.from({ length: config.total - config.targets }, () => ({
      key: shuffle(otherKeys)[0],
      isTarget: false,
      status: "idle"
    }))
  ];

  currentRoundData = {
    targetKey,
    cards: shuffle(cards),
    locked: false,
    hits: 0,
    misses: 0,
    targetsTotal: config.targets
  };

  totalTargetsShown += config.targets;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  renderTargetBoard();
}

function renderTargetBoard() {
  const root = document.getElementById("attention-click-root");
  const total = currentRoundData.cards.length;

  let sizeClass = "intruder-grid-6";
  if (total <= 6) sizeClass = "intruder-grid-6";
  else if (total <= 8) sizeClass = "intruder-grid-8";
  else if (total <= 10) sizeClass = "intruder-grid-10";
  else if (total <= 12) sizeClass = "intruder-grid-12";
  else if (total <= 14) sizeClass = "intruder-grid-14";
  else sizeClass = "intruder-grid-16";

  root.innerHTML = `
    ${renderTargetPrompt()}

    <div class="memory-pairs-stats">
      <div class="game-pill">${t("hits")} : ${currentRoundData.hits} / ${currentRoundData.targetsTotal}</div>
      <div class="game-pill game-pill-score">${t("misses")} : ${currentRoundData.misses}</div>
    </div>

    <div class="attention-intruder-grid ${sizeClass}">
      ${currentRoundData.cards.map((card, index) => `
        <button
          class="memory-choice-card attention-intruder-card ${card.status !== "idle" ? card.status : ""}"
          data-index="${index}"
          ${currentRoundData.locked ? "disabled" : ""}
        >
          <div class="memory-card-media">
            <img
              src="${FRUIT_LIBRARY[card.key]}"
              alt=""
              class="memory-real-img"
              loading="eager"
              draggable="false"
            >
          </div>
        </button>
      `).join("")}
    </div>

    <div class="game-actions">
      <button class="go-btn" id="finish-attention-click-round">${t("finishRound")}</button>
    </div>

    <div class="game-feedback" id="attention-click-feedback"></div>
  `;

  document.querySelectorAll(".attention-intruder-card").forEach((cardEl) => {
    cardEl.onclick = () => {
      const index = Number(cardEl.dataset.index);
      clickCard(index);
    };
  });

  document.getElementById("finish-attention-click-round").onclick = finishRound;
}

function clickCard(index) {
  if (!currentRoundData || currentRoundData.locked) return;

  const card = currentRoundData.cards[index];
  if (card.status === "ok" || card.status === "bad") return;

  if (card.isTarget) {
    card.status = "ok";
    currentRoundData.hits += 1;
    currentScore += 1;
    totalTargetsHit += 1;

    renderTargetBoard();
    const fb = document.getElementById("attention-click-feedback");
    if (fb) {
      fb.textContent = t("success");
      fb.className = "game-feedback ok";
    }
  } else {
    card.status = "bad";
    currentRoundData.misses += 1;
    totalWrongClicks += 1;

    renderTargetBoard();
    const fb = document.getElementById("attention-click-feedback");
    if (fb) {
      fb.textContent = t("fail");
      fb.className = "game-feedback bad";
    }
  }
}

function finishRound() {
  currentRoundData.locked = true;
  renderTargetBoard();

  setTimeout(() => {
    currentRoundIndex += 1;
    if (currentRoundIndex < ROUNDS.length) {
      generateRoundData();
      renderCurrentScreen();
    } else {
      finishGame();
    }
  }, 500);
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  totalTargetsShown = 0;
  totalTargetsHit = 0;
  totalWrongClicks = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.targets, 0);

  const session = await createSession(currentUser.uid, {
    source: "attention-click-target"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "attention_click_target",
    category: "attention",
    maxScore,
    metadata: {
      rounds: ROUNDS.length,
      assetMode: "local-images",
      imagePoolSize: FRUIT_KEYS.length
    }
  });
  currentResultId = exercise.resultId;

  generateRoundData();
  renderCurrentScreen();
}

async function finishGame() {
  gameEnded = true;

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.targets, 0);
  const accuracyPercent = maxScore > 0
    ? Math.round((totalTargetsHit / maxScore) * 100)
    : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        targetsShown: totalTargetsShown,
        targetsHit: totalTargetsHit,
        wrongClicks: totalWrongClicks,
        accuracyPercent,
        assetMode: "local-images",
        imagePoolSize: FRUIT_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "attention-click-target completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("attention-click-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/attention'">${t("returnAttention")}</button>
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
          targetsShown: totalTargetsShown,
          targetsHit: totalTargetsHit,
          wrongClicks: totalWrongClicks,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "attention-click-target abandoned"
      });
    }
  } catch (error) {
    console.error("Leave game error:", error);
  }

  window.location.href = "/exercises/attention";
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