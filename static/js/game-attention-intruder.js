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
    title: "إيجاد الصورة المختلفة",
    subtitle: "ابحث عن الصورة المختلفة بين الصور الأخرى.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة إيجاد المختلف",
    introText: "في كل مستوى ستظهر مجموعة صور. صورة واحدة فقط مختلفة. انقر على الصورة المختلفة للانتقال إلى المستوى التالي.",
    start: "إبدأ",
    target: "ابحث عن الصورة المختلفة",
    success: "إجابة صحيحة",
    fail: "هذه ليست الصورة المختلفة",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnAttention: "العودة إلى الانتباه",
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
    title: "Trouver l’intrus",
    subtitle: "Trouvez l’image différente parmi les autres.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de l’intrus",
    introText: "À chaque niveau, plusieurs images seront affichées. Une seule image est différente. Cliquez sur l’image différente pour passer au niveau suivant.",
    start: "Commencer",
    target: "Trouvez l’image différente",
    success: "Bonne réponse",
    fail: "Ce n’est pas l’intrus",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnAttention: "Retour attention",
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
    title: "Find the intruder",
    subtitle: "Find the different image among the others.",
    level: "Level",
    score: "Score",
    introTitle: "Intruder game",
    introText: "At each level, several images will appear. Only one image is different. Click the different image to move to the next level.",
    start: "Start",
    target: "Find the different image",
    success: "Correct answer",
    fail: "That is not the intruder",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnAttention: "Back to attention",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/."
  }
};

const IMAGE_LIBRARY = {
  apple: "/static/images/memory/apple.png",
  banana: "/static/images/memory/banana.png",
  orange: "/static/images/memory/orange.png",
  grape: "/static/images/memory/grape.png",
  lemon: "/static/images/memory/lemon.png",
  tree: "/static/images/memory/tree.png",
  flower: "/static/images/memory/flower.png",
  lion: "/static/images/memory/lion.png",
  house: "/static/images/memory/house.png",
  book: "/static/images/memory/book.png",
  car: "/static/images/memory/car.png",
  dog: "/static/images/memory/dog.png",
  cat: "/static/images/memory/cat.png"
};

const ROUNDS = [
  { total: 6, repeated: 5 },
  { total: 8, repeated: 7 },
  { total: 10, repeated: 9 },
  { total: 12, repeated: 11 },
  { total: 14, repeated: 13 },
  { total: 16, repeated: 15 }
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
let wrongClicks = 0;
let correctSelections = 0;

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
  const root = document.getElementById("attention-intruder-root");
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
  const root = document.getElementById("attention-intruder-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-attention-intruder-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-attention-intruder-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));

  const repeatedKey = shuffle(availableKeys)[0];
  const differentKey = shuffle(availableKeys.filter((key) => key !== repeatedKey))[0];

  const cards = shuffle([
    ...Array.from({ length: config.repeated }, () => ({
      key: repeatedKey,
      isIntruder: false,
      status: "idle"
    })),
    {
      key: differentKey,
      isIntruder: true,
      status: "idle"
    }
  ]);

  currentRoundData = {
    cards,
    intruderKey: differentKey,
    repeatedKey,
    locked: false
  };
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  renderIntruderBoard();
}

function renderIntruderBoard() {
  const root = document.getElementById("attention-intruder-root");
  const total = currentRoundData.cards.length;

  let sizeClass = "intruder-grid-6";
  if (total <= 6) sizeClass = "intruder-grid-6";
  else if (total <= 8) sizeClass = "intruder-grid-8";
  else if (total <= 10) sizeClass = "intruder-grid-10";
  else if (total <= 12) sizeClass = "intruder-grid-12";
  else if (total <= 14) sizeClass = "intruder-grid-14";
  else sizeClass = "intruder-grid-16";

  root.innerHTML = `
    <div class="game-note">${t("target")}</div>
    <div class="attention-intruder-grid ${sizeClass}">
      ${currentRoundData.cards.map((card, index) => `
        <button
          class="memory-choice-card attention-intruder-card ${card.status !== "idle" ? card.status : ""}"
          data-index="${index}"
          ${currentRoundData.locked ? "disabled" : ""}
        >
          <div class="memory-card-media">
            <img
              src="${IMAGE_LIBRARY[card.key]}"
              alt=""
              class="memory-real-img"
              loading="eager"
              draggable="false"
            >
          </div>
        </button>
      `).join("")}
    </div>
    <div class="game-feedback" id="attention-intruder-feedback"></div>
  `;

  document.querySelectorAll(".attention-intruder-card").forEach((cardEl) => {
    cardEl.onclick = () => {
      const index = Number(cardEl.dataset.index);
      selectCard(index);
    };
  });
}

function selectCard(index) {
  if (!currentRoundData || currentRoundData.locked) return;

  const card = currentRoundData.cards[index];
  currentRoundData.locked = true;

  if (card.isIntruder) {
    card.status = "ok";
    currentScore += 1;
    correctSelections += 1;
    renderIntruderBoard();

    const feedback = document.getElementById("attention-intruder-feedback");
    if (feedback) {
      feedback.textContent = t("success");
      feedback.className = "game-feedback ok";
    }

    setTimeout(() => {
      currentRoundIndex += 1;
      if (currentRoundIndex < ROUNDS.length) {
        generateRoundData();
        renderCurrentScreen();
      } else {
        finishGame();
      }
    }, 900);
  } else {
    card.status = "bad";
    wrongClicks += 1;
    const intruderCard = currentRoundData.cards.find((c) => c.isIntruder);
    if (intruderCard) intruderCard.status = "ok";

    renderIntruderBoard();

    const feedback = document.getElementById("attention-intruder-feedback");
    if (feedback) {
      feedback.textContent = t("fail");
      feedback.className = "game-feedback bad";
    }

    setTimeout(() => {
      currentRoundIndex += 1;
      if (currentRoundIndex < ROUNDS.length) {
        generateRoundData();
        renderCurrentScreen();
      } else {
        finishGame();
      }
    }, 1100);
  }
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  wrongClicks = 0;
  correctSelections = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.length;

  const session = await createSession(currentUser.uid, {
    source: "attention-intruder"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "attention_intruder",
    category: "attention",
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

  const maxScore = ROUNDS.length;
  const accuracyPercent = Math.round((currentScore / maxScore) * 100);

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        correctSelections,
        wrongClicks,
        accuracyPercent,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "attention-intruder completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("attention-intruder-root");
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
          correctSelections,
          wrongClicks,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "attention-intruder abandoned"
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