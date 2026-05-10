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
    title: "إيجاد الأزواج",
    subtitle: "اقلب البطاقات وابحث عن الأزواج المتطابقة.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة إيجاد الأزواج",
    introText: "اقلب بطاقتين في كل مرة. إذا كانتا متطابقتين فسيبقيان مفتوحتين. أكمل كل الأزواج للانتقال إلى المستوى التالي.",
    start: "إبدأ",
    pairsToFind: "ابحث عن كل الأزواج",
    success: "تم العثور على زوج صحيح",
    fail: "ليستا زوجًا متطابقًا",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    timeLeft: "الوقت المتبقي",
    timeUp: "انتهى الوقت!",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/objects/.",
    imageLabelFallback: "صورة",
    attempts: "المحاولات",
    foundPairs: "الأزواج المكتشفة",
    wait: "انتظر..."
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
    title: "Trouver les paires",
    subtitle: "Retournez les cartes et retrouvez les paires identiques.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu des paires",
    introText: "Retournez deux cartes à la fois. Si elles sont identiques, elles restent visibles. Trouvez toutes les paires pour passer au niveau suivant.",
    start: "Commencer",
    pairsToFind: "Trouvez toutes les paires",
    success: "Bonne paire trouvée",
    fail: "Ce n’est pas une paire",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    timeLeft: "Temps restant",
    timeUp: "Temps écoulé !",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/objects/.",
    imageLabelFallback: "Image",
    attempts: "Essais",
    foundPairs: "Paires trouvées",
    wait: "Patientez..."
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
    title: "Find the pairs",
    subtitle: "Flip the cards and find the matching pairs.",
    level: "Level",
    score: "Score",
    introTitle: "Pairs memory game",
    introText: "Flip two cards at a time. If they match, they stay visible. Find all pairs to move to the next level.",
    start: "Start",
    pairsToFind: "Find all pairs",
    success: "Correct pair found",
    fail: "Not a matching pair",
    resultTitle: "Final result",
    playAgain: "Play again",
    timeLeft: "Time left",
    timeUp: "Time's up!",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/objects/.",
    imageLabelFallback: "Image",
    attempts: "Attempts",
    foundPairs: "Pairs found",
    wait: "Please wait..."
  }
};

