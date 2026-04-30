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
    assetsMissing: "بعض الصور غير موجودة داخل static/images/coordination/.",
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
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
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
    assetsMissing: "Certaines images sont absentes dans static/images/coordination/.",
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
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
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
    assetsMissing: "Some images are missing in static/images/coordination/.",
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
  plate: { src: "/static/images/coordination/plate.png", room: "kitchen" },
  cup: { src: "/static/images/coordination/cup.png", room: "kitchen" },
  spoon: { src: "/static/images/coordination/spoon.png", room: "kitchen" },
  fork: { src: "/static/images/coordination/fork.png", room: "kitchen" },
  pan: { src: "/static/images/coordination/pan.png", room: "kitchen" },
  fridge: { src: "/static/images/coordination/fridge.png", room: "kitchen" },
  sink: { src: "/static/images/coordination/sink.png", room: "kitchen" },

  bed: { src: "/static/images/coordination/bed.png", room: "bedroom" },
  pillow: { src: "/static/images/coordination/pillow.png", room: "bedroom" },
  lamp: { src: "/static/images/coordination/lamp.png", room: "bedroom" },
  wardrobe: { src: "/static/images/coordination/wardrobe.png", room: "bedroom" },
  blanket: { src: "/static/images/coordination/blanket.png", room: "bedroom" },

  soap: { src: "/static/images/coordination/soap.png", room: "bathroom" },
  toothbrush: { src: "/static/images/coordination/toothbrush.png", room: "bathroom" },
  toothpaste: { src: "/static/images/coordination/toothpaste.png", room: "bathroom" },
  towel: { src: "/static/images/coordination/towel.png", room: "bathroom" },
  shower: { src: "/static/images/coordination/shower.png", room: "bathroom" },
  mirror: { src: "/static/images/coordination/mirror.png", room: "bathroom" },

  sofa: { src: "/static/images/coordination/sofa.png", room: "livingroom" },
  tv: { src: "/static/images/coordination/tv.png", room: "livingroom" },
  chair: { src: "/static/images/coordination/chair.png", room: "livingroom" },
  table: { src: "/static/images/coordination/table.png", room: "livingroom" },
  remote: { src: "/static/images/coordination/remote.png", room: "livingroom" },
  clock: { src: "/static/images/coordination/clock.png", room: "livingroom" }
};

const LEVELS = [
  ["plate", "bed", "soap", "sofa"],
  ["cup", "lamp", "toothbrush", "tv", "fork"],
  ["pan", "pillow", "toothpaste", "chair", "mirror", "table"],
  ["fridge", "wardrobe", "towel", "remote", "spoon", "blanket"],
  ["sink", "bed", "shower", "clock", "cup", "lamp", "soap"],
  ["plate", "pan", "wardrobe", "toothbrush", "mirror", "sofa", "tv", "table"]
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
  const levelObjects = LEVELS[currentLevelIndex].filter((key) => loadedAssets.has(key));

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

  const maxScore = LEVELS.reduce((sum, level) => sum + level.length, 0);

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
  gameEnded = true;

  const maxScore = LEVELS.reduce((sum, level) => sum + level.length, 0);
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