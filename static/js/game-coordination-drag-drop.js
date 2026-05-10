import { auth } from "/static/js/firebase-config.js";
import { logoutEverywhere } from "/static/js/auth-session.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createSession, completeSession, cancelSession } from "/static/js/session-service.js";
import { startExercise, completeExercise, abandonExercise } from "/static/js/exercise-service.js";

const GAME_TRANSLATIONS = {
  ar: {
    sidebarSubtitle: "إعادة التأهيل",
    navDashboard: "الرئيسية",
    navGames: "التمارين",
    navProgress: "التقدم",
    navSettings: "الإعدادات",
    navAvc: "الوقاية من السكتة الدماغية",
    navMotor: "الحركي والتقييم",
    logout: "تسجيل الخروج",
    back: "رجوع",
    title: "وضع كل عنصر في غرفته",
    subtitle: "اسحب كل عنصر إلى الغرفة التي تعتقد أنها صحيحة.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة السحب والإفلات",
    introText: "اسحب كل عنصر إلى القطعة المناسبة. بعد وضع العنصر لا يمكن تغييره، وسيتم حساب النتيجة النهائية حسب عدد الأجوبة الصحيحة.",
    start: "إبدأ",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnCoordination: "العودة إلى التنسيق",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/objects/.",
    objectsLeft: "العناصر المتبقية",
    wrongPlaced: "موضوعة خطأ",
    correctPlaced: "موضوعة صحيح",
    kitchen: "المطبخ",
    bedroom: "غرفة النوم",
    bathroom: "الحمام",
    livingroom: "الصالون",
    placed: "تم وضع العنصر",
    finalGood: "الإجابات الصحيحة",
    finalBad: "الإجابات الخاطئة"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Accueil",
    navGames: "Exercices",
    navProgress: "Progrès",
    navSettings: "Paramètres",
    navAvc: "Prévention AVC",
    navMotor: "Moteur & Bilan",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Mettre chaque objet dans sa pièce",
    subtitle: "Glissez chaque objet vers la pièce que vous jugez correcte.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de glisser-déposer",
    introText: "Glissez chaque objet dans une pièce. Une fois posé, l’objet ne peut plus être changé, et le score final dépend du nombre de placements corrects.",
    start: "Commencer",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnCoordination: "Retour coordination",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/objects/.",
    objectsLeft: "Objets restants",
    wrongPlaced: "Mal placés",
    correctPlaced: "Bien placés",
    kitchen: "Cuisine",
    bedroom: "Chambre",
    bathroom: "Salle de bain",
    livingroom: "Salon",
    placed: "Objet placé",
    finalGood: "Bonnes réponses",
    finalBad: "Mauvaises réponses"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Home",
    navGames: "Exercises",
    navProgress: "Progrès",
    navSettings: "Settings",
    navAvc: "AVC Prevention",
    navMotor: "Motor & Assessment",
    logout: "Sign out",
    back: "Back",
    title: "Put each object in its room",
    subtitle: "Drag each object to the room you think is correct.",
    level: "Level",
    score: "Score",
    introTitle: "Drag and drop game",
    introText: "Drag each object into a room. Once placed, it cannot be changed, and the final score depends on how many placements were correct.",
    start: "Start",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnCoordination: "Back to coordination",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/objects/.",
    objectsLeft: "Objects left",
    wrongPlaced: "Wrongly placed",
    correctPlaced: "Correctly placed",
    kitchen: "Kitchen",
    bedroom: "Bedroom",
    bathroom: "Bathroom",
    livingroom: "Living room",
    placed: "Object placed",
    finalGood: "Correct answers",
    finalBad: "Wrong answers"
  }
};

