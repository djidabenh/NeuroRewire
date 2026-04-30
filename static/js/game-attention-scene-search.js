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
    title: "البحث في المشهد",
    subtitle: "ابحث عن العناصر المطلوبة داخل المشهد.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة البحث في المشهد",
    introText: "في كل مستوى ستظهر لك مشهد كامل. انقر على العنصر المطلوب داخل المشهد للانتقال إلى العنصر التالي.",
    start: "إبدأ",
    sceneLabel: "المشهد",
    clickOn: "انقر على",
    success: "إجابة صحيحة",
    fail: "ليس هنا",
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
    title: "Chercher dans la scène",
    subtitle: "Trouvez les objets indiqués dans la scène.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de recherche dans la scène",
    introText: "À chaque niveau, une scène complète est affichée. Cliquez sur l’objet demandé dans la scène pour passer au suivant.",
    start: "Commencer",
    sceneLabel: "Scène",
    clickOn: "Cliquez sur",
    success: "Bonne réponse",
    fail: "Pas ici",
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
    title: "Search the scene",
    subtitle: "Find the requested objects in the scene.",
    level: "Level",
    score: "Score",
    introTitle: "Scene search game",
    introText: "At each level, a full scene is displayed. Click the requested object in the scene to move to the next one.",
    start: "Start",
    sceneLabel: "Scene",
    clickOn: "Click on",
    success: "Correct",
    fail: "Not here",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnAttention: "Back to attention",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/memory/."
  }
};

const IMAGE_LIBRARY = {
  apple: { src: "/static/images/memory/apple.png", label: { ar: "تفاحة", fr: "pomme", en: "apple" } },
  banana: { src: "/static/images/memory/banana.png", label: { ar: "موزة", fr: "banane", en: "banana" } },
  orange: { src: "/static/images/memory/orange.png", label: { ar: "برتقالة", fr: "orange", en: "orange" } },
  grape: { src: "/static/images/memory/grape.png", label: { ar: "عنب", fr: "raisin", en: "grapes" } },
  lemon: { src: "/static/images/memory/lemon.png", label: { ar: "ليمونة", fr: "citron", en: "lemon" } },
  tree: { src: "/static/images/memory/tree.png", label: { ar: "شجرة", fr: "arbre", en: "tree" } },
  flower: { src: "/static/images/memory/flower.png", label: { ar: "زهرة", fr: "fleur", en: "flower" } },
  lion: { src: "/static/images/memory/lion.png", label: { ar: "أسد", fr: "lion", en: "lion" } },
  house: { src: "/static/images/memory/house.png", label: { ar: "منزل", fr: "maison", en: "house" } },
  book: { src: "/static/images/memory/book.png", label: { ar: "كتاب", fr: "livre", en: "book" } },
  car: { src: "/static/images/memory/car.png", label: { ar: "سيارة", fr: "voiture", en: "car" } },
  dog: { src: "/static/images/memory/dog.png", label: { ar: "كلب", fr: "chien", en: "dog" } },
  cat: { src: "/static/images/memory/cat.png", label: { ar: "قط", fr: "chat", en: "cat" } }
};

