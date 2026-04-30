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
    title: "أسئلة عامة",
    subtitle: "أسئلة عن الحياة اليومية.",
    introTitle: "لعبة الأسئلة العامة",
    introText: "أجب على أسئلة متنوعة من الحياة اليومية. في كل مستوى تظهر أسئلة جديدة لتجنب التكرار.",
    start: "إبدأ",
    level: "المستوى",
    score: "النتيجة",
    question: "السؤال",
    correct: "إجابة صحيحة",
    wrong: "إجابة خاطئة",
    correctAnswers: "الإجابات الصحيحة",
    wrongAnswers: "الأخطاء",
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
    title: "Questions générales",
    subtitle: "Questions sur la vie quotidienne.",
    introTitle: "Jeu des questions générales",
    introText: "Répondez à des questions variées de la vie quotidienne. Chaque niveau utilise des questions différentes pour éviter la répétition.",
    start: "Commencer",
    level: "Niveau",
    score: "Score",
    question: "Question",
    correct: "Bonne réponse",
    wrong: "Mauvaise réponse",
    correctAnswers: "Bonnes réponses",
    wrongAnswers: "Erreurs",
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
    title: "General questions",
    subtitle: "Daily life questions.",
    introTitle: "General question game",
    introText: "Answer varied daily life questions. Each level uses different questions to reduce repetition.",
    start: "Start",
    level: "Level",
    score: "Score",
    question: "Question",
    correct: "Correct answer",
    wrong: "Wrong answer",
    correctAnswers: "Correct answers",
    wrongAnswers: "Mistakes",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnQuiz: "Back to Quiz & Rapidité"
  }
};

const LEVELS = [4, 4, 4, 4, 4, 4];