const OBJECT_LIBRARY = {
  plate:          { src: "/static/images/objects/plate.png",          room: "kitchen"    },
  cup:            { src: "/static/images/objects/cup.png",            room: "kitchen"    },
  spoon:          { src: "/static/images/objects/spoon.png",          room: "kitchen"    },
  fork:           { src: "/static/images/objects/fork.png",           room: "kitchen"    },
  pan:            { src: "/static/images/objects/pan.png",            room: "kitchen"    },
  fridge:         { src: "/static/images/objects/fridge.png",         room: "kitchen"    },
  sink:           { src: "/static/images/objects/sink.png",           room: "kitchen"    },
  knife:          { src: "/static/images/objects/knife.png",          room: "kitchen"    },
  pot:            { src: "/static/images/objects/pot.png",            room: "kitchen"    },
  bottle:         { src: "/static/images/objects/bottle.png",         room: "kitchen"    },
  oven:           { src: "/static/images/objects/oven.png",           room: "kitchen"    },

  bed:            { src: "/static/images/objects/bed.png",            room: "bedroom"    },
  pillow:         { src: "/static/images/objects/pillow.png",         room: "bedroom"    },
  lamp:           { src: "/static/images/objects/lamp.png",           room: "bedroom"    },
  wardrobe:       { src: "/static/images/objects/wardrobe.png",       room: "bedroom"    },
  blanket:        { src: "/static/images/objects/blanket.png",        room: "bedroom"    },
  watch:          { src: "/static/images/objects/watch.png",          room: "bedroom"    },
  iron:           { src: "/static/images/objects/iron.png",           room: "bedroom"    },
  shirt:          { src: "/static/images/objects/shirt.png",          room: "bedroom"    },
  jacket:         { src: "/static/images/objects/jacket.png",         room: "bedroom"    },
  alarmclock:     { src: "/static/images/objects/alarmclock.png",     room: "bedroom"    },

  soap:           { src: "/static/images/objects/soap.png",           room: "bathroom"   },
  toothbrush:     { src: "/static/images/objects/toothbrush.png",     room: "bathroom"   },
  toothpaste:     { src: "/static/images/objects/toothpaste.png",     room: "bathroom"   },
  towel:          { src: "/static/images/objects/towel.png",          room: "bathroom"   },
  shower:         { src: "/static/images/objects/shower.png",         room: "bathroom"   },
  mirror:         { src: "/static/images/objects/mirror.png",         room: "bathroom"   },
  comb:           { src: "/static/images/objects/comb.png",           room: "bathroom"   },
  hairdryer:      { src: "/static/images/objects/hairdryer.png",      room: "bathroom"   },
  washingmachine: { src: "/static/images/objects/washingmachine.png", room: "bathroom"   },

  sofa:           { src: "/static/images/objects/sofa.png",           room: "livingroom" },
  tv:             { src: "/static/images/objects/tv.png",             room: "livingroom" },
  chair:          { src: "/static/images/objects/chair.png",          room: "livingroom" },
  table:          { src: "/static/images/objects/table.png",          room: "livingroom" },
  remote:         { src: "/static/images/objects/remote.png",         room: "livingroom" },
  clock:          { src: "/static/images/objects/clock.png",          room: "livingroom" },
  book:           { src: "/static/images/objects/book.png",           room: "livingroom" },
  candle:         { src: "/static/images/objects/candle.png",         room: "livingroom" },
  pc:             { src: "/static/images/objects/pc.png",             room: "livingroom" },
  charger:        { src: "/static/images/objects/charger.png",        room: "livingroom" }
};


// Progression de difficulté :
// Niveau 1 : 3 objets, catégories évidentes    → très facile
// Niveau 2 : 4 objets
// Niveau 3 : 5 objets
// Niveau 4 : 6 objets, catégories moins évidentes → modéré
// Niveau 5 : 7 objets                          → difficile
// Niveau 6 : 8 objets, objets ambigus          → très difficile
// Progression de difficulté :
// Niveau 1 : 3 objets, pas de timer                → très facile
// Niveau 2 : 4 objets, 45s
// Niveau 3 : 5 objets, 40s
// Niveau 4 : 6 objets, 35s
// Niveau 5 : 7 objets, 30s                         → difficile
// Niveau 6 : 8 objets, 25s                         → très difficile
const LEVELS = [
  { objects: ["plate", "bed", "soap"],                                                          timeLimitSec: 20  },
  { objects: ["cup", "lamp", "toothbrush", "tv"],                                               timeLimitSec: 20 },
  { objects: ["pan", "pillow", "toothpaste", "chair", "mirror"],                                timeLimitSec: 20 },
  { objects: ["fridge", "wardrobe", "towel", "remote", "spoon", "blanket"],                     timeLimitSec: 20 },
  { objects: ["sink", "shower", "clock", "watch", "iron", "shirt", "fork"],                     timeLimitSec: 25 },
  { objects: ["washingmachine", "soap", "toothbrush", "wardrobe", "tv", "fridge", "plate", "sofa"], timeLimitSec: 25 }
];

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
let totalCorrectDrops = 0;
let totalWrongDrops = 0;
let totalPlacedObjects = 0;
let _dndTimer = null;
let _dndTimeLeft = 0;
let touchDragKey = null;

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
}

