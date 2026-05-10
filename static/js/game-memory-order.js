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
    title: "إعادة ترتيب الصور",
    subtitle: "أعد الصور إلى ترتيبها الصحيح.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة ترتيب الصور",
    introText: "ستظهر لك مجموعة صور بترتيب معين. احفظ الترتيب ثم أعد وضع الصور بنفس الترتيب الصحيح.",
    start: "إبدأ",
    continue: "متابعة",
    memorize: "احفظ هذا الترتيب",
    reorder: "أعد ترتيب الصور",
    validate: "تأكيد الترتيب",
    success: "ترتيب صحيح",
    fail: "الترتيب غير صحيح",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/objects/.",
    imageLabelFallback: "صورة",
    currentSequence: "الترتيب المطلوب",
    yourSequence: "الترتيب الحالي",
    tip: "اسحب الصور وأفلتها لإعادتها إلى الترتيب الصحيح."
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
    title: "Remettre en ordre",
    subtitle: "Remettez les images dans le bon ordre.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de remise en ordre",
    introText: "Une série d’images sera affichée dans un ordre précis. Mémorisez cet ordre puis remettez-les exactement dans le bon ordre.",
    start: "Commencer",
    continue: "Continuer",
    memorize: "Mémorisez cet ordre",
    reorder: "Remettez les images en ordre",
    validate: "Valider l’ordre",
    success: "Ordre correct",
    fail: "Ordre incorrect",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/objects/.",
    imageLabelFallback: "Image",
    currentSequence: "Ordre à mémoriser",
    yourSequence: "Votre ordre actuel",
    tip: "Faites glisser les images pour les remettre dans le bon ordre."
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
    title: "Put in order",
    subtitle: "Put the images back in the correct order.",
    level: "Level",
    score: "Score",
    introTitle: "Order memory game",
    introText: "A sequence of images will be shown in a specific order. Memorize it, then place the images back in the exact same order.",
    start: "Start",
    continue: "Continue",
    memorize: "Memorize this order",
    reorder: "Put the images back in order",
    validate: "Validate order",
    success: "Correct order",
    fail: "Wrong order",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/objects/.",
    imageLabelFallback: "Image",
    currentSequence: "Target order",
    yourSequence: "Your current order",
    tip: "Drag and drop the images to restore the correct order."
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
// Niveau 1 : 2 images, affichage 4s  → très facile
// Niveau 2 : 3 images, affichage 4s
// Niveau 3 : 4 images, affichage 3.5s
// Niveau 4 : 5 images, affichage 3s
// Niveau 5 : 6 images, affichage 2.5s  → difficile
// Niveau 6 : 7 images, affichage 2s    → très difficile
// Progression de difficulté :
// Niveau 1 : 2 images, 4s mémorisation          → très facile
// Niveau 2 : 3 images, 3.5s
// Niveau 3 : 4 images, 3s
// Niveau 4 : 5 images, 2.5s
// Niveau 5 : 6 images, 2s                       → difficile
// Niveau 6 : 7 images, 1.5s                     → très difficile
const ROUNDS = [
  { shown: 2, displayMs: 6500 },
  { shown: 3, displayMs: 6500 },
  { shown: 4, displayMs: 6500 },
  { shown: 5, displayMs: 6500 },
  { shown: 6, displayMs: 7000 },
  { shown: 7, displayMs: 7000 }
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
let totalCorrectPlacements = 0;
let totalPlacements = 0;
let draggedIndex = null;

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
  const root = document.getElementById("memory-order-root");
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
  const root = document.getElementById("memory-order-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M8 6h13M8 12h13M8 18h13"/>
          <circle cx="4" cy="6" r="1.5"/>
          <circle cx="4" cy="12" r="1.5"/>
          <circle cx="4" cy="18" r="1.5"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-order-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-order-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));
  const targetOrder = shuffle(availableKeys).slice(0, config.shown);

  let shuffledOrder = shuffle(targetOrder);
  let protection = 0;

  while (JSON.stringify(shuffledOrder) === JSON.stringify(targetOrder) && protection < 10) {
    shuffledOrder = shuffle(targetOrder);
    protection += 1;
  }

  currentRoundData = {
    targetOrder,
    workingOrder: shuffledOrder,
    phase: "memorize"
  };
}

function moveDraggedItem(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex == null || toIndex == null) return;

  const copy = [...currentRoundData.workingOrder];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  currentRoundData.workingOrder = copy;
}