const QUESTION_BANK = {
  easy: [
    {
      q: {
        fr: "Quelle pièce utilise-t-on pour dormir ?",
        ar: "في أي غرفة ننام؟",
        en: "Which room do we use for sleeping?"
      },
      choices: {
        fr: ["Cuisine", "Chambre", "Garage", "Jardin"],
        ar: ["المطبخ", "غرفة النوم", "المرأب", "الحديقة"],
        en: ["Kitchen", "Bedroom", "Garage", "Garden"]
      },
      answer: 1
    },
    {
      q: {
        fr: "Que boit-on généralement dans un verre ?",
        ar: "ماذا نشرب عادة في الكأس؟",
        en: "What do we usually drink from a glass?"
      },
      choices: {
        fr: ["Eau", "Chaussure", "Oreiller", "Livre"],
        ar: ["الماء", "حذاء", "وسادة", "كتاب"],
        en: ["Water", "Shoe", "Pillow", "Book"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet montre l’heure ?",
        ar: "أي شيء يبين الوقت؟",
        en: "Which object shows time?"
      },
      choices: {
        fr: ["Horloge", "Cuillère", "Serviette", "Savon"],
        ar: ["ساعة", "ملعقة", "منشفة", "صابون"],
        en: ["Clock", "Spoon", "Towel", "Soap"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel fruit est jaune le plus souvent ?",
        ar: "أي فاكهة تكون صفراء غالبًا؟",
        en: "Which fruit is usually yellow?"
      },
      choices: {
        fr: ["Banane", "Raisin", "Pomme", "Fraise"],
        ar: ["موز", "عنب", "تفاح", "فراولة"],
        en: ["Banana", "Grape", "Apple", "Strawberry"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Où regarde-t-on la télévision ?",
        ar: "أين نشاهد التلفاز؟",
        en: "Where do we usually watch TV?"
      },
      choices: {
        fr: ["Salon", "Douche", "Cuisine", "Jardin"],
        ar: ["الصالون", "الدش", "المطبخ", "الحديقة"],
        en: ["Living room", "Shower", "Kitchen", "Garden"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Combien de jours y a-t-il dans une semaine ?",
        ar: "كم عدد أيام الأسبوع؟",
        en: "How many days are there in a week?"
      },
      choices: {
        fr: ["5", "6", "7", "8"],
        ar: ["5", "6", "7", "8"],
        en: ["5", "6", "7", "8"]
      },
      answer: 2
    },
    {
      q: {
        fr: "Que met-on aux pieds pour marcher dehors ?",
        ar: "ماذا نلبس في القدمين للمشي خارجًا؟",
        en: "What do we wear on our feet to walk outside?"
      },
      choices: {
        fr: ["Chaussures", "Assiettes", "Oreillers", "Cuillères"],
        ar: ["أحذية", "أطباق", "وسائد", "ملاعق"],
        en: ["Shoes", "Plates", "Pillows", "Spoons"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quelle couleur a souvent l’herbe ?",
        ar: "ما هو لون العشب غالبًا؟",
        en: "What color is grass usually?"
      },
      choices: {
        fr: ["Bleu", "Vert", "Noir", "Rose"],
        ar: ["أزرق", "أخضر", "أسود", "وردي"],
        en: ["Blue", "Green", "Black", "Pink"]
      },
      answer: 1
    },
    {
      q: {
        fr: "Que fait-on avec un livre ?",
        ar: "ماذا نفعل بالكتاب؟",
        en: "What do we do with a book?"
      },
      choices: {
        fr: ["On le lit", "On le boit", "On le lave", "On le mange"],
        ar: ["نقرأه", "نشربه", "نغسله", "نأكله"],
        en: ["Read it", "Drink it", "Wash it", "Eat it"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel repas prend-on souvent le matin ?",
        ar: "ما هي الوجبة التي نتناولها غالبًا صباحًا؟",
        en: "Which meal do we usually have in the morning?"
      },
      choices: {
        fr: ["Petit-déjeuner", "Dîner", "Souper tardif", "Dessert"],
        ar: ["فطور", "عشاء", "وجبة ليلية", "تحلية"],
        en: ["Breakfast", "Dinner", "Late meal", "Dessert"]
      },
      answer: 0
    }
  ],

  medium: [
    {
      q: {
        fr: "Quel objet utilise-t-on pour sécher le corps après la douche ?",
        ar: "بماذا نجفف الجسم بعد الاستحمام؟",
        en: "What do we use to dry the body after a shower?"
      },
      choices: {
        fr: ["Serviette", "Assiette", "Table", "Horloge"],
        ar: ["منشفة", "صحن", "طاولة", "ساعة"],
        en: ["Towel", "Plate", "Table", "Clock"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet sert à conserver les aliments au frais ?",
        ar: "أي جهاز يحفظ الطعام باردا؟",
        en: "Which appliance keeps food cold?"
      },
      choices: {
        fr: ["Réfrigérateur", "Canapé", "Miroir", "Lampe"],
        ar: ["ثلاجة", "أريكة", "مرآة", "مصباح"],
        en: ["Fridge", "Sofa", "Mirror", "Lamp"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet utilise-t-on pour changer de chaîne TV ?",
        ar: "بماذا نغير قناة التلفاز؟",
        en: "What do we use to change the TV channel?"
      },
      choices: {
        fr: ["Télécommande", "Brosse à dents", "Fourchette", "Oreiller"],
        ar: ["جهاز التحكم", "فرشاة أسنان", "شوكة", "وسادة"],
        en: ["Remote", "Toothbrush", "Fork", "Pillow"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet éclaire une pièce la nuit ?",
        ar: "أي شيء يضيء الغرفة ليلا؟",
        en: "Which object lights a room at night?"
      },
      choices: {
        fr: ["Lampe", "Cuillère", "Savon", "Pomme"],
        ar: ["مصباح", "ملعقة", "صابون", "تفاحة"],
        en: ["Lamp", "Spoon", "Soap", "Apple"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet sert à se regarder ?",
        ar: "بماذا ننظر إلى أنفسنا؟",
        en: "What do we use to look at ourselves?"
      },
      choices: {
        fr: ["Miroir", "Poêle", "Canapé", "Livre"],
        ar: ["مرآة", "مقلاة", "أريكة", "كتاب"],
        en: ["Mirror", "Pan", "Sofa", "Book"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quand il pleut, que prend-on souvent avec soi ?",
        ar: "عندما تمطر، ماذا نأخذ معنا غالبًا؟",
        en: "When it rains, what do we often take with us?"
      },
      choices: {
        fr: ["Parapluie", "Oreiller", "Assiette", "Télécommande"],
        ar: ["مظلة", "وسادة", "صحن", "جهاز تحكم"],
        en: ["Umbrella", "Pillow", "Plate", "Remote"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Que fait-on avant de traverser la route ?",
        ar: "ماذا نفعل قبل عبور الطريق؟",
        en: "What do we do before crossing the road?"
      },
      choices: {
        fr: ["On regarde à gauche et à droite", "On ferme les yeux", "On saute", "On dort"],
        ar: ["ننظر يمينًا ويسارًا", "نغلق أعيننا", "نقفز", "ننام"],
        en: ["Look left and right", "Close our eyes", "Jump", "Sleep"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet utilise-t-on pour écrire ?",
        ar: "بماذا نكتب؟",
        en: "What do we use to write?"
      },
      choices: {
        fr: ["Stylo", "Fourchette", "Serviette", "Réfrigérateur"],
        ar: ["قلم", "شوكة", "منشفة", "ثلاجة"],
        en: ["Pen", "Fork", "Towel", "Fridge"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Dans quelle pièce prépare-t-on souvent les repas ?",
        ar: "في أي غرفة نحضر الطعام غالبًا؟",
        en: "In which room do we often prepare meals?"
      },
      choices: {
        fr: ["Cuisine", "Garage", "Balcon", "Chambre"],
        ar: ["المطبخ", "المرأب", "الشرفة", "غرفة النوم"],
        en: ["Kitchen", "Garage", "Balcony", "Bedroom"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet met-on souvent sur une fenêtre pour cacher la lumière ?",
        ar: "ماذا نضع غالبًا على النافذة لحجب الضوء؟",
        en: "What do we often put on a window to block light?"
      },
      choices: {
        fr: ["Rideau", "Poêle", "Horloge", "Cuillère"],
        ar: ["ستارة", "مقلاة", "ساعة", "ملعقة"],
        en: ["Curtain", "Pan", "Clock", "Spoon"]
      },
      answer: 0
    }
  ],

  hard: [
    {
      q: {
        fr: "Si l’on veut cuisiner des œufs, quel objet est le plus utile ?",
        ar: "إذا أردنا طهي البيض، ما هو الشيء الأكثر فائدة؟",
        en: "If we want to cook eggs, which object is most useful?"
      },
      choices: {
        fr: ["Poêle", "Oreiller", "Serviette", "Télécommande"],
        ar: ["مقلاة", "وسادة", "منشفة", "جهاز تحكم"],
        en: ["Pan", "Pillow", "Towel", "Remote"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet est le plus logique dans une salle de bain ?",
        ar: "أي شيء هو الأكثر منطقية في الحمام؟",
        en: "Which object belongs most logically in a bathroom?"
      },
      choices: {
        fr: ["Brosse à dents", "Canapé", "Table", "Réfrigérateur"],
        ar: ["فرشاة أسنان", "أريكة", "طاولة", "ثلاجة"],
        en: ["Toothbrush", "Sofa", "Table", "Fridge"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet utilise-t-on pour couvrir le corps dans le lit ?",
        ar: "بماذا نغطي الجسم في السرير؟",
        en: "What do we use to cover the body in bed?"
      },
      choices: {
        fr: ["Couverture", "Assiette", "Horloge", "Savon"],
        ar: ["غطاء", "صحن", "ساعة", "صابون"],
        en: ["Blanket", "Plate", "Clock", "Soap"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet va le mieux avec une chaise dans un salon ?",
        ar: "أي شيء يناسب الكرسي أكثر في الصالون؟",
        en: "Which object best goes with a chair in a living room?"
      },
      choices: {
        fr: ["Table", "Douche", "Frigo", "Oreiller"],
        ar: ["طاولة", "دش", "ثلاجة", "وسادة"],
        en: ["Table", "Shower", "Fridge", "Pillow"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Lequel sert surtout à l’hygiène dentaire ?",
        ar: "أي شيء يستخدم أساسا لنظافة الأسنان؟",
        en: "Which one is mainly used for dental hygiene?"
      },
      choices: {
        fr: ["Dentifrice", "Cuillère", "Livre", "Lampe"],
        ar: ["معجون الأسنان", "ملعقة", "كتاب", "مصباح"],
        en: ["Toothpaste", "Spoon", "Book", "Lamp"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Si l’on veut se reposer assis, quel objet est le plus adapté ?",
        ar: "إذا أردنا الراحة ونحن جالسون، ما هو الشيء الأنسب؟",
        en: "If we want to rest while sitting, which object is most suitable?"
      },
      choices: {
        fr: ["Canapé", "Poêle", "Brosse à dents", "Fourchette"],
        ar: ["أريكة", "مقلاة", "فرشاة أسنان", "شوكة"],
        en: ["Sofa", "Pan", "Toothbrush", "Fork"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Que fait-on généralement avec une horloge ?",
        ar: "ماذا نفعل عادة بالساعة؟",
        en: "What do we usually do with a clock?"
      },
      choices: {
        fr: ["Lire l’heure", "Dormir dessus", "Manger avec", "Se laver avec"],
        ar: ["نعرف الوقت", "ننام عليها", "نأكل بها", "نغتسل بها"],
        en: ["Read the time", "Sleep on it", "Eat with it", "Wash with it"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Quel objet est le plus lié au repas ?",
        ar: "أي شيء مرتبط أكثر بالوجبة؟",
        en: "Which object is most related to a meal?"
      },
      choices: {
        fr: ["Fourchette", "Oreiller", "Miroir", "Douche"],
        ar: ["شوكة", "وسادة", "مرآة", "دش"],
        en: ["Fork", "Pillow", "Mirror", "Shower"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Si on veut appeler quelqu’un, quel objet est le plus adapté ?",
        ar: "إذا أردنا الاتصال بشخص، ما هو الشيء الأنسب؟",
        en: "If we want to call someone, which object is most suitable?"
      },
      choices: {
        fr: ["Téléphone", "Assiette", "Lampe", "Savon"],
        ar: ["هاتف", "صحن", "مصباح", "صابون"],
        en: ["Phone", "Plate", "Lamp", "Soap"]
      },
      answer: 0
    },
    {
      q: {
        fr: "Que fait-on généralement avant de manger ?",
        ar: "ماذا نفعل عادة قبل الأكل؟",
        en: "What do we usually do before eating?"
      },
      choices: {
        fr: ["Se laver les mains", "Dormir", "Regarder la lune", "Fermer la porte du garage"],
        ar: ["نغسل أيدينا", "ننام", "ننظر إلى القمر", "نغلق باب المرأب"],
        en: ["Wash our hands", "Sleep", "Look at the moon", "Close the garage door"]
      },
      answer: 0
    }
  ]
};

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let gameEnded = false;
let wrongAnswers = 0;
let questionCursor = 0;
let levelQuestions = [];
let askedIds = new Set();

function tt(key) {
  return T[currentLang][key];
}

function pickQuestionsForLevel(levelIndex) {
  const pools = [
    ["easy"],
    ["easy"],
    ["easy", "medium"],
    ["medium"],
    ["medium", "hard"],
    ["hard"]
  ];

  const keys = pools[levelIndex];
  const merged = keys.flatMap((k) => QUESTION_BANK[k]);
  const available = merged.filter((q, idx) => !askedIds.has(`${keys.join("-")}-${idx}-${q.q.fr}`));

  let shuffled = [...available].sort(() => Math.random() - 0.5);
  if (shuffled.length < LEVELS[levelIndex]) {
    shuffled = [...merged].sort(() => Math.random() - 0.5);
  }

  const picked = [];
  for (let i = 0; i < LEVELS[levelIndex]; i += 1) {
    const q = shuffled[i % shuffled.length];
    picked.push(q);
    askedIds.add(`${keys.join("-")}-${merged.indexOf(q)}-${q.q.fr}`);
  }

  return picked;
}

function updateTexts() {
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
  document.getElementById("game-round-label").textContent = `${tt("level")} ${Math.min(currentLevelIndex + 1, 6)} / 6`;
  document.getElementById("game-score-label").textContent = `${tt("score")} : ${currentScore}`;

  document.querySelectorAll(".slp").forEach((b) => b.classList.remove("on"));
  const active = document.getElementById(`lang-${currentLang}`);
  if (active) active.classList.add("on");
}

window.setGameLang = function setGameLang(newLang) {
  localStorage.setItem("nrw_lang", newLang);
  currentLang = newLang;
  updateTexts();
  renderCurrentScreen();
};

function renderIntro() {
  const root = document.getElementById("quiz-general-root");
  root.innerHTML = `
    <div class="intro-c quiz-intro-card">
      <h3>${tt("introTitle")}</h3>
      <p>${tt("introText")}</p>
      <button class="go-btn" id="start-quiz-general-btn">${tt("start")}</button>
    </div>
  `;
  document.getElementById("start-quiz-general-btn").onclick = startGame;
}

function renderCurrentScreen() {
  updateTexts();

  if (!levelQuestions.length && !gameEnded) {
    renderIntro();
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  updateTexts();

  const root = document.getElementById("quiz-general-root");
  const q = levelQuestions[questionCursor];
  const totalLevel = levelQuestions.length;

  root.innerHTML = `
    <div class="quiz-shell-card">
      <div class="quiz-meta-row">
        <div class="quiz-mini-badge">${tt("question")} ${questionCursor + 1} / ${totalLevel}</div>
        <div class="quiz-mini-badge">${tt("wrongAnswers")} : ${wrongAnswers}</div>
      </div>

      <div class="quiz-question-card">
        <div class="quiz-question-text">${q.q[currentLang]}</div>
      </div>

      <div class="quiz-options-grid">
        ${q.choices[currentLang].map((choice, idx) => `
          <button class="quiz-option-btn" data-index="${idx}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
            <span>${choice}</span>
          </button>
        `).join("")}
      </div>

      <div class="game-feedback" id="quiz-general-feedback"></div>
    </div>
  `;

  document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.onclick = () => handleAnswer(Number(btn.dataset.index));
  });
}

function handleAnswer(index) {
  const q = levelQuestions[questionCursor];
  const fb = document.getElementById("quiz-general-feedback");

  document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.disabled = true;
  });

  if (index === q.answer) {
    currentScore += 1;
    fb.textContent = tt("correct");
    fb.className = "game-feedback ok";
  } else {
    wrongAnswers += 1;
    fb.textContent = tt("wrong");
    fb.className = "game-feedback bad";
  }

  setTimeout(() => {
    questionCursor += 1;

    if (questionCursor < levelQuestions.length) {
      renderQuestion();
    } else {
      currentLevelIndex += 1;

      if (currentLevelIndex < 6) {
        levelQuestions = pickQuestionsForLevel(currentLevelIndex);
        questionCursor = 0;
        renderQuestion();
      } else {
        finishGame();
      }
    }
  }, 700);
}

async function startGame() {
  if (!currentUser) return;

  currentLevelIndex = 0;
  currentScore = 0;
  wrongAnswers = 0;
  gameEnded = false;
  askedIds = new Set();
  levelQuestions = pickQuestionsForLevel(0);
  questionCursor = 0;

  const maxScore = LEVELS.reduce((a, b) => a + b, 0);

  const session = await createSession(currentUser.uid, {
    source: "quiz-general"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "quiz_general",
    category: "quiz",
    maxScore,
    metadata: {
      rounds: 6,
      questionPoolMode: "large-daily-life-bank"
    }
  });
  currentResultId = exercise.resultId;

  renderCurrentScreen();
}

async function finishGame() {
  gameEnded = true;

  const maxScore = LEVELS.reduce((a, b) => a + b, 0);
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
      questionPoolMode: "large-daily-life-bank"
    }
  });

  await completeSession(currentUser.uid, currentSessionId, {
    notes: "quiz-general completed"
  });

  const root = document.getElementById("quiz-general-root");
  root.innerHTML = `
    <div class="intro-c quiz-intro-card">
      <h3>${tt("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${tt("correctAnswers")} : ${currentScore}</p>
      <p>${tt("wrongAnswers")} : ${wrongAnswers}</p>
      <p>${tt("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${tt("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/quiz'">${tt("returnQuiz")}</button>
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
          correctAnswers: currentScore,
          wrongAnswers
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "quiz-general abandoned"
      });
    }
  } catch (e) {
    console.error(e);
  }

  window.location.href = "/exercises/quiz";
};

window.logout = function logout() {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
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