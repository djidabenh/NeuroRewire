import { auth } from "/static/js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createSession, completeSession, cancelSession } from "/static/js/session-service.js";
import { startExercise, completeExercise, abandonExercise } from "/static/js/exercise-service.js";

const T = {
  ar: {
    sidebarSubtitle: "إعادة التأهيل",
    navDashboard: "الرئيسية",
    navGames: "التمارين",
    navProgress: "التقدم",
    navSettings: "الإعدادات",
    logout: "تسجيل الخروج",
    back: "رجوع",
    title: "المتاهة",
    subtitle: "وجّه النقطة من البداية إلى النهاية داخل الممر.",
    introTitle: "لعبة المتاهة",
    introText: "حرّك النقطة داخل المسار فقط حتى تصل إلى النهاية. كل مستوى يصبح أضيق وأطول.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    wallHits: "اصطدامات",
    completed: "مكتملة",
    reset: "إعادة المحاولة",
    success: "وصلت إلى النهاية",
    fail: "اصطدمت بالجدار",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnTraj: "العودة إلى Trajectoire"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Le labyrinthe",
    subtitle: "Guidez le point du début à la fin dans le couloir.",
    introTitle: "Jeu du labyrinthe",
    introText: "Déplacez le point uniquement dans le chemin jusqu’à l’arrivée. Chaque niveau devient plus étroit et plus long.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    wallHits: "Impacts mur",
    completed: "Terminés",
    reset: "Réessayer",
    success: "Arrivée atteinte",
    fail: "Mur touché",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnTraj: "Retour Trajectoire"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "The maze",
    subtitle: "Guide the dot from start to finish inside the corridor.",
    introTitle: "Maze game",
    introText: "Move the dot only inside the path until you reach the finish. Each level becomes narrower and longer.",
    start: "Start",
    level: "Level",
    score: "Score",
    wallHits: "Wall hits",
    completed: "Completed",
    reset: "Try again",
    success: "Finish reached",
    fail: "Wall touched",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnTraj: "Back to Trajectory"
  }
};

const LEVELS = [
  { width: 44, points: [[70,170],[170,170],[170,90],[300,90],[300,230],[470,230],[540,170]] },
  { width: 40, points: [[60,250],[140,250],[140,90],[260,90],[260,210],[390,210],[390,120],[540,120]] },
  { width: 36, points: [[65,180],[150,180],[150,70],[250,70],[250,250],[370,250],[370,120],[500,120],[500,220]] },
  { width: 32, points: [[60,260],[140,260],[140,80],[220,80],[220,210],[310,210],[310,100],[430,100],[430,250],[540,250]] },
  { width: 28, points: [[50,260],[120,260],[120,70],[200,70],[200,170],[290,170],[290,90],[390,90],[390,250],[480,250],[480,130],[550,130]] },
  { width: 24, points: [[45,250],[115,250],[115,65],[195,65],[195,150],[270,150],[270,90],[355,90],[355,235],[430,235],[430,110],[510,110],[510,210],[565,210]] }
];

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;
let wallHits = 0;
let mazesCompleted = 0;
let dragging = false;
let playerTrail = [];
let playerPos = null;
let started = false;

function tt(key){ return T[currentLang][key]; }

function refreshTopbar(){
  document.getElementById("game-round-label").textContent = `${tt("level")} ${Math.min(currentLevelIndex + 1, LEVELS.length)} / ${LEVELS.length}`;
  document.getElementById("game-score-label").textContent = `${tt("score")} : ${currentScore}`;
}

