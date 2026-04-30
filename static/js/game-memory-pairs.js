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
    title: "إيجاد الأزواج",
    subtitle: "اقلب البطاقات وابحث عن الأزواج المتطابقة.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة إيجاد الأزواج",
    introText: "اقلب بطاقتين في كل مرة. إذا كانتا متطابقتين فسيبقيان مفتوحتين. أكمل كل الأزواج للانتقال إلى المستوى التالي.",
    start: "إبدأ",
    pairsToFind: "ابحث عن كل الأزواج",
    success: "تم العثور على زوج صحيح",
    fail: "ليستا زوجًا متطابقًا",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/memory/.",
    imageLabelFallback: "صورة",
    attempts: "المحاولات",
    foundPairs: "الأزواج المكتشفة",
    wait: "انتظر..."
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Trouver les paires",
    subtitle: "Retournez les cartes et retrouvez les paires identiques.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu des paires",
    introText: "Retournez deux cartes à la fois. Si elles sont identiques, elles restent visibles. Trouvez toutes les paires pour passer au niveau suivant.",
    start: "Commencer",
    pairsToFind: "Trouvez toutes les paires",
    success: "Bonne paire trouvée",
    fail: "Ce n’est pas une paire",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/memory/.",
    imageLabelFallback: "Image",
    attempts: "Essais",
    foundPairs: "Paires trouvées",
    wait: "Patientez..."
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Find the pairs",
    subtitle: "Flip the cards and find the matching pairs.",
    level: "Level",
    score: "Score",
    introTitle: "Pairs memory game",
    introText: "Flip two cards at a time. If they match, they stay visible. Find all pairs to move to the next level.",
    start: "Start",
    pairsToFind: "Find all pairs",
    success: "Correct pair found",
    fail: "Not a matching pair",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/.",
    imageLabelFallback: "Image",
    attempts: "Attempts",
    foundPairs: "Pairs found",
    wait: "Please wait..."
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
  { pairs: 3 },
  { pairs: 4 },
  { pairs: 5 }
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
let totalAttempts = 0;
let totalMistakes = 0;
let totalPairsFound = 0;
let isChecking = false;

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
  const root = document.getElementById("memory-pairs-root");
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
  const root = document.getElementById("memory-pairs-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="7" height="7" rx="1"/>
          <rect x="14" y="4" width="7" height="7" rx="1"/>
          <rect x="3" y="13" width="7" height="7" rx="1"/>
          <rect x="14" y="13" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-pairs-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-pairs-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));
  const selectedKeys = shuffle(availableKeys).slice(0, config.pairs);

  const cards = shuffle(
    selectedKeys.flatMap((key, pairIndex) => [
      {
        uid: `${key}-a-${pairIndex}`,
        key,
        pairId: `${key}-${pairIndex}`,
        isMatched: false,
        isFlipped: false
      },
      {
        uid: `${key}-b-${pairIndex}`,
        key,
        pairId: `${key}-${pairIndex}`,
        isMatched: false,
        isFlipped: false
      }
    ])
  );

  currentRoundData = {
    cards,
    openIndexes: [],
    foundPairs: 0,
    attempts: 0,
    pairs: config.pairs
  };

  isChecking = false;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  renderPairsBoard();
}