const SCENES = [
  {
    name: { ar: "المطبخ", fr: "Cuisine", en: "Kitchen" },
    bg: `
      <svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wallKitchen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFF8EE"/>
            <stop offset="100%" stop-color="#F7ECD9"/>
          </linearGradient>
          <linearGradient id="floorKitchen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#E7D1B2"/>
            <stop offset="100%" stop-color="#D2B48C"/>
          </linearGradient>
        </defs>
        <rect width="900" height="560" fill="url(#wallKitchen)"/>
        <rect y="400" width="900" height="160" fill="url(#floorKitchen)"/>
        <rect x="0" y="320" width="900" height="26" fill="#C49A6C"/>
        <rect x="0" y="346" width="900" height="54" fill="#B68252"/>
        <rect x="40" y="70" width="240" height="180" rx="12" fill="#C79A54"/>
        <rect x="55" y="85" width="100" height="150" rx="10" fill="#DEB86C"/>
        <rect x="165" y="85" width="100" height="150" rx="10" fill="#DEB86C"/>
        <rect x="580" y="265" width="220" height="55" rx="8" fill="#34495E"/>
        <circle cx="635" cy="292" r="18" fill="#1F2B35"/>
        <circle cx="690" cy="292" r="18" fill="#1F2B35"/>
        <circle cx="745" cy="292" r="18" fill="#1F2B35"/>
        <rect x="355" y="320" width="170" height="70" rx="10" fill="#AAB7B8"/>
        <rect x="365" y="332" width="65" height="42" rx="6" fill="#899597"/>
        <rect x="446" y="332" width="65" height="42" rx="6" fill="#899597"/>
        <rect x="750" y="75" width="95" height="95" rx="12" fill="#AED6F1" stroke="#7FB3CC" stroke-width="4"/>
        <line x1="797.5" y1="75" x2="797.5" y2="170" stroke="#7FB3CC" stroke-width="4"/>
        <line x1="750" y1="122.5" x2="845" y2="122.5" stroke="#7FB3CC" stroke-width="4"/>
        <circle cx="785" cy="107" r="20" fill="#F4D03F" opacity="0.9"/>
        <rect x="110" y="440" width="150" height="18" rx="9" fill="#8B5E34"/>
        <rect x="126" y="458" width="18" height="72" rx="8" fill="#A47148"/>
        <rect x="226" y="458" width="18" height="72" rx="8" fill="#A47148"/>
      </svg>
    `,
    objects: [
      { id: "kettle", key: "apple", left: 12, top: 47, size: 13 },
      { id: "fruit_bowl", key: "orange", left: 44, top: 60, size: 16 },
      { id: "cup", key: "lemon", left: 76, top: 47, size: 11 },
      { id: "book", key: "book", left: 16, top: 76, size: 10 },
      { id: "cat", key: "cat", left: 68, top: 74, size: 12 },
      { id: "flower", key: "flower", left: 86, top: 57, size: 10 }
    ]
  },
  {
    name: { ar: "غرفة الجلوس", fr: "Salon", en: "Living room" },
    bg: `
      <svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
        <rect width="900" height="560" fill="#F9EAD7"/>
        <rect y="405" width="900" height="155" fill="#DFC4A5"/>
        <rect x="55" y="250" width="380" height="150" rx="18" fill="#2E86C1"/>
        <rect x="55" y="250" width="380" height="38" rx="16" fill="#4EA3D8"/>
        <rect x="55" y="250" width="34" height="150" rx="12" fill="#4EA3D8"/>
        <rect x="401" y="250" width="34" height="150" rx="12" fill="#4EA3D8"/>
        <rect x="85" y="293" width="135" height="90" rx="16" fill="#F39C12"/>
        <rect x="255" y="293" width="135" height="90" rx="16" fill="#E74C3C"/>
        <rect x="150" y="392" width="220" height="18" rx="9" fill="#8B5E34"/>
        <rect x="170" y="410" width="18" height="78" rx="8" fill="#A47148"/>
        <rect x="332" y="410" width="18" height="78" rx="8" fill="#A47148"/>
        <rect x="590" y="90" width="230" height="145" rx="12" fill="#2C3E50"/>
        <rect x="602" y="102" width="206" height="121" rx="8" fill="#1F618D"/>
        <rect x="510" y="260" width="120" height="145" rx="10" fill="#8E44AD"/>
        <ellipse cx="570" cy="405" rx="64" ry="15" fill="#7D3C98"/>
      </svg>
    `,
    objects: [
      { id: "remote", key: "book", left: 28, top: 63, size: 11 },
      { id: "vase", key: "flower", left: 63, top: 49, size: 15 },
      { id: "glasses", key: "car", left: 84, top: 67, size: 12 },
      { id: "dog", key: "dog", left: 10, top: 80, size: 12 },
      { id: "house", key: "house", left: 73, top: 81, size: 12 },
      { id: "tree", key: "tree", left: 90, top: 28, size: 10 }
    ]
  },
  {
    name: { ar: "الحديقة", fr: "Jardin", en: "Garden" },
    bg: `
      <svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
        <rect width="900" height="350" fill="#8FD0F3"/>
        <rect y="350" width="900" height="210" fill="#58BF73"/>
        <rect x="430" y="350" width="90" height="210" fill="#D2B56B"/>
        <ellipse cx="160" cy="100" rx="72" ry="34" fill="#fff" opacity=".9"/>
        <ellipse cx="130" cy="110" rx="48" ry="28" fill="#fff" opacity=".9"/>
        <ellipse cx="205" cy="110" rx="52" ry="30" fill="#fff" opacity=".9"/>
        <ellipse cx="700" cy="90" rx="80" ry="36" fill="#fff" opacity=".88"/>
        <ellipse cx="655" cy="102" rx="55" ry="30" fill="#fff" opacity=".88"/>
        <ellipse cx="755" cy="102" rx="57" ry="32" fill="#fff" opacity=".88"/>
        <rect x="70" y="260" width="22" height="95" fill="#8B5E34"/>
        <circle cx="81" cy="232" r="52" fill="#2EAD5F"/>
        <circle cx="55" cy="252" r="34" fill="#34C26A"/>
        <circle cx="106" cy="248" r="34" fill="#34C26A"/>
        <rect x="760" y="250" width="24" height="100" fill="#8B5E34"/>
        <circle cx="772" cy="218" r="54" fill="#2EAD5F"/>
        <circle cx="745" cy="240" r="35" fill="#34C26A"/>
        <circle cx="800" cy="238" r="35" fill="#34C26A"/>
        <rect x="260" y="280" width="170" height="14" rx="7" fill="#8B5E34"/>
      </svg>
    `,
    objects: [
      { id: "sun", key: "orange", left: 78, top: 14, size: 16 },
      { id: "bird", key: "banana", left: 41, top: 37, size: 12 },
      { id: "watering_can", key: "car", left: 63, top: 78, size: 12 },
      { id: "flower_pot", key: "flower", left: 27, top: 74, size: 12 },
      { id: "cat_garden", key: "cat", left: 51, top: 83, size: 11 },
      { id: "apple_tree", key: "apple", left: 10, top: 46, size: 10 }
    ]
  }
];

