import { auth } from "/static/js/firebase-config.js";
import { logoutEverywhere } from "/static/js/auth-session.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createSession, completeSession, cancelSession } from "/static/js/session-service.js";
import { startExercise, completeExercise, abandonExercise } from "/static/js/exercise-service.js";

const T = {
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
    title: "رسم الأشكال",
    subtitle: "ارسم الشكل المطلوب فوق المسار المنقط.",
    introTitle: "لعبة رسم الأشكال",
    introText: "ارسم الشكل الظاهر أمامك مثل الدائرة أو المربع أو المثلث. كل مستوى يصبح أدق.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    errors: "الأخطاء",
    reset: "إعادة المحاولة",
    success: "شكل صحيح",
    fail: "الرسم غير مكتمل",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnTraj: "العودة إلى Trajectoire",
    shapes: "أشكال ناجحة",
    targetShape: "الشكل المطلوب"
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
    title: "Tracer les formes",
    subtitle: "Tracez la forme demandée sur le guide pointillé.",
    introTitle: "Jeu des formes géométriques",
    introText: "Tracez la forme affichée comme le cercle, le carré ou le triangle. Chaque niveau devient plus précis.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    errors: "Erreurs",
    reset: "Réessayer",
    success: "Forme correcte",
    fail: "Tracé incomplet",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnTraj: "Retour Trajectoire",
    shapes: "Formes réussies",
    targetShape: "Forme demandée"
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
    title: "Draw shapes",
    subtitle: "Draw the requested shape on the dotted guide.",
    introTitle: "Geometric shape game",
    introText: "Draw the shown shape such as a circle, square or triangle. Each level becomes more precise.",
    start: "Start",
    level: "Level",
    score: "Score",
    errors: "Errors",
    reset: "Try again",
    success: "Correct shape",
    fail: "Incomplete drawing",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnTraj: "Back to Trajectory",
    shapes: "Successful shapes",
    targetShape: "Target shape"
  }
};

// Progression de difficulté :
// Niveau 1 : cercle, grande tolérance 28px, couverture facile  → très facile
// Niveau 2 : carré, tolérance 26px
// Niveau 3 : rectangle, tolérance 22px
// Niveau 4 : triangle, tolérance 20px                         → modéré
// Niveau 5 : losange (diamant), tolérance 17px               → difficile
// Niveau 6 : cercle strict, tolérance 13px, couverture max   → très difficile
// Progression: formes complexes, tolérance réduite, countdown
const LEVELS = [
  { type: "circle",    timeLimitSec: 18,  tolerance: 28, coverageRequired: 280 },
  { type: "square",    timeLimitSec: 16, tolerance: 24, coverageRequired: 290 },
  { type: "rectangle", timeLimitSec: 14, tolerance: 20, coverageRequired: 295 },
  { type: "triangle",  timeLimitSec: 11, tolerance: 17, coverageRequired: 290 },
  { type: "diamond",   timeLimitSec: 8, tolerance: 14, coverageRequired: 295 },
  { type: "circle",    timeLimitSec: 6, tolerance: 10, coverageRequired: 350 }
];

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;
let failedAttempts = 0;
let successfulShapes = 0;
let drawing = false;
let _t = null;
let _tLeft = 0;
let tracePoints = [];
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

function shapeLabel(type){
  const map = {
    ar: {
      circle: "دائرة",
      square: "مربع",
      triangle: "مثلث",
      rectangle: "مستطيل",
      diamond: "معين"
    },
    fr: {
      circle: "Cercle",
      square: "Carré",
      triangle: "Triangle",
      rectangle: "Rectangle",
      diamond: "Losange"
    },
    en: {
      circle: "Circle",
      square: "Square",
      triangle: "Triangle",
      rectangle: "Rectangle",
      diamond: "Diamond"
    }
  };
  return map[currentLang][type];
}

