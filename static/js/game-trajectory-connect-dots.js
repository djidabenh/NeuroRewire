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
    title: "ربط النقاط",
    subtitle: "اربط النقاط المرقمة بالترتيب.",
    introTitle: "لعبة ربط النقاط",
    introText: "إبدأ من النقطة 1 ثم واصل إلى 2 ثم 3 وهكذا. كل مستوى يصبح أصعب.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    errors: "الأخطاء",
    segments: "الروابط الصحيحة",
    reset: "إعادة المحاولة",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnTraj: "العودة إلى Trajectoire",
    success: "ربط صحيح",
    fail: "خارج المسار"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Relier les points",
    subtitle: "Reliez les points numérotés dans l'ordre.",
    introTitle: "Jeu de points reliés",
    introText: "Commencez au point 1 puis reliez 2, 3, 4... Chaque niveau devient plus difficile.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    errors: "Erreurs",
    segments: "Segments corrects",
    reset: "Réessayer",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnTraj: "Retour Trajectoire",
    success: "Lien correct",
    fail: "Hors trajectoire"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Connect the dots",
    subtitle: "Connect the numbered dots in order.",
    introTitle: "Connect the dots game",
    introText: "Start from dot 1, then connect 2, 3, 4... Each level gets harder.",
    start: "Start",
    level: "Level",
    score: "Score",
    errors: "Errors",
    segments: "Correct segments",
    reset: "Try again",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnTraj: "Back to Trajectory",
    success: "Correct link",
    fail: "Out of path"
  }
};

const LEVELS = [
  { points: [[120,240],[220,130],[330,240],[450,120]], tolerance: 38 },
  { points: [[100,250],[180,120],[280,210],[360,90],[470,220]], tolerance: 34 },
  { points: [[90,250],[170,110],[250,230],[330,100],[410,210],[490,120]], tolerance: 30 },
  { points: [[85,255],[160,120],[220,235],[300,90],[380,235],[455,115],[520,220]], tolerance: 28 },
  { points: [[75,255],[145,115],[215,240],[280,95],[345,220],[420,105],[490,235],[540,135]], tolerance: 26 },
  { points: [[70,260],[130,120],[200,245],[260,100],[325,225],[390,110],[455,245],[520,135],[555,220]], tolerance: 24 }
];

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;

let currentPath = [];
let completedSegments = [];
let dragging = false;
let nextPointIndex = 1;
let totalErrors = 0;
let totalSegmentsCompleted = 0;
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

function getLevel(){ return LEVELS[currentLevelIndex]; }

function resetLevelState(){
  currentPath = [];
  completedSegments = [];
  dragging = false;
  nextPointIndex = 1;
}

function renderIntro(){
  started = false;
  updateTexts();
  const root = document.getElementById("trajectory-connect-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-trajectory-connect-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-trajectory-connect-btn").onclick = startGame;
}

function renderBoard(){
  started = true;
  updateTexts();
  const root = document.getElementById("trajectory-connect-root");
  const level = getLevel();
  const totalSegmentsThisLevel = level.points.length - 1;

  const completedSvg = completedSegments.map(seg => `<line x1="${seg[0][0]}" y1="${seg[0][1]}" x2="${seg[1][0]}" y2="${seg[1][1]}" class="traj-fixed-line"/>`).join("");
  const liveSvg = currentPath.length > 1
    ? `<polyline points="${currentPath.map(p => `${p.x},${p.y}`).join(" ")}" class="traj-live-line"/>`
    : "";

  root.innerHTML = `
    <div class="trajectory-shell-card">
      <div class="memory-pairs-stats">
        <div class="game-pill">${tt("segments")} : ${completedSegments.length} / ${totalSegmentsThisLevel}</div>
        <div class="game-pill game-pill-score">${tt("errors")} : ${totalErrors}</div>
      </div>

      <div class="trajectory-board-wrap">
        <svg id="trajectory-connect-board" class="trajectory-board-svg" viewBox="0 0 620 340" preserveAspectRatio="xMidYMid meet">
          <rect x="10" y="10" width="600" height="320" rx="26" class="traj-board-bg"/>
          ${completedSvg}
          ${liveSvg}
          ${level.points.map((p, i) => `
            <g transform="translate(${p[0]},${p[1]})">
              <circle r="${i === 0 ? 20 : 18}" class="traj-dot ${i < nextPointIndex ? 'done' : ''} ${i === nextPointIndex ? 'target' : ''}"/>
              <circle r="${i === nextPointIndex ? 28 : 0}" class="traj-pulse"/>
              <text class="traj-dot-label" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>
            </g>
          `).join("")}
        </svg>
      </div>

      <div class="traj-btns">
        <button class="btn-sec" id="trajectory-connect-reset-btn">${tt("reset")}</button>
      </div>

      <div class="game-feedback" id="trajectory-connect-feedback"></div>
    </div>
  `;

  const board = document.getElementById("trajectory-connect-board");
  board.addEventListener("pointerdown", onPointerDown);
  board.addEventListener("pointermove", onPointerMove);
  board.addEventListener("pointerup", onPointerUp);
  board.addEventListener("pointerleave", onPointerUp);

  document.getElementById("trajectory-connect-reset-btn").onclick = () => {
    resetLevelState();
    renderBoard();
  };
}