const LEVELS = [
  { sceneIndex: 0, targetIds: ["kettle", "fruit_bowl"] },
  { sceneIndex: 1, targetIds: ["remote", "vase"] },
  { sceneIndex: 2, targetIds: ["sun", "bird"] },
  { sceneIndex: 0, targetIds: ["cup", "flower", "cat"] },
  { sceneIndex: 1, targetIds: ["glasses", "house", "dog"] },
  { sceneIndex: 2, targetIds: ["watering_can", "flower_pot", "cat_garden", "apple_tree"] }
];

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let currentRoundData = null;
let gameEnded = false;
let loadedAssets = new Set();
let missingAssets = [];
let totalTargetsShown = 0;
let totalTargetsFound = 0;
let totalWrongClicks = 0;
let currentTargetIndex = 0;
let currentHotspotState = null;

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
}

function getLabelForKey(key) {
  return IMAGE_LIBRARY[key]?.label?.[currentLang] || IMAGE_LIBRARY[key]?.label?.fr || key;
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
  const entries = Object.entries(IMAGE_LIBRARY);

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

function renderMissingAssetsMessage() {
  const root = document.getElementById("attention-scene-root");
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
  const root = document.getElementById("attention-scene-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-attention-scene-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-attention-scene-btn").onclick = startGame;
}

function setupLevelData() {
  const level = LEVELS[currentLevelIndex];
  const scene = SCENES[level.sceneIndex];
  const targetObjects = level.targetIds.map((id) => scene.objects.find((obj) => obj.id === id)).filter(Boolean);

  currentRoundData = {
    scene,
    targetObjects,
    foundIds: [],
    wrongClicks: 0
  };
  currentTargetIndex = 0;
  currentHotspotState = null;
  totalTargetsShown += targetObjects.length;
}

function renderSceneTargetBox(targetObj) {
  return `
    <div class="scene-target-box">
      <img src="${IMAGE_LIBRARY[targetObj.key].src}" alt="" class="scene-target-box-img" loading="eager" draggable="false">
      <span>${t("clickOn")} ${getLabelForKey(targetObj.key)}</span>
    </div>
  `;
}

function renderSceneObjects(scene, foundIds = []) {
  return scene.objects.map((obj) => `
    <div
      class="scene-object ${foundIds.includes(obj.id) ? "found" : ""}"
      style="left:${obj.left}%; top:${obj.top}%; width:${obj.size}%;"
    >
      <img src="${IMAGE_LIBRARY[obj.key].src}" alt="" class="scene-object-img" loading="eager" draggable="false">
    </div>
  `).join("");
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  renderSceneBoard();
}

function renderSceneBoard() {
  const root = document.getElementById("attention-scene-root");
  const scene = currentRoundData.scene;
  const targetObj = currentRoundData.targetObjects[currentTargetIndex];
  const progress = `${currentTargetIndex + 1}/${currentRoundData.targetObjects.length}`;

  root.innerHTML = `
    <div class="sbar scene-sbar">
      <span>${t("sceneLabel")} : ${scene.name[currentLang] || scene.name.fr}</span>
      <span>${progress}</span>
    </div>

    <div class="gc scene-card-shell">
      ${renderSceneTargetBox(targetObj)}

      <div class="scene-outer scene-outer-proto">
        ${scene.bg}
        <div class="scene-objects-layer">
          ${renderSceneObjects(scene, currentRoundData.foundIds)}
        </div>
        <div id="scene-overlay" class="scene-overlay-layer"></div>

        ${currentHotspotState ? `
          <div
            class="hs-btn ${currentHotspotState.type}"
            style="left:${currentHotspotState.x}%; top:${currentHotspotState.y}%"
          >
            <svg viewBox="0 0 24 24">
              ${currentHotspotState.type === "ok"
                ? `<path d="M20 6 9 17l-5-5"/>`
                : `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`
              }
            </svg>
          </div>
        ` : ""}
      </div>

      <div id="scene-fb" class="scene-feedback-inline"></div>
    </div>
  `;

  const overlay = document.getElementById("scene-overlay");
  if (!overlay) return;

  overlay.onclick = function (e) {
    handleSceneClick(e);
  };
}

function handleSceneClick(e) {
  const overlay = document.getElementById("scene-overlay");
  if (!overlay) return;

  const rect = overlay.getBoundingClientRect();
  const px = ((e.clientX - rect.left) / rect.width) * 100;
  const py = ((e.clientY - rect.top) / rect.height) * 100;

  const targetObj = currentRoundData.targetObjects[currentTargetIndex];

  let closest = null;
  let minDist = Infinity;

  currentRoundData.scene.objects.forEach((obj) => {
    const centerX = obj.left + (obj.size / 2);
    const centerY = obj.top + (obj.size / 2);
    const dx = px - centerX;
    const dy = py - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closest = {
        obj,
        x: centerX,
        y: centerY,
        dist
      };
    }
  });

  const feedback = document.getElementById("scene-fb");
  const isHit = closest && closest.obj.id === targetObj.id && closest.dist < 12.5;

  if (isHit) {
    currentScore += 1;
    totalTargetsFound += 1;
    currentRoundData.foundIds.push(targetObj.id);
    currentHotspotState = { type: "ok", x: closest.x, y: closest.y };

    renderSceneBoard();
    const fb = document.getElementById("scene-fb");
    if (fb) {
      fb.textContent = t("success");
      fb.className = "scene-feedback-inline ok";
    }

    setTimeout(() => {
      currentTargetIndex += 1;
      currentHotspotState = null;

      if (currentTargetIndex >= currentRoundData.targetObjects.length) {
        currentLevelIndex += 1;

        if (currentLevelIndex < LEVELS.length) {
          setupLevelData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      } else {
        renderCurrentScreen();
      }
    }, 850);
  } else {
    totalWrongClicks += 1;
    currentRoundData.wrongClicks += 1;
    currentHotspotState = {
      type: "bad",
      x: Math.max(6, Math.min(94, px)),
      y: Math.max(8, Math.min(92, py))
    };

    renderSceneBoard();
    const fb = document.getElementById("scene-fb");
    if (fb) {
      fb.textContent = t("fail");
      fb.className = "scene-feedback-inline bad";
    }

    setTimeout(() => {
      currentHotspotState = null;
      renderCurrentScreen();
    }, 650);
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
  totalTargetsShown = 0;
  totalTargetsFound = 0;
  totalWrongClicks = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = LEVELS.reduce((sum, lvl) => sum + lvl.targetIds.length, 0);

  const session = await createSession(currentUser.uid, {
    source: "attention-scene-search"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "attention_scene_search",
    category: "attention",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      assetMode: "scene-prototype-style",
      imagePoolSize: Object.keys(IMAGE_LIBRARY).length
    }
  });
  currentResultId = exercise.resultId;

  setupLevelData();
  renderCurrentScreen();
}

async function finishGame() {
  gameEnded = true;

  const maxScore = LEVELS.reduce((sum, lvl) => sum + lvl.targetIds.length, 0);
  const accuracyPercent = maxScore > 0 ? Math.round((totalTargetsFound / maxScore) * 100) : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: LEVELS.length,
        targetsShown: totalTargetsShown,
        targetsFound: totalTargetsFound,
        wrongClicks: totalWrongClicks,
        accuracyPercent,
        assetMode: "scene-prototype-style",
        imagePoolSize: Object.keys(IMAGE_LIBRARY).length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "attention-scene-search completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("attention-scene-root");
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
          round: currentLevelIndex + 1,
          targetsShown: totalTargetsShown,
          targetsFound: totalTargetsFound,
          wrongClicks: totalWrongClicks,
          assetMode: "scene-prototype-style"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "attention-scene-search abandoned"
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