const IMAGE_LIBRARY = {
  // ── Fruits ──
  apple:          { src: "/static/images/objects/apple.png",          label: { ar: "تفاحة",      fr: "Pomme",           en: "Apple"          } },
  banana:         { src: "/static/images/objects/banana.png",         label: { ar: "موز",         fr: "Banane",          en: "Banana"         } },
  orange:         { src: "/static/images/objects/orange.png",         label: { ar: "برتقال",      fr: "Orange",          en: "Orange"         } },
  grape:          { src: "/static/images/objects/grape.png",          label: { ar: "عنب",         fr: "Raisin",          en: "Grape"          } },
  lemon:          { src: "/static/images/objects/lemon.png",          label: { ar: "ليمون",       fr: "Citron",          en: "Lemon"          } },
  strawberry:     { src: "/static/images/objects/strawberry.png",     label: { ar: "فراولة",      fr: "Fraise",          en: "Strawberry"     } },
  watermelon:     { src: "/static/images/objects/watermelon.png",     label: { ar: "بطيخ",        fr: "Pastèque",        en: "Watermelon"     } },
  pineapple:      { src: "/static/images/objects/pineapple.png",      label: { ar: "أناناس",      fr: "Ananas",          en: "Pineapple"      } },
  cherry:         { src: "/static/images/objects/cherry.png",         label: { ar: "كرز",         fr: "Cerise",          en: "Cherry"         } },
  // ── Animals ──
  dog:            { src: "/static/images/objects/dog.png",            label: { ar: "كلب",         fr: "Chien",           en: "Dog"            } },
  cat:            { src: "/static/images/objects/cat.png",            label: { ar: "قط",          fr: "Chat",            en: "Cat"            } },
  lion:           { src: "/static/images/objects/lion.png",           label: { ar: "أسد",         fr: "Lion",            en: "Lion"           } },
  bird:           { src: "/static/images/objects/bird.png",           label: { ar: "طائر",        fr: "Oiseau",          en: "Bird"           } },
  fish:           { src: "/static/images/objects/fish.png",           label: { ar: "سمكة",        fr: "Poisson",         en: "Fish"           } },
  rabbit:         { src: "/static/images/objects/rabbit.png",         label: { ar: "أرنب",        fr: "Lapin",           en: "Rabbit"         } },
  elephant:       { src: "/static/images/objects/elephant.png",       label: { ar: "فيل",         fr: "Éléphant",        en: "Elephant"       } },
  butterfly:      { src: "/static/images/objects/butterfly.png",      label: { ar: "فراشة",       fr: "Papillon",        en: "Butterfly"      } },
  aquarium:       { src: "/static/images/objects/aquarium.png",       label: { ar: "حوض سمك",     fr: "Aquarium",        en: "Aquarium"       } },
  // ── Nature ──
  tree:           { src: "/static/images/objects/tree.png",           label: { ar: "شجرة",        fr: "Arbre",           en: "Tree"           } },
  flower:         { src: "/static/images/objects/flower.png",         label: { ar: "زهرة",        fr: "Fleur",           en: "Flower"         } },
  moon:           { src: "/static/images/objects/moon.png",           label: { ar: "قمر",         fr: "Lune",            en: "Moon"           } },
  cloud:          { src: "/static/images/objects/cloud.png",          label: { ar: "سحابة",       fr: "Nuage",           en: "Cloud"          } },
  // ── Transport ──
  car:            { src: "/static/images/objects/car.png",            label: { ar: "سيارة",       fr: "Voiture",         en: "Car"            } },
  bicycle:        { src: "/static/images/objects/bicycle.png",        label: { ar: "دراجة",       fr: "Vélo",            en: "Bicycle"        } },
  truck:          { src: "/static/images/objects/truck.png",          label: { ar: "شاحنة",       fr: "Camion",          en: "Truck"          } },
  bus:            { src: "/static/images/objects/bus.png",            label: { ar: "حافلة",       fr: "Bus",             en: "Bus"            } },
  airplane:       { src: "/static/images/objects/airplane.png",       label: { ar: "طائرة",       fr: "Avion",           en: "Airplane"       } },
  // ── Household ──
  house:          { src: "/static/images/objects/house.png",          label: { ar: "منزل",        fr: "Maison",          en: "House"          } },
  book:           { src: "/static/images/objects/book.png",           label: { ar: "كتاب",        fr: "Livre",           en: "Book"           } },
  bed:            { src: "/static/images/objects/bed.png",            label: { ar: "سرير",        fr: "Lit",             en: "Bed"            } },
  blanket:        { src: "/static/images/objects/blanket.png",        label: { ar: "بطانية",      fr: "Couverture",      en: "Blanket"        } },
  chair:          { src: "/static/images/objects/chair.png",          label: { ar: "كرسي",        fr: "Chaise",          en: "Chair"          } },
  clock:          { src: "/static/images/objects/clock.png",          label: { ar: "ساعة حائط",   fr: "Horloge",         en: "Clock"          } },
  cup:            { src: "/static/images/objects/cup.png",            label: { ar: "كوب",         fr: "Tasse",           en: "Cup"            } },
  fork:           { src: "/static/images/objects/fork.png",           label: { ar: "شوكة",        fr: "Fourchette",      en: "Fork"           } },
  fridge:         { src: "/static/images/objects/fridge.png",         label: { ar: "ثلاجة",       fr: "Réfrigérateur",   en: "Fridge"         } },
  lamp:           { src: "/static/images/objects/lamp.png",           label: { ar: "مصباح",       fr: "Lampe",           en: "Lamp"           } },
  mirror:         { src: "/static/images/objects/mirror.png",         label: { ar: "مرآة",        fr: "Miroir",          en: "Mirror"         } },
  pan:            { src: "/static/images/objects/pan.png",            label: { ar: "مقلاة",       fr: "Poêle",           en: "Pan"            } },
  pillow:         { src: "/static/images/objects/pillow.png",         label: { ar: "وسادة",       fr: "Oreiller",        en: "Pillow"         } },
  plate:          { src: "/static/images/objects/plate.png",          label: { ar: "طبق",         fr: "Assiette",        en: "Plate"          } },
  remote:         { src: "/static/images/objects/remote.png",         label: { ar: "ريموت",       fr: "Télécommande",    en: "Remote"         } },
  shower:         { src: "/static/images/objects/shower.png",         label: { ar: "دش",          fr: "Douche",          en: "Shower"         } },
  sink:           { src: "/static/images/objects/sink.png",           label: { ar: "حوض غسيل",    fr: "Évier",           en: "Sink"           } },
  soap:           { src: "/static/images/objects/soap.png",           label: { ar: "صابون",       fr: "Savon",           en: "Soap"           } },
  sofa:           { src: "/static/images/objects/sofa.png",           label: { ar: "أريكة",       fr: "Canapé",          en: "Sofa"           } },
  spoon:          { src: "/static/images/objects/spoon.png",          label: { ar: "ملعقة",       fr: "Cuillère",        en: "Spoon"          } },
  table:          { src: "/static/images/objects/table.png",          label: { ar: "طاولة",       fr: "Table",           en: "Table"          } },
  toothbrush:     { src: "/static/images/objects/toothbrush.png",     label: { ar: "فرشاة أسنان", fr: "Brosse à dents",  en: "Toothbrush"     } },
  toothpaste:     { src: "/static/images/objects/toothpaste.png",     label: { ar: "معجون أسنان", fr: "Dentifrice",      en: "Toothpaste"     } },
  towel:          { src: "/static/images/objects/towel.png",          label: { ar: "منشفة",       fr: "Serviette",       en: "Towel"          } },
  tv:             { src: "/static/images/objects/tv.png",             label: { ar: "تلفاز",       fr: "Télévision",      en: "TV"             } },
  wardrobe:       { src: "/static/images/objects/wardrobe.png",       label: { ar: "خزانة ملابس", fr: "Armoire",         en: "Wardrobe"       } },
  oven:           { src: "/static/images/objects/oven.png",           label: { ar: "فرن",         fr: "Four",            en: "Oven"           } },
  washingmachine: { src: "/static/images/objects/washingmachine.png", label: { ar: "غسالة",       fr: "Lave-linge",      en: "Washing Machine"} },
  // ── Tech & accessories ──
  pc:             { src: "/static/images/objects/pc.png",             label: { ar: "حاسوب",       fr: "Ordinateur",      en: "Computer"       } },
  phone:          { src: "/static/images/objects/phone.png",          label: { ar: "هاتف",        fr: "Téléphone",       en: "Phone"          } },
  charger:        { src: "/static/images/objects/charger.png",        label: { ar: "شاحن",        fr: "Chargeur",        en: "Charger"        } },
  alarmclock:     { src: "/static/images/objects/alarmclock.png",     label: { ar: "منبّه",        fr: "Réveil",          en: "Alarm Clock"    } },
  // ── Clothing & personal ──
  bag:            { src: "/static/images/objects/bag.png",            label: { ar: "حقيبة",       fr: "Sac",             en: "Bag"            } },
  bottle:         { src: "/static/images/objects/bottle.png",         label: { ar: "زجاجة",       fr: "Bouteille",       en: "Bottle"         } },
  bread:          { src: "/static/images/objects/bread.png",          label: { ar: "خبز",         fr: "Pain",            en: "Bread"          } },
  broom:          { src: "/static/images/objects/broom.png",          label: { ar: "مكنسة",       fr: "Balai",           en: "Broom"          } },
  ball:           { src: "/static/images/objects/ball.png",           label: { ar: "كرة",         fr: "Ballon",          en: "Ball"           } },
  calendar:       { src: "/static/images/objects/calendar.png",       label: { ar: "تقويم",       fr: "Calendrier",      en: "Calendar"       } },
  candle:         { src: "/static/images/objects/candle.png",         label: { ar: "شمعة",        fr: "Bougie",          en: "Candle"         } },
  coin:           { src: "/static/images/objects/coin.png",           label: { ar: "عملة",        fr: "Pièce",           en: "Coin"           } },
  comb:           { src: "/static/images/objects/comb.png",           label: { ar: "مشط",         fr: "Peigne",          en: "Comb"           } },
  door:           { src: "/static/images/objects/door.png",           label: { ar: "باب",         fr: "Porte",           en: "Door"           } },
  glasses:        { src: "/static/images/objects/glasses.png",        label: { ar: "نظارة",       fr: "Lunettes",        en: "Glasses"        } },
  hat:            { src: "/static/images/objects/hat.png",            label: { ar: "قبعة",        fr: "Chapeau",         en: "Hat"            } },
  hairdryer:      { src: "/static/images/objects/hairdryer.png",      label: { ar: "مجفف الشعر",  fr: "Sèche-cheveux",   en: "Hair Dryer"     } },
  iron:           { src: "/static/images/objects/iron.png",           label: { ar: "مكواة",       fr: "Fer à repasser",  en: "Iron"           } },
  jacket:         { src: "/static/images/objects/jacket.png",         label: { ar: "جاكيت",       fr: "Veste",           en: "Jacket"         } },
  key:            { src: "/static/images/objects/key.png",            label: { ar: "مفتاح",       fr: "Clé",             en: "Key"            } },
  knife:          { src: "/static/images/objects/knife.png",          label: { ar: "سكين",        fr: "Couteau",         en: "Knife"          } },
  medicine:       { src: "/static/images/objects/medicine.png",       label: { ar: "دواء",        fr: "Médicament",      en: "Medicine"       } },
  notebook:       { src: "/static/images/objects/notebook.png",       label: { ar: "دفتر",        fr: "Cahier",          en: "Notebook"       } },
  pen:            { src: "/static/images/objects/pen.png",            label: { ar: "قلم",         fr: "Stylo",           en: "Pen"            } },
  pot:            { src: "/static/images/objects/pot.png",            label: { ar: "قدر",         fr: "Casserole",       en: "Pot"            } },
  scissors:       { src: "/static/images/objects/scissors.png",       label: { ar: "مقص",         fr: "Ciseaux",         en: "Scissors"       } },
  shirt:          { src: "/static/images/objects/shirt.png",          label: { ar: "قميص",        fr: "Chemise",         en: "Shirt"          } },
  shoes:          { src: "/static/images/objects/shoes.png",          label: { ar: "حذاء",        fr: "Chaussures",      en: "Shoes"          } },
  umbrella:       { src: "/static/images/objects/umbrella.png",       label: { ar: "مظلة",        fr: "Parapluie",       en: "Umbrella"       } },
  wallet:         { src: "/static/images/objects/wallet.png",         label: { ar: "محفظة",       fr: "Portefeuille",    en: "Wallet"         } },
  watch:          { src: "/static/images/objects/watch.png",          label: { ar: "ساعة يد",     fr: "Montre",          en: "Watch"          } },
  window:         { src: "/static/images/objects/window.png",         label: { ar: "نافذة",       fr: "Fenêtre",         en: "Window"         } }
};


