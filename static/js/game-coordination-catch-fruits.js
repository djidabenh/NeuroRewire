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
    title: "التقاط الفواكه",
    subtitle: "التقط الفواكه الساقطة باستخدام السلة.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة التقاط الفواكه",
    introText: "حرّك السلة بالفأرة على الكمبيوتر أو بإصبعك على الهاتف واللوحة لالتقاط الفواكه قبل أن تسقط.",
    start: "إبدأ",
    caught: "المُلتقَط",
    missed: "المفقود",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnCoordination: "العودة إلى التنسيق",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/memory/."
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Attraper les fruits",
    subtitle: "Attrapez les fruits qui tombent avec le panier.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu des fruits",
    introText: "Déplacez le panier avec la souris sur PC ou avec le doigt sur téléphone/tablette pour attraper les fruits avant qu’ils ne tombent.",
    start: "Commencer",
    caught: "Attrapés",
    missed: "Ratés",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnCoordination: "Retour coordination",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/memory/."
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Catch the fruits",
    subtitle: "Catch the falling fruits with the basket.",
    level: "Level",
    score: "Score",
    introTitle: "Fruit catching game",
    introText: "Move the basket with the mouse on desktop or with your finger on phone/tablet to catch the fruits before they fall.",
    start: "Start",
    caught: "Caught",
    missed: "Missed",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnCoordination: "Back to coordination",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/."
  }
};

const FRUIT_LIBRARY = {
  apple: "/static/images/memory/apple.png",
  banana: "/static/images/memory/banana.png",
  orange: "/static/images/memory/orange.png",
  grape: "/static/images/memory/grape.png",
  lemon: "/static/images/memory/lemon.png"
};

const LEVELS = [
  { fruitsToSpawn: 8, speed: 1.4, spawnEvery: 1200 },
  { fruitsToSpawn: 10, speed: 1.7, spawnEvery: 1100 },
  { fruitsToSpawn: 12, speed: 2.0, spawnEvery: 1000 },
  { fruitsToSpawn: 14, speed: 2.3, spawnEvery: 900 },
  { fruitsToSpawn: 16, speed: 2.6, spawnEvery: 820 },
  { fruitsToSpawn: 18, speed: 3.0, spawnEvery: 740 }
];

const FRUIT_KEYS = Object.keys(FRUIT_LIBRARY);

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;
let loadedAssets = new Set();
let missingAssets = [];

let currentLevelData = null;
let gameLoopId = null;
let spawnTimerId = null;
let lastTimestamp = 0;
let basketX = 50;
let pressedKeys = new Set();
let fruitCounter = 0;