function updateStaticTexts() {
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
  updateStaticTexts();
  renderCurrentScreen();
};

async function preloadImages() {
  const entries = Object.entries(OBJECT_LIBRARY);

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

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderMissingAssetsMessage() {
  const root = document.getElementById("coordination-dnd-root");
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
  const root = document.getElementById("coordination-dnd-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/>
          <path d="M9 7V5h6v2"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-coordination-dnd-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-coordination-dnd-btn").onclick = startGame;
}

function setupLevelData() {
  const levelObjects = LEVELS[currentLevelIndex].objects.filter((key) => loadedAssets.has(key));

  currentLevelData = {
    objects: shuffle(levelObjects).map((key) => ({
      key,
      room: OBJECT_LIBRARY[key].room,
      placed: false,
      placedRoom: null,
      correct: false
    })),
    wrongPlaced: 0,
    correctPlaced: 0
  };
}

function getRemainingObjects() {
  return currentLevelData.objects.filter((obj) => !obj.placed);
}

function startDndTimer(totalSec) {
  clearInterval(_dndTimer);
  _dndTimeLeft = totalSec;
  _dndTimer = setInterval(() => {
    _dndTimeLeft -= 1;
    const el = document.getElementById("dnd-timer-val");
    if (el) el.textContent = _dndTimeLeft;
    const pill = document.getElementById("dnd-timer-pill");
    if (pill && _dndTimeLeft <= 8) pill.style.color = "var(--danger, #e74c3c)";
    if (_dndTimeLeft <= 0) {
      clearInterval(_dndTimer);
      const fb = document.getElementById("coord-dnd-feedback");
      if (fb) { fb.textContent = t("timeUp"); fb.className = "game-feedback bad"; }
      setTimeout(() => {
        currentLevelIndex += 1;
        _dndTimeLeft = 0;
        if (currentLevelIndex < LEVELS.length) {
          setupLevelData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      }, 800);
    }
  }, 1000);
}

function stopDndTimer() {
  clearInterval(_dndTimer);
  _dndTimeLeft = 0;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentLevelData && !gameEnded) {
    renderIntro();
    return;
  }

  if (currentLevelData) {
    renderBoard();
  }
}

function renderBoard() {
  updateStaticTexts();

  const root = document.getElementById("coordination-dnd-root");
  const remaining = getRemainingObjects();

  root.innerHTML = `
    <div class="memory-pairs-stats">
      <div class="game-pill">${t("objectsLeft")} : ${remaining.length}</div>
      <div class="game-pill">${t("correctPlaced")} : ${currentLevelData.correctPlaced}</div>
      <div class="game-pill game-pill-score">${t("wrongPlaced")} : ${currentLevelData.wrongPlaced}</div>
      ${LEVELS[currentLevelIndex] && LEVELS[currentLevelIndex].timeLimitSec > 0 ? `<div class="game-pill" id="dnd-timer-pill" style="font-weight:700;color:var(--primary)">⏱ <span id="dnd-timer-val">${_dndTimeLeft || LEVELS[currentLevelIndex].timeLimitSec}</span>s</div>` : ""}
    </div>

    <div class="coord-dnd-layout">
      <div class="coord-dnd-room-grid">
        ${renderRoomCard("kitchen")}
        ${renderRoomCard("bedroom")}
        ${renderRoomCard("bathroom")}
        ${renderRoomCard("livingroom")}
      </div>

      <div class="coord-dnd-bank">
        ${remaining.map((obj) => `
          <div class="coord-dnd-object" draggable="true" data-key="${obj.key}">
            <img src="${OBJECT_LIBRARY[obj.key].src}" alt="" class="coord-dnd-object-img" draggable="false">
          </div>
        `).join("")}
      </div>

      <div class="game-feedback" id="coord-dnd-feedback"></div>
    </div>
  `;

  bindDnD();
  // Start timer if configured
  const dndCfg = LEVELS[currentLevelIndex];
  if (dndCfg && dndCfg.timeLimitSec > 0) {
    if (_dndTimeLeft <= 0) startDndTimer(dndCfg.timeLimitSec);
  }
}

function renderRoomCard(roomKey) {
  return `
    <div class="coord-room-card" data-room="${roomKey}">
      <div class="coord-room-head">${t(roomKey)}</div>
      <div class="coord-room-dropzone" data-room="${roomKey}">
        ${currentLevelData.objects
          .filter((obj) => obj.placed && obj.placedRoom === roomKey)
          .map((obj) => `
            <div class="coord-room-placed ${obj.correct ? "correct" : "wrong"}">
              <img src="${OBJECT_LIBRARY[obj.key].src}" alt="" class="coord-room-placed-img" draggable="false">
            </div>
          `).join("")}
      </div>
    </div>
  `;
}

function bindDnD() {
  document.querySelectorAll(".coord-dnd-object").forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.key);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    item.addEventListener("touchstart", () => {
      touchDragKey = item.dataset.key;
      item.classList.add("dragging");
    }, { passive: true });

    item.addEventListener("touchend", () => {
      item.classList.remove("dragging");
    });
  });

  document.querySelectorAll(".coord-room-dropzone").forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");
      const key = e.dataTransfer.getData("text/plain");
      handleDrop(key, zone.dataset.room);
    });

    zone.addEventListener("touchend", () => {
      if (touchDragKey) {
        handleDrop(touchDragKey, zone.dataset.room);
        touchDragKey = null;
      }
    });
  });
}