function renderImageOrderCard(key, index, mode = "display") {
  const label = getImageLabel(key);
  const asset = IMAGE_LIBRARY[key];
  const roundClass = currentRoundData?.targetOrder?.length <= 3 ? " round-small" : "";

  if (mode === "display") {
    return `
      <div class="memory-order-display-card${roundClass}">
        <div class="memory-order-index">${index + 1}</div>
        <div class="memory-card-media">
          <img src="${asset.src}" alt="${label}" class="memory-real-img" loading="eager" draggable="false">
        </div>
      </div>
    `;
  }

  return `
    <div
      class="memory-order-play-card${roundClass}"
      draggable="true"
      data-index="${index}"
    >
      <div class="memory-order-index">${index + 1}</div>
      <div class="memory-card-media">
        <img src="${asset.src}" alt="${label}" class="memory-real-img" loading="eager" draggable="false">
      </div>
    </div>
  `;
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  if (currentRoundData.phase === "memorize") {
    renderMemorizePhase();
  } else if (currentRoundData.phase === "reorder") {
    renderReorderPhase();
  }
}

function renderMemorizePhase() {
  const root = document.getElementById("memory-order-root");
  const config = ROUNDS[currentRoundIndex];
  const totalSec = Math.round(config.displayMs / 1000);

  root.innerHTML = `
    <div class="game-note">${t("memorize")}</div>
    <div class="memory-order-section-title">${t("currentSequence")} &nbsp;<span id="mem-order-countdown" style="font-size:1.1rem;font-weight:700;color:var(--primary)">${totalSec}s</span></div>
    <div class="memory-order-display-grid">
      ${currentRoundData.targetOrder.map((key, index) => renderImageOrderCard(key, index, "display")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="continue-memory-order-btn">${t("continue")}</button>
    </div>
  `;

  let secondsLeft = totalSec;
  const cdEl = document.getElementById("mem-order-countdown");
  const autoTimer = setInterval(() => {
    secondsLeft -= 1;
    if (cdEl) cdEl.textContent = `${secondsLeft}s`;
    if (secondsLeft <= 0) {
      clearInterval(autoTimer);
      currentRoundData.phase = "reorder";
      renderCurrentScreen();
    }
  }, 1000);

  document.getElementById("continue-memory-order-btn").onclick = () => {
    clearInterval(autoTimer);
    currentRoundData.phase = "reorder";
    renderCurrentScreen();
  };
}

function attachDragHandlers() {
  const cards = document.querySelectorAll(".memory-order-play-card");

  cards.forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggedIndex = Number(card.dataset.index);
      card.classList.add("dragging");

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(draggedIndex));
      }
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedIndex = null;
      document.querySelectorAll(".memory-order-play-card").forEach((c) => c.classList.remove("drag-over"));
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("drag-over");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over");
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      const targetIndex = Number(card.dataset.index);
      const fromIndex = draggedIndex ?? Number(e.dataTransfer?.getData("text/plain"));
      moveDraggedItem(fromIndex, targetIndex);
      renderReorderPhase();
    });
  });
}

function renderReorderPhase() {
  const root = document.getElementById("memory-order-root");
  root.innerHTML = `
    <div class="game-note">${t("reorder")}</div>
    <div class="memory-order-section-title">${t("yourSequence")}</div>
    <p class="memory-order-tip">${t("tip")}</p>
    <div class="memory-order-play-grid">
      ${currentRoundData.workingOrder.map((key, index) => renderImageOrderCard(key, index, "play")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="validate-memory-order-btn">${t("validate")}</button>
    </div>
    <div class="game-feedback" id="memory-order-feedback"></div>
  `;

  attachDragHandlers();

  document.getElementById("validate-memory-order-btn").onclick = validateRound;
}

function validateRound() {
  const target = currentRoundData.targetOrder;
  const working = currentRoundData.workingOrder;

  let correctPlacements = 0;
  for (let i = 0; i < target.length; i += 1) {
    if (target[i] === working[i]) {
      correctPlacements += 1;
    }
  }

  totalCorrectPlacements += correctPlacements;
  totalPlacements += target.length;
  currentScore += correctPlacements;

  const perfect = correctPlacements === target.length;

  const feedback = document.getElementById("memory-order-feedback");
  if (feedback) {
    feedback.textContent = perfect ? t("success") : `${t("fail")} (${correctPlacements}/${target.length})`;
    feedback.className = `game-feedback ${perfect ? "ok" : "bad"}`;
  }

  setTimeout(() => {
    currentRoundIndex += 1;

    if (currentRoundIndex < ROUNDS.length) {
      generateRoundData();
      renderCurrentScreen();
    } else {
      finishGame();
    }
  }, 1400);
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  totalCorrectPlacements = 0;
  totalPlacements = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-order"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_order",
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
  gameEnded = true;

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);
  const accuracyPercent = Math.round((currentScore / maxScore) * 100);

  try {
    await completeExercise(currentUser.uid, currentResultId, {
      score: currentScore,
      maxScore,
      metadata: {
        rounds: ROUNDS.length,
        accuracyPercent,
        correctPlacements: totalCorrectPlacements,
        totalPlacements,
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-order completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-order-root");
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
          correctPlacements: totalCorrectPlacements,
          totalPlacements,
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-order abandoned"
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
});