let totalFruitsShown = 0;
let totalFruitsCaught = 0;
let totalFruitsMissed = 0;

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
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
  document.getElementById("game-round-label").textContent = `${t("level")} ${Math.min(currentLevelIndex + 1, LEVELS.length)} / ${LEVELS.length}`;
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
  const root = document.getElementById("coordination-catch-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("imageLoadError")}</h3>
      <p>${t("assetsMissing")}</p>
      <div class="memory-missing-list">
        ${missingAssets.map((key) => `<span class="memory-missing-chip">${key}</span>`).join("")}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/coordination'">${t("returnCoordination")}</button>
      </div>
    </div>
  `;
}

function renderIntro() {
  const root = document.getElementById("coordination-catch-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M6 8h12l-1 9H7L6 8z"/>
          <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-coordination-catch-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-coordination-catch-btn").onclick = startGame;
}

function stopGameLoop() {
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  if (spawnTimerId) clearInterval(spawnTimerId);
  gameLoopId = null;
  spawnTimerId = null;
}

function setupLevelData() {
  const level = LEVELS[currentLevelIndex];
  basketX = 50;
  fruitCounter = 0;

  currentLevelData = {
    fruits: [],
    fruitsSpawned: 0,
    fruitsToSpawn: level.fruitsToSpawn,
    speed: level.speed,
    spawnEvery: level.spawnEvery,
    caught: 0,
    missed: 0,
    isFinished: false
  };
}

function spawnFruit() {
  if (!currentLevelData || currentLevelData.fruitsSpawned >= currentLevelData.fruitsToSpawn) return;

  const key = shuffle(FRUIT_KEYS.filter((k) => loadedAssets.has(k)))[0];
  const x = 8 + Math.random() * 84;

  currentLevelData.fruits.push({
    id: `fruit-${currentLevelIndex}-${fruitCounter++}`,
    key,
    x,
    y: -10
  });

  currentLevelData.fruitsSpawned += 1;
  totalFruitsShown += 1;
}

function setBasketFromClientX(clientX) {
  const stage = document.getElementById("catch-game-stage");
  if (!stage) return;

  const rect = stage.getBoundingClientRect();
  if (rect.width <= 0) return;

  const xPercent = ((clientX - rect.left) / rect.width) * 100;
  basketX = Math.max(10, Math.min(90, xPercent));
  renderBasketOnly();
}

function bindStagePointerControls() {
  const stage = document.getElementById("catch-game-stage");
  if (!stage) return;

  const onMouseMove = (e) => {
    setBasketFromClientX(e.clientX);
  };

  const onTouchMove = (e) => {
    if (!e.touches || !e.touches.length) return;
    e.preventDefault();
    setBasketFromClientX(e.touches[0].clientX);
  };

  stage.addEventListener("mousemove", onMouseMove, { passive: true });
  stage.addEventListener("touchstart", onTouchMove, { passive: false });
  stage.addEventListener("touchmove", onTouchMove, { passive: false });
}

function renderBasketOnly() {
  const basket = document.getElementById("catch-basket");
  if (basket) {
    basket.style.left = `${basketX}%`;
  }
}

function updateGame(delta) {
  if (!currentLevelData || currentLevelData.isFinished) return;

  if (pressedKeys.has("ArrowLeft")) {
    basketX = Math.max(10, basketX - 0.25 * delta);
  }
  if (pressedKeys.has("ArrowRight")) {
    basketX = Math.min(90, basketX + 0.25 * delta);
  }

  const basketLeft = basketX - 9;
  const basketRight = basketX + 9;
  const basketTop = 86;

  currentLevelData.fruits = currentLevelData.fruits.filter((fruit) => {
    fruit.y += currentLevelData.speed * (delta / 16);

    const fruitCenter = fruit.x;
    const fruitBottom = fruit.y + 8;

    const caught =
      fruitBottom >= basketTop &&
      fruitBottom <= 96 &&
      fruitCenter >= basketLeft &&
      fruitCenter <= basketRight;

    if (caught) {
      currentScore += 1;
      currentLevelData.caught += 1;
      totalFruitsCaught += 1;
      return false;
    }

    if (fruit.y > 100) {
      currentLevelData.missed += 1;
      totalFruitsMissed += 1;
      return false;
    }

    return true;
  });

  const allSpawned = currentLevelData.fruitsSpawned >= currentLevelData.fruitsToSpawn;
  const noMoreFruits = currentLevelData.fruits.length === 0;

  if (allSpawned && noMoreFruits) {
    currentLevelData.isFinished = true;
    stopGameLoop();

    setTimeout(() => {
      currentLevelIndex += 1;

      if (currentLevelIndex < LEVELS.length) {
        setupLevelData();
        startLevelLoop();
      } else {
        finishGame();
      }
    }, 700);
  }

  renderGameBoard();
}

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  updateGame(delta);
  gameLoopId = requestAnimationFrame(gameLoop);
}

function startLevelLoop() {
  stopGameLoop();
  lastTimestamp = 0;
  renderGameBoard();
  spawnFruit();
  spawnTimerId = setInterval(spawnFruit, currentLevelData.spawnEvery);
  gameLoopId = requestAnimationFrame(gameLoop);
}

function renderGameBoard() {
  updateStaticTexts();

  const root = document.getElementById("coordination-catch-root");
  if (!currentLevelData) return;

  root.innerHTML = `
    <div class="memory-pairs-stats">
      <div class="game-pill">${t("caught")} : ${currentLevelData.caught} / ${currentLevelData.fruitsToSpawn}</div>
      <div class="game-pill game-pill-score">${t("missed")} : ${currentLevelData.missed}</div>
    </div>

    <div class="catch-game-shell">
      <div class="catch-game-stage" id="catch-game-stage">
        <div class="catch-sky"></div>
        <div class="catch-ground"></div>

        ${currentLevelData.fruits.map((fruit) => `
          <div class="catch-fruit" style="left:${fruit.x}%; top:${fruit.y}%;">
            <img src="${FRUIT_LIBRARY[fruit.key]}" alt="" class="catch-fruit-img" draggable="false">
          </div>
        `).join("")}

        <div class="catch-basket" id="catch-basket" style="left:${basketX}%;">
          <div class="catch-basket-inner">
            <svg viewBox="0 0 120 80" preserveAspectRatio="none">
              <path d="M18 18H102L92 70H28L18 18Z" fill="#B9824D"/>
              <path d="M28 30H92" stroke="#8A5A30" stroke-width="4"/>
              <path d="M35 42H85" stroke="#8A5A30" stroke-width="4"/>
              <path d="M42 54H78" stroke="#8A5A30" stroke-width="4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `;

  bindStagePointerControls();
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentLevelData && !gameEnded) {
    renderIntro();
    return;
  }

  if (currentLevelData) {
    renderGameBoard();
  }
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentLevelIndex = 0;
  currentScore = 0;
  totalFruitsShown = 0;
  totalFruitsCaught = 0;
  totalFruitsMissed = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = LEVELS.reduce((sum, level) => sum + level.fruitsToSpawn, 0);

  const session = await createSession(currentUser.uid, {
    source: "coordination-catch-fruits"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "coordination_catch_fruits",
    category: "coordination",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      assetMode: "local-fruits",
      imagePoolSize: FRUIT_KEYS.length
    }
  });
  currentResultId = exercise.resultId;

  setupLevelData();
  startLevelLoop();
}

async function finishGame() {
  gameEnded = true;
  currentLevelData = null;
  stopGameLoop();

  const maxScore = LEVELS.reduce((sum, level) => sum + level.fruitsToSpawn, 0);
  const accuracyPercent = maxScore > 0 ? Math.round((totalFruitsCaught / maxScore) * 100) : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: LEVELS.length,
        fruitsShown: totalFruitsShown,
        fruitsCaught: totalFruitsCaught,
        fruitsMissed: totalFruitsMissed,
        accuracyPercent,
        assetMode: "local-fruits",
        imagePoolSize: FRUIT_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "coordination-catch-fruits completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("coordination-catch-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/coordination'">${t("returnCoordination")}</button>
      </div>
    </div>
  `;
}

window.leaveGame = async function leaveGame() {
  stopGameLoop();

  try {
    if (currentUser && currentResultId && !gameEnded) {
      await abandonExercise(currentUser.uid, currentResultId, {
        metadata: {
          leftEarly: true,
          round: currentLevelIndex + 1,
          fruitsShown: totalFruitsShown,
          fruitsCaught: totalFruitsCaught,
          fruitsMissed: totalFruitsMissed,
          assetMode: "local-fruits"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "coordination-catch-fruits abandoned"
      });
    }
  } catch (error) {
    console.error("Leave game error:", error);
  }

  window.location.href = "/exercises/coordination";
};

window.logout = function logout() {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    pressedKeys.add(e.key);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    pressedKeys.delete(e.key);
  }
});

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