function updateTexts(){
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  document.getElementById("sidebar-subtitle").textContent = tt("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = tt("navDashboard");
  document.getElementById("nav-games").textContent = tt("navGames");
  document.getElementById("nav-progress").textContent = tt("navProgress");
  document.getElementById("nav-settings").textContent = tt("navSettings");
  document.getElementById("logout-text").textContent = tt("logout");
  document.getElementById("back-text").textContent = tt("back");
  document.getElementById("game-title").textContent = tt("title");
  document.getElementById("game-subtitle").textContent = tt("subtitle");
  refreshTopbar();
  document.querySelectorAll(".slp").forEach(btn => btn.classList.remove("on"));
  const active = document.getElementById(`lang-${currentLang}`);
  if (active) active.classList.add("on");
}

window.setGameLang = function(lang){
  localStorage.setItem("nrw_lang", lang);
  currentLang = lang;
  updateTexts();
  if (started && !gameEnded) renderBoard();
  if (!started && !gameEnded) renderIntro();
};

function level(){ return LEVELS[currentLevelIndex]; }

function resetMazeState(){
  const pts = level().points;
  playerPos = { x: pts[0][0], y: pts[0][1] };
  playerTrail = [playerPos];
  dragging = false;
}

function renderIntro(){
  started = false;
  updateTexts();
  const root = document.getElementById("trajectory-maze-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-trajectory-maze-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-trajectory-maze-btn").onclick = startGame;
}

function renderCurrentScreen(){
  updateTexts();
  if (!started && !gameEnded) {
    renderIntro();
    return;
  }
  renderBoard();
}

function renderBoard(){
  started = true;
  updateTexts();

  const root = document.getElementById("trajectory-maze-root");
  const cfg = level();
  const pts = cfg.points;

  const pathD = pts.map((p,i)=> `${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(" ");
  const trailD = playerTrail.map((p,i)=> `${i===0?'M':'L'} ${p.x} ${p.y}`).join(" ");

  root.innerHTML = `
    <div class="trajectory-shell-card">
      <div class="memory-pairs-stats">
        <div class="game-pill">${tt("completed")} : ${mazesCompleted} / 6</div>
        <div class="game-pill game-pill-score">${tt("wallHits")} : ${wallHits}</div>
      </div>

      <div class="trajectory-board-wrap">
        <svg id="trajectory-maze-board" class="trajectory-board-svg" viewBox="0 0 620 340" preserveAspectRatio="xMidYMid meet">
          <rect x="10" y="10" width="600" height="320" rx="26" class="traj-board-bg"/>
          <path d="${pathD}" class="traj-maze-corridor" style="stroke-width:${cfg.width}px"/>
          <path d="${pathD}" class="traj-maze-centerline"/>
          <path d="${trailD}" class="traj-maze-trail"/>
          <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="18" class="traj-start-dot"/>
          <circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="18" class="traj-end-dot"/>
          <circle cx="${playerPos.x}" cy="${playerPos.y}" r="10" class="traj-player-dot"/>
        </svg>
      </div>

      <div class="traj-btns">
        <button class="btn-sec" id="trajectory-maze-reset-btn">${tt("reset")}</button>
      </div>

      <div class="game-feedback" id="trajectory-maze-feedback"></div>
    </div>
  `;

  const board = document.getElementById("trajectory-maze-board");
  board.addEventListener("pointerdown", onPointerDown);
  board.addEventListener("pointermove", onPointerMove);
  board.addEventListener("pointerup", onPointerUp);
  board.addEventListener("pointerleave", onPointerUp);

  document.getElementById("trajectory-maze-reset-btn").onclick = () => {
    resetMazeState();
    renderBoard();
  };
}

function svgPoint(evt){
  const svg = document.getElementById("trajectory-maze-board");
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const local = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: local.x, y: local.y };
}

function dist(a,b){
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

function distancePointToSegment(p, a, b){
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx*dx + dy*dy;
  if (!len2) return dist(p, a);
  let t = ((p.x-a.x)*dx + (p.y-a.y)*dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t*dx, y: a.y + t*dy };
  return dist(p, proj);
}

function distanceToPolyline(p, pts){
  let min = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = { x: pts[i-1][0], y: pts[i-1][1] };
    const b = { x: pts[i][0], y: pts[i][1] };
    min = Math.min(min, distancePointToSegment(p, a, b));
  }
  return min;
}

function onPointerDown(evt){
  const start = { x: level().points[0][0], y: level().points[0][1] };
  const p = svgPoint(evt);
  if (dist(p, start) <= 30 || dist(p, playerPos) <= 22) {
    dragging = true;
  }
}

function onPointerMove(evt){
  if (!dragging) return;
  const p = svgPoint(evt);
  const corridorDistance = distanceToPolyline(p, level().points);

  if (corridorDistance > level().width / 2) {
    wallHits += 1;
    dragging = false;
    resetMazeState();
    renderBoard();
    showFeedback(tt("fail"), "bad");
    return;
  }

  playerPos = p;
  playerTrail.push(p);
  renderBoard();

  const end = { x: level().points[level().points.length - 1][0], y: level().points[level().points.length - 1][1] };
  if (dist(playerPos, end) <= 22) {
    dragging = false;
    currentScore += 1;
    mazesCompleted += 1;
    renderBoard();
    showFeedback(tt("success"), "ok");

    setTimeout(() => {
      currentLevelIndex += 1;
      if (currentLevelIndex < LEVELS.length) {
        resetMazeState();
        renderBoard();
      } else {
        finishGame();
      }
    }, 800);
  }
}

function onPointerUp(){
  dragging = false;
}

function showFeedback(text, type){
  const fb = document.getElementById("trajectory-maze-feedback");
  if (fb) {
    fb.textContent = text;
    fb.className = `game-feedback ${type}`;
  }
}

async function startGame(){
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  wallHits = 0;
  mazesCompleted = 0;
  gameEnded = false;
  resetMazeState();

  const maxScore = 6;

  const session = await createSession(currentUser.uid, { source: "trajectory-maze" });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "trajectory_maze",
    category: "trajectory",
    maxScore,
    metadata: {
      rounds: 6,
      mode: "maze-guidance"
    }
  });
  currentResultId = exercise.resultId;

  renderBoard();
}

async function finishGame(){
  gameEnded = true;
  updateTexts();

  const maxScore = 6;
  const accuracyPercent = Math.round((mazesCompleted / maxScore) * 100);

  await completeExercise(currentUser.uid, currentResultId, {
    score: currentScore,
    maxScore,
    metadata: {
      rounds: 6,
      mazesCompleted,
      wallHits,
      accuracyPercent,
      mode: "maze-guidance"
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "trajectory-maze completed"
  });

  const root = document.getElementById("trajectory-maze-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${tt("completed")} : ${mazesCompleted}</p>
      <p>${tt("wallHits")} : ${wallHits}</p>
      <p>${tt("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${tt("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/trajectory'">${tt("returnTraj")}</button>
      </div>
    </div>
  `;
}

window.leaveGame = async function(){
  try {
    if (currentUser && currentResultId && !gameEnded) {
      await abandonExercise(currentUser.uid, currentResultId, {
        metadata: {
          leftEarly: true,
          round: currentLevelIndex + 1,
          mazesCompleted,
          wallHits
        }
      });
    }
    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "trajectory-maze abandoned"
      });
    }
  } catch (e) {
    console.error(e);
  }
  window.location.href = "/exercises/trajectory";
};

window.logout = function(){
  signOut(auth).then(() => window.location.href = "/");
};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  currentUser = user;
  updateTexts();
  renderIntro();
});