// Progression de difficulté :
// Niveau 1 : 2 paires, retournement visible 1200ms  → très facile (mémoire immédiate)
// Niveau 2 : 3 paires, retournement visible 1000ms
// Niveau 3 : 4 paires, retournement visible 900ms
// Niveau 4 : 5 paires, retournement visible 800ms
// Niveau 5 : 6 paires, retournement visible 700ms   → difficile
// Niveau 6 : 7 paires, retournement visible 600ms   → très difficile
// Progression de difficulté :
// Niveau 1 : 2 paires, retournement 1200ms, pas de timer    → très facile
// Niveau 2 : 3 paires, retournement 1000ms, 60s
// Niveau 3 : 4 paires, retournement 900ms, 50s
// Niveau 4 : 5 paires, retournement 800ms, 40s
// Niveau 5 : 6 paires, retournement 700ms, 30s              → difficile
// Niveau 6 : 7 paires, retournement 600ms, 20s              → très difficile
const ROUNDS = [
  { pairs: 2, flipDelay: 1200, timeLimitSec: 0  },
  { pairs: 3, flipDelay: 1000, timeLimitSec: 60 },
  { pairs: 4, flipDelay: 900,  timeLimitSec: 50 },
  { pairs: 5, flipDelay: 800,  timeLimitSec: 40 },
  { pairs: 6, flipDelay: 700,  timeLimitSec: 30 },
  { pairs: 7, flipDelay: 600,  timeLimitSec: 20 }
];

