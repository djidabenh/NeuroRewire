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
    title: "لمس الهدف",
    subtitle: "المس فقط الأهداف ذات اللون المطلوب.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة الأهداف الملونة",
    introText: "في كل مستوى سيُطلب منك لون معيّن. المس فقط الأهداف التي تحمل هذا اللون وتجنب باقي الألوان.",
    start: "إبدأ",
    touchOnly: "المس فقط",
    correctHits: "الإصابات الصحيحة",
    wrongHits: "الأخطاء",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnCoordination: "العودة إلى التنسيق",
    red: "الأحمر",
    blue: "الأزرق",
    green: "الأخضر",
    yellow: "الأصفر",
    purple: "البنفسجي",
    success: "إصابة صحيحة",
    fail: "لون خاطئ"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Toucher la cible",
    subtitle: "Touchez uniquement les cibles de la couleur demandée.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu des cibles colorées",
    introText: "À chaque niveau, une couleur cible est demandée. Touchez uniquement les cibles de cette couleur et évitez les autres.",
    start: "Commencer",
    touchOnly: "Touchez uniquement",
    correctHits: "Touches correctes",
    wrongHits: "Erreurs",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnCoordination: "Retour coordination",
    red: "rouge",
    blue: "bleu",
    green: "vert",
    yellow: "jaune",
    purple: "violet",
    success: "Bonne cible",
    fail: "Mauvaise couleur"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Tap the target",
    subtitle: "Tap only the targets of the requested color.",
    level: "Level",
    score: "Score",
    introTitle: "Color target game",
    introText: "At each level, a target color is requested. Tap only the targets with that color and avoid the others.",
    start: "Start",
    touchOnly: "Tap only",
    correctHits: "Correct hits",
    wrongHits: "Wrong hits",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnCoordination: "Back to coordination",
    red: "red",
    blue: "blue",
    green: "green",
    yellow: "yellow",
    purple: "purple",
    success: "Correct target",
    fail: "Wrong color"
  }
};

const COLOR_TOKENS = {
  red: { key: "red", className: "target-red" },
  blue: { key: "blue", className: "target-blue" },
  green: { key: "green", className: "target-green" },
  yellow: { key: "yellow", className: "target-yellow" },
  purple: { key: "purple", className: "target-purple" }
};

const LEVELS = [
  { totalTargets: 8, targetCount: 3, colors: ["red", "blue", "green"] },
  { totalTargets: 10, targetCount: 3, colors: ["red", "blue", "green", "yellow"] },
  { totalTargets: 12, targetCount: 4, colors: ["red", "blue", "green", "yellow"] },
  { totalTargets: 14, targetCount: 4, colors: ["red", "blue", "green", "yellow", "purple"] },
  { totalTargets: 16, targetCount: 5, colors: ["red", "blue", "green", "yellow", "purple"] },
  { totalTargets: 18, targetCount: 5, colors: ["red", "blue", "green", "yellow", "purple"] }
];

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;

let currentLevelData = null;
let totalTargetsShown = 0;
let totalCorrectHits = 0;
let totalWrongHits = 0;

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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