function getGuideShape(type){
  if (type === "circle") {
    return {
      svg: `<circle cx="310" cy="170" r="96" class="traj-circle-guide"/>`,
      evaluator: evaluateCircle
    };
  }

  if (type === "square") {
    return {
      svg: `<rect x="214" y="74" width="192" height="192" rx="8" class="traj-shape-guide"/>`,
      evaluator: (pts, tol) => evaluatePolygon(pts, [[214,74],[406,74],[406,266],[214,266],[214,74]], tol)
    };
  }

  if (type === "triangle") {
    return {
      svg: `<polygon points="310,66 438,270 182,270" class="traj-shape-guide"/>`,
      evaluator: (pts, tol) => evaluatePolygon(pts, [[310,66],[438,270],[182,270],[310,66]], tol)
    };
  }

  if (type === "rectangle") {
    return {
      svg: `<rect x="180" y="95" width="260" height="150" rx="8" class="traj-shape-guide"/>`,
      evaluator: (pts, tol) => evaluatePolygon(pts, [[180,95],[440,95],[440,245],[180,245],[180,95]], tol)
    };
  }

  return {
    svg: `<polygon points="310,60 450,170 310,280 170,170" class="traj-shape-guide"/>`,
    evaluator: (pts, tol) => evaluatePolygon(pts, [[310,60],[450,170],[310,280],[170,170],[310,60]], tol)
  };
}

function renderIntro(){
  started = false;
  updateTexts();
  const root = document.getElementById("trajectory-shapes-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-trajectory-shapes-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-trajectory-shapes-btn").onclick = startGame;
}

function _startT(sec) {
  clearInterval(_t);
  _tLeft = sec;
  _t = setInterval(() => {
    _tLeft--;
    const el = document.getElementById("shapes-t-val");
    if (el) el.textContent = _tLeft;
    const pill = document.getElementById("shapes-t-pill");
    if (pill && _tLeft <= 5) pill.style.color = "var(--danger, #e74c3c)";
    if (_tLeft <= 0) {
      clearInterval(_t);
      _tLeft = 0;
      failedAttempts++; currentLevelIndex++;
      tracePoints = [];
      if (currentLevelIndex < LEVELS.length) renderBoard();
      else finishGame();
    }
  }, 1000);
}
function _stopT() { clearInterval(_t); _tLeft = 0; }

function renderCurrentScreen(){
  updateTexts();
  if (!started && !gameEnded) {
    renderIntro();
    return;
  }
  renderBoard();
}

function renderBoard(){
  const cfg = LEVELS[currentLevelIndex];
  if (cfg && cfg.timeLimitSec > 0 && _tLeft <= 0) _startT(cfg.timeLimitSec);
  started = true;
  updateTexts();

  const root = document.getElementById("trajectory-shapes-root");
  const level = LEVELS[currentLevelIndex];
  const guide = getGuideShape(level.type);
  const polyline = tracePoints.length > 1 ? tracePoints.map(p => `${p.x},${p.y}`).join(" ") : "";

  root.innerHTML = `
    <div class="trajectory-shell-card">
      <div class="memory-pairs-stats">
        <div class="game-pill">${tt("shapes")} : ${successfulShapes} / ${LEVELS.length}</div>
        <div class="game-pill game-pill-score">${tt("errors")} : ${failedAttempts}</div>
      </div>

      <div class="trajectory-shape-target">${tt("targetShape")} : <strong>${shapeLabel(level.type)}</strong></div>

      <div class="trajectory-board-wrap">
        <svg id="trajectory-shapes-board" class="trajectory-board-svg" viewBox="0 0 620 340" preserveAspectRatio="xMidYMid meet">
          <rect x="10" y="10" width="600" height="320" rx="26" class="traj-board-bg"/>
          ${guide.svg}
          ${polyline ? `<polyline points="${polyline}" class="traj-live-line"/>` : ""}
        </svg>
      </div>

      <div class="traj-btns">
        <button class="btn-sec" id="trajectory-shapes-reset-btn">${tt("reset")}</button>
      </div>

      <div class="game-feedback" id="trajectory-shapes-feedback"></div>
    </div>
  `;

  const board = document.getElementById("trajectory-shapes-board");
  board.addEventListener("pointerdown", onPointerDown);
  board.addEventListener("pointermove", onPointerMove);
  board.addEventListener("pointerup", onPointerUp);
  board.addEventListener("pointerleave", onPointerUp);

  document.getElementById("trajectory-shapes-reset-btn").onclick = () => {
    tracePoints = [];
    renderBoard();
  };
}