function handleDrop(key, room) {
  const obj = currentLevelData.objects.find((o) => o.key === key && !o.placed);
  if (!obj) return;

  const feedback = document.getElementById("coord-dnd-feedback");

  obj.placed = true;
  obj.placedRoom = room;
  totalPlacedObjects += 1;

  if (obj.room === room) {
    obj.correct = true;
    currentScore += 1;
    currentLevelData.correctPlaced += 1;
    totalCorrectDrops += 1;
  } else {
    obj.correct = false;
    currentLevelData.wrongPlaced += 1;
    totalWrongDrops += 1;
  }

  renderBoard();

  const fb = document.getElementById("coord-dnd-feedback");
  if (fb) {
    fb.textContent = t("placed");
    fb.className = `game-feedback ${obj.correct ? "ok" : "bad"}`;
  }

  if (getRemainingObjects().length === 0) {
    setTimeout(() => {
      currentLevelIndex += 1;
      if (currentLevelIndex < LEVELS.length) {
        setupLevelData();
        renderCurrentScreen();
      } else {
        finishGame();
      }
    }, 700);
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
  totalCorrectDrops = 0;
  totalWrongDrops = 0;
  totalPlacedObjects = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = LEVELS.reduce((sum, level) => sum + level.objects.length, 0);

  const session = await createSession(currentUser.uid, {
    source: "coordination-drag-drop"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "coordination_drag_drop",
    category: "coordination",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      assetMode: "local-room-objects",
      imagePoolSize: Object.keys(OBJECT_LIBRARY).length
    }
  });
  currentResultId = exercise.resultId;

  setupLevelData();
  renderCurrentScreen();
}

async function finishGame() {
  stopDndTimer();
  gameEnded = true;

  const maxScore = LEVELS.reduce((sum, level) => sum + level.objects.length, 0);
  const accuracyPercent = maxScore > 0 ? Math.round((totalCorrectDrops / maxScore) * 100) : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: LEVELS.length,
        correctDrops: totalCorrectDrops,
        wrongDrops: totalWrongDrops,
        totalObjects: maxScore,
        totalPlacedObjects,
        accuracyPercent,
        assetMode: "local-room-objects",
        imagePoolSize: Object.keys(OBJECT_LIBRARY).length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "coordination-drag-drop completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("coordination-dnd-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("finalGood")} : ${totalCorrectDrops}</p>
      <p>${t("finalBad")} : ${totalWrongDrops}</p>
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
          correctDrops: totalCorrectDrops,
          wrongDrops: totalWrongDrops,
          totalPlacedObjects,
          assetMode: "local-room-objects"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "coordination-drag-drop abandoned"
      });
    }
  } catch (error) {
    console.error("Leave game error:", error);
  }

  window.location.href = "/exercises/coordination";
};

window.logout = logoutEverywhere;

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