function renderIntro() {
  const root = document.getElementById("coordination-tap-root");
  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-coordination-tap-btn">${t("start")}</button>
    </div>
  `;
  document.getElementById("start-coordination-tap-btn").onclick = startGame;
}

function generateTargetPositions(count) {
  const presets = [
    { x: 15, y: 18 },
    { x: 38, y: 16 },
    { x: 62, y: 17 },
    { x: 85, y: 18 },
    { x: 22, y: 40 },
    { x: 50, y: 38 },
    { x: 78, y: 40 },
    { x: 15, y: 66 },
    { x: 38, y: 64 },
    { x: 62, y: 65 },
    { x: 85, y: 66 },
    { x: 28, y: 84 },
    { x: 50, y: 84 },
    { x: 72, y: 84 },
    { x: 10, y: 52 },
    { x: 90, y: 52 },
    { x: 8, y: 30 },
    { x: 92, y: 30 }
  ];
  return presets.slice(0, count);
}

function setupLevelData() {
  const level = LEVELS[currentLevelIndex];
  const targetColor = pickRandom(level.colors);
  const otherColors = level.colors.filter((c) => c !== targetColor);
  const positions = generateTargetPositions(level.totalTargets);

  const targets = [];

  for (let i = 0; i < level.targetCount; i += 1) {
    targets.push({
      id: `target-${i}`,
      color: targetColor,
      isTarget: true,
      hit: false
    });
  }

  for (let i = level.targetCount; i < level.totalTargets; i += 1) {
    targets.push({
      id: `target-${i}`,
      color: pickRandom(otherColors),
      isTarget: false,
      hit: false
    });
  }

  currentLevelData = {
    targetColor,
    targetCount: level.targetCount,
    positions,
    targets: shuffle(targets),
    correctHits: 0,
    wrongHits: 0,
    locked: false
  };

  totalTargetsShown += level.targetCount;
}

function renderPrompt() {
  const colorKey = currentLevelData.targetColor;
  return `
    <div class="coord-color-prompt">
      <div class="coord-color-prompt-chip ${COLOR_TOKENS[colorKey].className}">
        <span class="coord-color-prompt-dot"></span>
        <span class="coord-color-prompt-pulse"></span>
        <span class="coord-color-prompt-pulse p2"></span>
      </div>
      <div class="coord-color-prompt-text">
        ${t("touchOnly")} <strong>${t(colorKey)}</strong>
      </div>
    </div>
  `;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentLevelData && !gameEnded) {
    renderIntro();
    return;
  }

  renderBoard();
}

function renderBoard() {
  updateStaticTexts();

  const root = document.getElementById("coordination-tap-root");

  root.innerHTML = `
    ${renderPrompt()}

    <div class="memory-pairs-stats">
      <div class="game-pill">${t("correctHits")} : ${currentLevelData.correctHits} / ${currentLevelData.targetCount}</div>
      <div class="game-pill game-pill-score">${t("wrongHits")} : ${currentLevelData.wrongHits}</div>
    </div>

    <div class="coord-color-shell">
      <div class="coord-color-board">
        <div class="coord-color-board-glow"></div>
        <div class="coord-color-board-grid"></div>
        <div class="coord-color-board-orb orb-a"></div>
        <div class="coord-color-board-orb orb-b"></div>
        <div class="coord-color-board-orb orb-c"></div>
        <div class="coord-color-particles" id="coord-color-particles"></div>

        ${currentLevelData.targets.map((target, index) => `
          <button
            class="coord-color-target ${COLOR_TOKENS[target.color].className} ${target.hit ? "hit" : ""}"
            style="left:${currentLevelData.positions[index].x}%; top:${currentLevelData.positions[index].y}%"
            data-index="${index}"
            ${currentLevelData.locked || target.hit ? "disabled" : ""}
          >
            <span class="coord-color-target-core"></span>
            <span class="coord-color-target-ring"></span>
            <span class="coord-color-target-ring ring2"></span>
          </button>
        `).join("")}
      </div>

      <div class="coord-color-progress">
        ${Array.from({ length: currentLevelData.targetCount }).map((_, i) => `
          <span class="coord-color-progress-dot ${i < currentLevelData.correctHits ? "filled" : ""}"></span>
        `).join("")}
      </div>

      <div class="game-feedback" id="coord-color-feedback"></div>
    </div>
  `;

  document.querySelectorAll(".coord-color-target").forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.index);
      handleTargetTap(index, btn);
    };
  });
}

function spawnParticlesForButton(buttonEl, colorKey) {
  const board = document.querySelector(".coord-color-board");
  const layer = document.getElementById("coord-color-particles");
  if (!board || !layer || !buttonEl) return;

  const boardRect = board.getBoundingClientRect();
  const btnRect = buttonEl.getBoundingClientRect();
  const centerX = btnRect.left - boardRect.left + btnRect.width / 2;
  const centerY = btnRect.top - boardRect.top + btnRect.height / 2;

  for (let i = 0; i < 14; i += 1) {
    const particle = document.createElement("span");
    particle.className = `coord-particle ${COLOR_TOKENS[colorKey].className}`;

    const angle = (Math.PI * 2 * i) / 14;
    const distance = 28 + Math.random() * 34;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);

    layer.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 700);
  }
}

function animateWrongButton(buttonEl) {
  if (!buttonEl) return;
  buttonEl.classList.add("wrong-tap");
  setTimeout(() => buttonEl.classList.remove("wrong-tap"), 420);
}

function handleTargetTap(index, clickedBtn) {
  if (!currentLevelData || currentLevelData.locked) return;

  const target = currentLevelData.targets[index];
  if (!target || target.hit) return;

  const feedback = document.getElementById("coord-color-feedback");

  if (target.isTarget) {
    target.hit = true;
    currentLevelData.correctHits += 1;
    currentScore += 1;
    totalCorrectHits += 1;

    renderBoard();

    const newBtn = document.querySelector(`.coord-color-target[data-index="${index}"]`);
    spawnParticlesForButton(newBtn, target.color);

    const fb = document.getElementById("coord-color-feedback");
    if (fb) {
      fb.textContent = t("success");
      fb.className = "game-feedback ok";
    }

    if (currentLevelData.correctHits === currentLevelData.targetCount) {
      currentLevelData.locked = true;

      setTimeout(() => {
        currentLevelIndex += 1;
        if (currentLevelIndex < LEVELS.length) {
          setupLevelData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      }, 800);
    }
  } else {
    currentLevelData.wrongHits += 1;
    totalWrongHits += 1;
    currentLevelData.locked = true;

    animateWrongButton(clickedBtn);

    if (feedback) {
      feedback.textContent = t("fail");
      feedback.className = "game-feedback bad";
    }

    setTimeout(() => {
      currentLevelIndex += 1;
      if (currentLevelIndex < LEVELS.length) {
        setupLevelData();
        renderCurrentScreen();
      } else {
        finishGame();
      }
    }, 800);
  }
}

async function startGame() {
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  totalTargetsShown = 0;
  totalCorrectHits = 0;
  totalWrongHits = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = LEVELS.reduce((sum, level) => sum + level.targetCount, 0);

  const session = await createSession(currentUser.uid, {
    source: "coordination-tap-target"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "coordination_tap_target",
    category: "coordination",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      interactionMode: "color-target-selection"
    }
  });
  currentResultId = exercise.resultId;

  setupLevelData();
  renderCurrentScreen();
}

async function finishGame() {
  gameEnded = true;

  const maxScore = LEVELS.reduce((sum, level) => sum + level.targetCount, 0);
  const accuracyPercent = maxScore > 0 ? Math.round((totalCorrectHits / maxScore) * 100) : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: LEVELS.length,
        targetsShown: totalTargetsShown,
        correctHits: totalCorrectHits,
        wrongHits: totalWrongHits,
        accuracyPercent,
        interactionMode: "color-target-selection"
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "coordination-tap-target completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("coordination-tap-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("correctHits")} : ${totalCorrectHits}</p>
      <p>${t("wrongHits")} : ${totalWrongHits}</p>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/coordination'">${t("returnCoordination")}</button>
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
          targetsShown: totalTargetsShown,
          correctHits: totalCorrectHits,
          wrongHits: totalWrongHits,
          interactionMode: "color-target-selection"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "coordination-tap-target abandoned"
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  currentUser = user;
  updateStaticTexts();
  renderIntro();
});