function renderPairsBoard() {
  const root = document.getElementById("memory-pairs-root");

  root.innerHTML = `
    <div class="game-note">${t("pairsToFind")}</div>

    <div class="memory-pairs-stats">
      <div class="game-pill">${t("foundPairs")} : ${currentRoundData.foundPairs} / ${currentRoundData.pairs}</div>
      <div class="game-pill game-pill-score">${t("attempts")} : ${currentRoundData.attempts}</div>
    </div>

    <div class="memory-pairs-grid pairs-${currentRoundData.pairs}">
      ${currentRoundData.cards.map((card, index) => {
        const cardClasses = [
          "memory-pair-card",
          card.isFlipped || card.isMatched ? "flipped" : "",
          card.isMatched ? "matched" : ""
        ].join(" ").trim();

        return `
          <button class="${cardClasses}" data-index="${index}" ${isChecking || card.isMatched ? "disabled" : ""}>
            <div class="memory-pair-card-inner">
              <div class="memory-pair-front">
                <div class="ib md">
                  <svg viewBox="0 0 24 24">
                    <path d="M9.5 2a2.5 2.5 0 0 1 4.9.44C16.1 3 17.5 4.4 17.5 6c0 .34-.04.67-.11 1H18a3 3 0 0 1 3 3c0 1.1-.6 2.1-1.5 2.6A3 3 0 0 1 18 18h-.5a2.5 2.5 0 0 1-4.9.44A2.5 2.5 0 0 1 9.5 16H9a3 3 0 0 1-1.5-5.6A3 3 0 0 1 9 4h.11A2.5 2.5 0 0 1 9.5 2z"/>
                  </svg>
                </div>
              </div>
              <div class="memory-pair-back">
                <div class="memory-card-media">
                   <img src="${IMAGE_LIBRARY[card.key].src}" alt="${getImageLabel(card.key)}" class="memory-real-img" loading="eager" draggable="false">
                </div>
              </div>
            </div>
          </button>
        `;
      }).join("")}
    </div>

    <div class="game-feedback" id="memory-pairs-feedback"></div>
  `;

  document.querySelectorAll(".memory-pair-card").forEach((cardEl) => {
    cardEl.onclick = () => {
      const index = Number(cardEl.dataset.index);
      flipCard(index);
    };
  });
}

function flipCard(index) {
  if (!currentRoundData || isChecking) return;

  const card = currentRoundData.cards[index];
  if (!card || card.isMatched || card.isFlipped) return;
  if (currentRoundData.openIndexes.length >= 2) return;

  card.isFlipped = true;
  currentRoundData.openIndexes.push(index);
  renderPairsBoard();

  if (currentRoundData.openIndexes.length === 2) {
    checkPair();
  }
}

function checkPair() {
  isChecking = true;
  currentRoundData.attempts += 1;
  totalAttempts += 1;

  const [firstIndex, secondIndex] = currentRoundData.openIndexes;
  const firstCard = currentRoundData.cards[firstIndex];
  const secondCard = currentRoundData.cards[secondIndex];

  if (firstCard.pairId === secondCard.pairId) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    currentRoundData.foundPairs += 1;
    totalPairsFound += 1;
    currentScore += 1;

    currentRoundData.openIndexes = [];
    isChecking = false;

    renderPairsBoard();

    const fb = document.getElementById("memory-pairs-feedback");
    if (fb) {
      fb.textContent = t("success");
      fb.className = "game-feedback ok";
    }

    if (currentRoundData.foundPairs === currentRoundData.pairs) {
      setTimeout(() => {
        currentRoundIndex += 1;

        if (currentRoundIndex < ROUNDS.length) {
          generateRoundData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      }, 900);
    }

  } else {
    totalMistakes += 1;

    renderPairsBoard();

    const fb = document.getElementById("memory-pairs-feedback");
    if (fb) {
      fb.textContent = t("fail");
      fb.className = "game-feedback bad";
    }

    setTimeout(() => {
      firstCard.isFlipped = false;
      secondCard.isFlipped = false;
      currentRoundData.openIndexes = [];
      isChecking = false;
      renderPairsBoard();
    }, 900);
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
  totalAttempts = 0;
  totalMistakes = 0;
  totalPairsFound = 0;
  gameEnded = false;
  isChecking = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.pairs, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-pairs"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_pairs",
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

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.pairs, 0);
  const accuracyPercent = totalAttempts > 0
    ? Math.round((totalPairsFound / totalAttempts) * 100)
    : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        accuracyPercent,
        pairsFound: totalPairsFound,
        attempts: totalAttempts,
        mistakes: totalMistakes,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-pairs completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-pairs-root");
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
          pairsFound: totalPairsFound,
          attempts: totalAttempts,
          mistakes: totalMistakes,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-pairs abandoned"
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