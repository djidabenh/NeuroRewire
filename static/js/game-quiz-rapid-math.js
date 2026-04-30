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
    title: "حساب سريع",
    subtitle: "عمليات بسيطة ضد الوقت.",
    introTitle: "لعبة الحساب السريع",
    introText: "حل العمليات بسرعة قبل انتهاء الوقت. كل مستوى يصبح أصعب قليلاً.",
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
    returnQuiz: "العودة إلى Quiz & Rapidité"
  },
  fr: {
    sidebarSubtitle: "Rééducation",
    navDashboard: "Tableau de bord",
    navGames: "Exercices",
    navProgress: "Progression",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    back: "Retour",
    title: "Calcul rapide",
    subtitle: "Opérations simples contre la montre.",
    introTitle: "Jeu de calcul rapide",
    introText: "Résolvez les opérations rapidement avant la fin du temps. Chaque niveau devient un peu plus difficile.",
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
    returnQuiz: "Retour Quiz & Rapidité"
  },
  en: {
    sidebarSubtitle: "Rehabilitation",
    navDashboard: "Dashboard",
    navGames: "Exercises",
    navProgress: "Progress",
    navSettings: "Settings",
    logout: "Sign out",
    back: "Back",
    title: "Rapid math",
    subtitle: "Simple operations against the clock.",
    introTitle: "Rapid math game",
    introText: "Solve the operations quickly before time runs out. Each level becomes a bit harder.",
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
    returnQuiz: "Back to Quiz & Rapidité"
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
let wrongAnswers = 0;
let currentQuestionIndex = 0;
let currentQuestion = null;
let timer = null;
let timeLeft = 0;
let gameEnded = false;

function tt(k) {
  return T[lang][k];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
  let text = "";
  let answer = 0;

  if (mode === 1) {
    const a = rand(1, 9), b = rand(1, 9);
    text = `${a} + ${b}`;
    answer = a + b;
  } else if (mode === 2) {
    const a = rand(5, 20), b = rand(1, 9);
    text = `${a} - ${b}`;
    answer = a - b;
  } else if (mode === 3) {
    const a = rand(2, 9), b = rand(2, 6);
    text = `${a} × ${b}`;
    answer = a * b;
  } else {
    const a = rand(5, 18), b = rand(1, 9), c = rand(1, 9);
    text = `${a} + ${b} - ${c}`;
    answer = a + b - c;
  }

  const options = new Set([answer]);
  while (options.size < 4) {
    const candidate = answer + rand(-6, 6);
    options.add(candidate === answer ? answer + 1 : candidate);
  }

  return {
    text,
    answer,
    options: shuffle([...options])
  };
}

function renderIntro() {
  const root = document.getElementById("quiz-math-root");
  root.innerHTML = `
    <div class="intro-c quiz-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-quiz-math-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-quiz-math-btn").onclick = startGame;
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
  const root = document.getElementById("quiz-math-root");
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

      <div class="quiz-math-card">
        <div class="quiz-math-expression">${currentQuestion.text}</div>
      </div>

      <div class="quiz-options-grid">
        ${currentQuestion.options.map((opt, idx) => `
          <button class="quiz-option-btn" data-index="${idx}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
          </button>
        `).join("")}
      </div>

      <div class="game-feedback" id="quiz-math-feedback"></div>
    </div>
  `;

  document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.onclick = () => answerQuestion(Number(btn.dataset.index));
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
  const fb = document.getElementById("quiz-math-feedback");
  if (fb) {
    fb.textContent = text;
    fb.className = `game-feedback ${type}`;
  }
  document.querySelectorAll(".quiz-option-btn").forEach((b) => {
    b.disabled = true;
  });
}

function answerQuestion(index) {
  clearInterval(timer);
  const chosen = currentQuestion.options[index];

  if (chosen === currentQuestion.answer) {
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

  const session = await createSession(currentUser.uid, { source: "quiz-rapid-math" });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "quiz_rapid_math",
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
      questionsShown: maxScore,
      correctAnswers: currentScore,
      wrongAnswers,
      accuracyPercent,
      timedMode: true
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "quiz-rapid-math completed"
  });

  const root = document.getElementById("quiz-math-root");
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
        notes: "quiz-rapid-math abandoned"
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