const IMAGE_KEYS = Object.keys(IMAGE_LIBRARY);

let currentLang = localStorage.getItem("nrw_lang") || "ar";
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentRoundIndex = 0;
let currentScore = 0;
let currentRoundData = null;
let gameEnded = false;
let loadedAssets = new Set();
let missingAssets = [];
let _pairsTimer = null;
let _pairsTimeLeft = 0;
let totalAttempts = 0;
let totalMistakes = 0;
let totalPairsFound = 0;
let isChecking = false;

function t(key) {
  return GAME_TRANSLATIONS[currentLang][key];
}

function getImageLabel(key) {
  return (
    IMAGE_LIBRARY[key]?.label?.[currentLang] ||
    IMAGE_LIBRARY[key]?.label?.fr ||
    t("imageLabelFallback")
  );
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
  document.getElementById("game-round-label").textContent = `${t("level")} ${Math.min(currentRoundIndex + 1, ROUNDS.length)} / ${ROUNDS.length}`;
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

function renderMissingAssetsMessage() {
  const root = document.getElementById("memory-pairs-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("imageLoadError")}</h3>
      <p>${t("assetsMissing")}</p>
      <div class="memory-missing-list">
        ${missingAssets.map((key) => `<span class="memory-missing-chip">${key}</span>`).join("")}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/memory'">${t("returnMemory")}</button>
      </div>
    </div>
  `;
}

function renderIntro() {
  const root = document.getElementById("memory-pairs-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="7" height="7" rx="1"/>
          <rect x="14" y="4" width="7" height="7" rx="1"/>
          <rect x="3" y="13" width="7" height="7" rx="1"/>
          <rect x="14" y="13" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-pairs-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-pairs-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));
  const selectedKeys = shuffle(availableKeys).slice(0, config.pairs);

  const cards = shuffle(
    selectedKeys.flatMap((key, pairIndex) => [
      {
        uid: `${key}-a-${pairIndex}`,
        key,
        pairId: `${key}-${pairIndex}`,
        isMatched: false,
        isFlipped: false
      },
      {
        uid: `${key}-b-${pairIndex}`,
        key,
        pairId: `${key}-${pairIndex}`,
        isMatched: false,
        isFlipped: false
      }
    ])
  );

  currentRoundData = {
    cards,
    openIndexes: [],
    foundPairs: 0,
    attempts: 0,
    pairs: config.pairs
  };

  isChecking = false;
}

function startPairsTimer(totalSec) {
  clearInterval(_pairsTimer);
  _pairsTimeLeft = totalSec;
  _pairsTimer = setInterval(() => {
    _pairsTimeLeft -= 1;
    const el = document.getElementById("pairs-timer-val");
    if (el) el.textContent = _pairsTimeLeft;
    const pill = document.getElementById("pairs-timer-pill");
    if (pill && _pairsTimeLeft <= 8) pill.style.color = "var(--danger, #e74c3c)";
    if (_pairsTimeLeft <= 0) {
      clearInterval(_pairsTimer);
      // Auto advance round on timeout
      const fb = document.getElementById("memory-pairs-feedback");
      if (fb) { fb.textContent = t("timeUp"); fb.className = "game-feedback bad"; }
      setTimeout(() => {
        currentRoundIndex += 1;
        _pairsTimeLeft = 0;
        if (currentRoundIndex < ROUNDS.length) {
          generateRoundData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      }, 800);
    }
  }, 1000);
}

function stopPairsTimer() {
  clearInterval(_pairsTimer);
  _pairsTimeLeft = 0;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  renderPairsBoard();
}

function renderPairsBoard() {
  const root = document.getElementById("memory-pairs-root");

  root.innerHTML = `
    <div class="game-note">${t("pairsToFind")}</div>

    <div class="memory-pairs-stats">
      <div class="game-pill">${t("foundPairs")} : ${currentRoundData.foundPairs} / ${currentRoundData.pairs}</div>
      <div class="game-pill game-pill-score">${t("attempts")} : ${currentRoundData.attempts}</div>
    </div>

    <div class="memory-pairs-grid pairs-${currentRoundData.pairs}">
      ${currentRoundData.cards.map((card, index) => {
        const cardClasses = [
          "memory-pair-card",
          card.isFlipped || card.isMatched ? "flipped" : "",
          card.isMatched ? "matched" : ""
        ].join(" ").trim();

        return `
          <button class="${cardClasses}" data-index="${index}" ${isChecking || card.isMatched ? "disabled" : ""}>
            <div class="memory-pair-card-inner">
              <div class="memory-pair-front">
                <div class="ib md">
                  <svg viewBox="0 0 24 24">
                    <path d="M9.5 2a2.5 2.5 0 0 1 4.9.44C16.1 3 17.5 4.4 17.5 6c0 .34-.04.67-.11 1H18a3 3 0 0 1 3 3c0 1.1-.6 2.1-1.5 2.6A3 3 0 0 1 18 18h-.5a2.5 2.5 0 0 1-4.9.44A2.5 2.5 0 0 1 9.5 16H9a3 3 0 0 1-1.5-5.6A3 3 0 0 1 9 4h.11A2.5 2.5 0 0 1 9.5 2z"/>
                  </svg>
                </div>
              </div>
              <div class="memory-pair-back">
                <div class="memory-card-media">
                   <img src="${IMAGE_LIBRARY[card.key].src}" alt="${getImageLabel(card.key)}" class="memory-real-img" loading="eager" draggable="false">
                </div>
              </div>
            </div>
          </button>
        `;
      }).join("")}
    </div>

    <div class="game-feedback" id="memory-pairs-feedback"></div>
  `;

  document.querySelectorAll(".memory-pair-card").forEach((cardEl) => {
    cardEl.onclick = () => {
      const index = Number(cardEl.dataset.index);
      flipCard(index);
    };
  });
}

function flipCard(index) {
  if (!currentRoundData || isChecking) return;

  const card = currentRoundData.cards[index];
  if (!card || card.isMatched || card.isFlipped) return;
  if (currentRoundData.openIndexes.length >= 2) return;

  card.isFlipped = true;
  currentRoundData.openIndexes.push(index);
  renderPairsBoard();

  if (currentRoundData.openIndexes.length === 2) {
    checkPair();
  }
}

function checkPair() {
  isChecking = true;
  currentRoundData.attempts += 1;
  totalAttempts += 1;

  const [firstIndex, secondIndex] = currentRoundData.openIndexes;
  const firstCard = currentRoundData.cards[firstIndex];
  const secondCard = currentRoundData.cards[secondIndex];

  if (firstCard.pairId === secondCard.pairId) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    currentRoundData.foundPairs += 1;
    totalPairsFound += 1;
    currentScore += 1;

    currentRoundData.openIndexes = [];
    isChecking = false;

    renderPairsBoard();

    const fb = document.getElementById("memory-pairs-feedback");
    if (fb) {
      fb.textContent = t("success");
      fb.className = "game-feedback ok";
    }

    if (currentRoundData.foundPairs === currentRoundData.pairs) {
      setTimeout(() => {
        currentRoundIndex += 1;

        if (currentRoundIndex < ROUNDS.length) {
          generateRoundData();
          renderCurrentScreen();
        } else {
          finishGame();
        }
      }, 900);
    }

  } else {
    totalMistakes += 1;

    renderPairsBoard();

    const fb = document.getElementById("memory-pairs-feedback");
    if (fb) {
      fb.textContent = t("fail");
      fb.className = "game-feedback bad";
    }

    setTimeout(() => {
      firstCard.isFlipped = false;
      secondCard.isFlipped = false;
      currentRoundData.openIndexes = [];
      isChecking = false;
      renderPairsBoard();
    }, ROUNDS[currentRoundIndex]?.flipDelay ?? 900);
  }
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  totalAttempts = 0;
  totalMistakes = 0;
  totalPairsFound = 0;
  gameEnded = false;
  isChecking = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.pairs, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-pairs"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_pairs",
    category: "memory",
    maxScore,
    metadata: {
      rounds: ROUNDS.length,
      assetMode: "local-images",
      imagePoolSize: IMAGE_KEYS.length
    }
  });
  currentResultId = exercise.resultId;

  generateRoundData();
  renderCurrentScreen();
}

async function finishGame() {
  stopPairsTimer();
  gameEnded = true;

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.pairs, 0);
  const accuracyPercent = totalAttempts > 0
    ? Math.round((totalPairsFound / totalAttempts) * 100)
    : 0;

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        accuracyPercent,
        pairsFound: totalPairsFound,
        attempts: totalAttempts,
        mistakes: totalMistakes,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-pairs completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-pairs-root");
  root.innerHTML = `
    <div class="intro-c">
      <h3>${t("resultTitle")}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t("score")} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t("playAgain")}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/memory'">${t("returnMemory")}</button>
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
          round: currentRoundIndex + 1,
          pairsFound: totalPairsFound,
          attempts: totalAttempts,
          mistakes: totalMistakes,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-pairs abandoned"
      });
    }
  } catch (error) {
    console.error("Leave game error:", error);
  }

  window.location.href = "/exercises/memory";
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
});  // Start round timer if configured
  const roundCfg2 = ROUNDS[currentRoundIndex];
  if (roundCfg2 && roundCfg2.timeLimitSec > 0 && !currentRoundData.locked) {
    if (_pairsTimeLeft <= 0) startPairsTimer(roundCfg2.timeLimitSec);
  }

  