function svgPoint(evt){
  const svg = document.getElementById("trajectory-shapes-board");
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

function normalizeAngle(a){
  while (a < 0) a += Math.PI * 2;
  while (a >= Math.PI * 2) a -= Math.PI * 2;
  return a;
}

function evaluateCircle(points, tolerance, coverageRequired){
  if (points.length < 30) return false;

  const center = { x: 310, y: 170 };
  const radius = 96;

  const distances = points.map(p => Math.hypot(p.x - center.x, p.y - center.y));
  const avgDelta = distances.reduce((s, d) => s + Math.abs(d - radius), 0) / distances.length;

  const angles = points
    .map(p => normalizeAngle(Math.atan2(p.y - center.y, p.x - center.x)))
    .sort((a, b) => a - b);

  let maxGap = 0;
  for (let i = 1; i < angles.length; i++) {
    maxGap = Math.max(maxGap, angles[i] - angles[i - 1]);
  }
  maxGap = Math.max(maxGap, (angles[0] + Math.PI * 2) - angles[angles.length - 1]);

  const coverageDeg = Math.round((Math.PI * 2 - maxGap) * 180 / Math.PI);
  const startEnd = dist(points[0], points[points.length - 1]);

  return avgDelta <= tolerance && coverageDeg >= coverageRequired && startEnd <= 42;
}

function pointToSegmentDistance(p, a, b){
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (!len2) return dist(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return dist(p, proj);
}

function evaluatePolygon(points, guidePoints, tolerance){
  if (points.length < 20) return false;

  let closeCount = 0;
  for (const p of points) {
    let minDist = Infinity;
    for (let i = 1; i < guidePoints.length; i++) {
      const a = { x: guidePoints[i - 1][0], y: guidePoints[i - 1][1] };
      const b = { x: guidePoints[i][0], y: guidePoints[i][1] };
      minDist = Math.min(minDist, pointToSegmentDistance(p, a, b));
    }
    if (minDist <= tolerance) closeCount += 1;
  }

  const coverage = (closeCount / points.length) * 100;
  const startEnd = dist(points[0], points[points.length - 1]);

  return coverage >= 72 && startEnd <= 48;
}

function onPointerDown(evt){
  drawing = true;
  tracePoints = [svgPoint(evt)];
  renderBoard();
}

function onPointerMove(evt){
  if (!drawing) return;
  tracePoints.push(svgPoint(evt));
  renderBoard();
}

function onPointerUp(){
  if (!drawing) return;
  drawing = false;

  const level = LEVELS[currentLevelIndex];
  const guide = getGuideShape(level.type);

  const ok = level.type === "circle"
    ? guide.evaluator(tracePoints, level.tolerance, level.coverageRequired)
    : guide.evaluator(tracePoints, level.tolerance);

  if (ok) {
    currentScore += 1;
    successfulShapes += 1;
    showFeedback(tt("success"), "ok");

    setTimeout(() => {
      _stopT(); _tLeft = 0;
      currentLevelIndex += 1;
      tracePoints = [];
      if (currentLevelIndex < LEVELS.length) {
        renderBoard();
      } else {
        finishGame();
      }
    }, 700);
  } else {
    failedAttempts += 1;
    showFeedback(tt("fail"), "bad");
  }
}

function showFeedback(text, type){
  const fb = document.getElementById("trajectory-shapes-feedback");
  if (fb) {
    fb.textContent = text;
    fb.className = `game-feedback ${type}`;
  }
}

async function startGame(){
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  gameEnded = false;
  failedAttempts = 0;
  successfulShapes = 0;
  tracePoints = [];

  const maxScore = LEVELS.length;

  const session = await createSession(currentUser.uid, { source: "trajectory-draw-shapes" });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "trajectory_draw_shapes",
    category: "trajectory",
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      mode: "shape-tracing"
    }
  });
  currentResultId = exercise.resultId;

  renderBoard();
}

async function finishGame(){
  gameEnded = true;
  updateTexts();

  const maxScore = LEVELS.length;
  const accuracyPercent = Math.round((successfulShapes / maxScore) * 100);

  await completeExercise(currentUser.uid, currentResultId, {
    score: currentScore,
    maxScore,
    metadata: {
      rounds: LEVELS.length,
      successfulShapes,
      errors: failedAttempts,
      accuracyPercent,
      mode: "shape-tracing"
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "trajectory-draw-shapes completed"
  });

  const root = document.getElementById("trajectory-shapes-root");
  root.innerHTML = `
    <div class="intro-c trajectory-intro-card">
      <h3>${tt("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${tt("shapes")} : ${successfulShapes}</p>
      <p>${tt("errors")} : ${failedAttempts}</p>
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
          successfulShapes,
          errors: failedAttempts
        }
      });
    }
    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "trajectory-draw-shapes abandoned"
      });
    }
  } catch (e) {
    console.error(e);
  }
  window.location.href = "/exercises/trajectory";
};

window.logout = logoutEverywhere;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  currentUser = user;
  updateTexts();
  renderIntro();
});
