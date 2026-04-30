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
    title: "مقارنة سريعة",
    subtitle: "أيّهما أكبر؟ أجب بسرعة!",
    introTitle: "لعبة المقارنة السريعة",
    introText: "اختر بسرعة العدد أو التعبير الأكبر. تزداد الصعوبة حسب المستوى.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    correct: "صحيح",
    wrong: "خطأ",
    timeout: "انتهى الوقت",
    mistakes: "الأخطاء",
    timer: "الوقت",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnQuiz: "العودة إلى Quiz & Rapidité",
    prompt: "أيّهما أكبر؟"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Comparaison rapide",
    subtitle: "Lequel est plus grand ? Répondez vite !",
    introTitle: "Jeu de comparaison rapide",
    introText: "Choisissez rapidement le nombre ou l’expression la plus grande. La difficulté augmente selon le niveau.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    correct: "Correct",
    wrong: "Incorrect",
    timeout: "Temps écoulé",
    mistakes: "Erreurs",
    timer: "Temps",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnQuiz: "Retour Quiz & Rapidité",
    prompt: "Lequel est plus grand ?"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Rapid comparison",
    subtitle: "Which one is bigger? Answer fast!",
    introTitle: "Rapid compare game",
    introText: "Quickly choose the larger number or expression. Difficulty increases by level.",
    start: "Start",
    level: "Level",
    score: "Score",
    correct: "Correct",
    wrong: "Wrong",
    timeout: "Time up",
    mistakes: "Mistakes",
    timer: "Time",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnQuiz: "Back to Quiz & Rapidité",
    prompt: "Which one is bigger?"
  }
};

const LEVELS = [
  { questions: 5, seconds: 20, mode: 1 },
  { questions: 5, seconds: 20, mode: 1 },
  { questions: 5, seconds: 20, mode: 2 },
  { questions: 5, seconds: 20, mode: 2 },
  { questions: 5, seconds: 20, mode: 3 },
  { questions: 5, seconds: 20, mode: 4 }
];

let lang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;
let wrongAnswers = 0;
let currentQuestionIndex = 0;
let currentQuestion = null;
let timer = null;
let timeLeft = 0;

function tt(k) {
  return T[lang][k];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateTexts() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.getElementById("sidebar-subtitle").textContent = tt("sidebarSubtitle");
  document.getElementById("nav-dashboard").textContent = tt("navDashboard");
  document.getElementById("nav-games").textContent = tt("navGames");
  document.getElementById("nav-progress").textContent = tt("navProgress");
  document.getElementById("nav-settings").textContent = tt("navSettings");
  document.getElementById("logout-text").textContent = tt("logout");
  document.getElementById("back-text").textContent = tt("back");
  document.getElementById("game-title").textContent = tt("title");
  document.getElementById("game-subtitle").textContent = tt("subtitle");
  document.getElementById("game-round-label").textContent = `${tt("level")} ${Math.min(currentLevelIndex + 1, 6)} / 6`;
  document.getElementById("game-score-label").textContent = `${tt("score")} : ${currentScore}`;
  document.querySelectorAll(".slp").forEach((b) => b.classList.remove("on"));
  const active = document.getElementById(`lang-${lang}`);
  if (active) active.classList.add("on");
}

window.setGameLang = function setGameLang(newLang) {
  localStorage.setItem("nrw_lang", newLang);
  lang = newLang;
  updateTexts();
  renderCurrentScreen();
};

function generateQuestion(mode) {
  if (mode === 1) {
    const a = rand(2, 40);
    const b = rand(2, 40);
    return {
      left: `${a}`,
      right: `${b}`,
      answer: a >= b ? "left" : "right"
    };
  }

  if (mode === 2) {
    const a1 = rand(2, 20), a2 = rand(2, 20);
    const b1 = rand(2, 20), b2 = rand(2, 20);
    const leftVal = a1 + a2;
    const rightVal = b1 + b2;
    return {
      left: `${a1} + ${a2}`,
      right: `${b1} + ${b2}`,
      answer: leftVal >= rightVal ? "left" : "right"
    };
  }

  if (mode === 3) {
    const a1 = rand(10, 40), a2 = rand(1, 9);
    const b1 = rand(10, 40), b2 = rand(1, 9);
    const leftVal = a1 - a2;
    const rightVal = b1 - b2;
    return {
      left: `${a1} - ${a2}`,
      right: `${b1} - ${b2}`,
      answer: leftVal >= rightVal ? "left" : "right"
    };
  }

  const makeExpr = () => {
    const x = rand(2, 12);
    const y = rand(2, 9);
    const z = rand(1, 9);
    const val = x + y - z;
    return { txt: `${x} + ${y} - ${z}`, val };
  };

  const l = makeExpr();
  const r = makeExpr();

  return {
    left: l.txt,
    right: r.txt,
    answer: l.val >= r.val ? "left" : "right"
  };
}