function svgPoint(evt){
  const svg = document.getElementById("trajectory-connect-board");
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const local = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: local.x, y: local.y };
}

function dist(a,b){
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
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

function onPointerDown(evt){
  const level = getLevel();
  const start = { x: level.points[nextPointIndex - 1][0], y: level.points[nextPointIndex - 1][1] };
  const p = svgPoint(evt);
  if (dist(p, start) <= level.tolerance) {
    dragging = true;
    currentPath = [start, p];
  }
}

function onPointerMove(evt){
  if (!dragging) return;
  const level = getLevel();
  const p = svgPoint(evt);
  const a = { x: level.points[nextPointIndex - 1][0], y: level.points[nextPointIndex - 1][1] };
  const b = { x: level.points[nextPointIndex][0], y: level.points[nextPointIndex][1] };
  currentPath.push(p);

  if (distancePointToSegment(p, a, b) > level.tolerance) {
    totalErrors += 1;
    dragging = false;
    currentPath = [];
    renderBoard();
    showFeedback(tt("fail"), "bad");
    return;
  }

  renderBoard();
}

function onPointerUp(evt){
  if (!dragging) return;
  dragging = false;

  const level = getLevel();
  const p = svgPoint(evt);
  const target = { x: level.points[nextPointIndex][0], y: level.points[nextPointIndex][1] };
  const start = { x: level.points[nextPointIndex - 1][0], y: level.points[nextPointIndex - 1][1] };

  if (dist(p, target) <= level.tolerance) {
    completedSegments.push([[start.x,start.y],[target.x,target.y]]);
    currentScore += 1;
    totalSegmentsCompleted += 1;
    nextPointIndex += 1;
    currentPath = [];
    renderBoard();
    showFeedback(tt("success"), "ok");

    if (nextPointIndex >= level.points.length) {
      setTimeout(() => {
        currentLevelIndex += 1;
        if (currentLevelIndex < LEVELS.length) {
          resetLevelState();
          renderBoard();
        } else {
          finishGame();
        }
      }, 700);
    }
  } else {
    totalErrors += 1;
    currentPath = [];
    renderBoard();
    showFeedback(tt("fail"), "bad");
  }
}

function showFeedback(text, type){
  const fb = document.getElementById("trajectory-connect-feedback");
  if (fb) {
    fb.textContent = text;
    fb.className = `game-feedback ${type}`;
  }
}

async function startGame(){
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  totalErrors = 0;
  totalSegmentsCompleted = 0;
  gameEnded = false;
  resetLevelState();

  const maxScore = LEVELS.reduce((sum, l) => sum + (l.points.length - 1), 0);

  const session = await createSession(currentUser.uid, { source: "trajectory-connect-dots" });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "trajectory_connect_dots",
    category: "trajectory",
    maxScore,
    metadata: {
      rounds: 6,
      mode: "connect-dots-sequence"
    }
  });
  currentResultId = exercise.resultId;

  renderBoard();
}

async function finishGame(){
  gameEnded = true;
  updateTexts();

  const maxScore = LEVELS.reduce((sum, l) => sum + (l.points.length - 1), 0);
  const accuracyPercent = maxScore > 0 ? Math.round((totalSegmentsCompleted / maxScore) * 100) : 0;

  await completeExercise(currentUser.uid, currentResultId, {
    score: currentScore,
    maxScore,
    metadata: {
      rounds: 6,
      segmentsCompleted: totalSegmentsCompleted,
      errors: totalErrors,
      accuracyPercent,
      mode: "connect-dots-sequence"
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "trajectory-connect-dots completed"
  });

  const root = document.getElementById("trajectory-connect-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${tt("segments")} : ${totalSegmentsCompleted}</p>
      <p>${tt("errors")} : ${totalErrors}</p>
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
          segmentsCompleted: totalSegmentsCompleted,
          errors: totalErrors
        }
      });
    }
    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "trajectory-connect-dots abandoned"
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