function renderIntro() {
  const root = document.getElementById("quiz-compare-root");
  root.innerHTML = `
    <div class="intro-c quiz-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-quiz-compare-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-quiz-compare-btn").onclick = startGame;
}

function renderCurrentScreen() {
  updateTexts();

  if (!currentQuestion && !gameEnded) {
    renderIntro();
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  updateTexts();

  const root = document.getElementById("quiz-compare-root");
  const level = LEVELS[currentLevelIndex];
  const progressPercent = Math.max(0, (timeLeft / level.seconds) * 100);

  root.innerHTML = `
    <div class="quiz-shell-card">
      <div class="quiz-meta-row">
        <div class="quiz-mini-badge">${tt("mistakes")} : ${wrongAnswers}</div>
        <div class="quiz-mini-badge">${currentQuestionIndex + 1} / ${level.questions}</div>
      </div>

      <div class="quiz-timer-wrap">
        <div class="quiz-timer-label">${tt("timer")} : ${timeLeft}</div>
        <div class="quiz-timer-bar"><span style="width:${progressPercent}%"></span></div>
      </div>

      <div class="quiz-compare-prompt">${tt("prompt")}</div>

      <div class="quiz-compare-grid">
        <button class="quiz-compare-card" data-side="left">${currentQuestion.left}</button>
        <div class="quiz-vs-badge">VS</div>
        <button class="quiz-compare-card" data-side="right">${currentQuestion.right}</button>
      </div>

      <div class="game-feedback" id="quiz-compare-feedback"></div>
    </div>
  `;

  document.querySelectorAll(".quiz-compare-card").forEach((btn) => {
    btn.onclick = () => answerQuestion(btn.dataset.side);
  });
}

function startTimer() {
  clearInterval(timer);
  const level = LEVELS[currentLevelIndex];
  timeLeft = level.seconds;
  renderQuestion();

  timer = setInterval(() => {
    timeLeft -= 1;
    renderQuestion();

    if (timeLeft <= 0) {
      clearInterval(timer);
      wrongAnswers += 1;
      showFeedback(tt("timeout"), "bad");
      setTimeout(nextQuestionOrLevel, 600);
    }
  }, 1000);
}

function showFeedback(text, type) {
  const fb = document.getElementById("quiz-compare-feedback");
  if (fb) {
    fb.textContent = text;
    fb.className = `game-feedback ${type}`;
  }
  document.querySelectorAll(".quiz-compare-card").forEach((b) => {
    b.disabled = true;
  });
}

function answerQuestion(side) {
  clearInterval(timer);

  if (side === currentQuestion.answer) {
    currentScore += 1;
    showFeedback(tt("correct"), "ok");
  } else {
    wrongAnswers += 1;
    showFeedback(tt("wrong"), "bad");
  }

  setTimeout(nextQuestionOrLevel, 600);
}

function nextQuestionOrLevel() {
  const level = LEVELS[currentLevelIndex];
  currentQuestionIndex += 1;

  if (currentQuestionIndex < level.questions) {
    currentQuestion = generateQuestion(level.mode);
    startTimer();
  } else {
    currentLevelIndex += 1;

    if (currentLevelIndex < 6) {
      currentQuestionIndex = 0;
      currentQuestion = generateQuestion(LEVELS[currentLevelIndex].mode);
      startTimer();
    } else {
      finishGame();
    }
  }
}

async function startGame() {
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentQuestionIndex = 0;
  currentScore = 0;
  wrongAnswers = 0;
  gameEnded = false;
  currentQuestion = generateQuestion(LEVELS[0].mode);

  const maxScore = LEVELS.reduce((sum, l) => sum + l.questions, 0);

  const session = await createSession(currentUser.uid, { source: "quiz-rapid-compare" });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "quiz_rapid_compare",
    category: "quiz",
    maxScore,
    metadata: { rounds: 6, timedMode: true }
  });
  currentResultId = exercise.resultId;

  startTimer();
}

async function finishGame() {
  gameEnded = true;
  clearInterval(timer);

  const maxScore = LEVELS.reduce((sum, l) => sum + l.questions, 0);
  const accuracyPercent = Math.round((currentScore / maxScore) * 100);

  await completeExercise(currentUser.uid, currentResultId, {
    score: currentScore,
    maxScore,
    metadata: {
      rounds: 6,
      comparisonsShown: maxScore,
      correctAnswers: currentScore,
      wrongAnswers,
      accuracyPercent,
      timedMode: true
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "quiz-rapid-compare completed"
  });

  const root = document.getElementById("quiz-compare-root");
  root.innerHTML = `
    <div class="intro-c quiz-intro-card">
      <h3>${tt("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${tt("mistakes")} : ${wrongAnswers}</p>
      <p>${tt("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${tt("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/quiz'">${tt("returnQuiz")}</button>
      </div>
    </div>
  `;
}

window.leaveGame = async function leaveGame() {
  clearInterval(timer);
  try {
    if (currentUser && currentResultId && !gameEnded) {
      await abandonExercise(currentUser.uid, currentResultId, {
        metadata: {
          leftEarly: true,
          round: currentLevelIndex + 1,
          correctAnswers: currentScore,
          wrongAnswers
        }
      });
    }
    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "quiz-rapid-compare abandoned"
      });
    }
  } catch (e) {
    console.error(e);
  }
  window.location.href = "/exercises/quiz";
};

window.logout = function logout() {
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