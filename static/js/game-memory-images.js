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
    title: "حفظ الصور",
    subtitle: "شاهد الصور ثم تعرّف عليها لاحقًا.",
    level: "المستوى",
    score: "النتيجة",
    introTitle: "لعبة حفظ الصور",
    introText: "سيتم عرض مجموعة من الصور لثوانٍ قليلة، ثم ستظهر شبكة أكبر. اختر فقط الصور التي شاهدتها.",
    start: "إبدأ",
    memorize: "احفظ هذه الصور جيدًا",
    continue: "متابعة",
    chooseSeen: "اختر الصور التي رأيتها",
    validate: "تأكيد الإجابة",
    success: "إجابة صحيحة",
    fail: "إجابة غير كاملة",
    resultTitle: "النتيجة النهائية",
    playAgain: "إعادة اللعب",
    returnMemory: "العودة إلى الذاكرة",
    loading: "جاري التحميل...",
    imageLoadError: "تعذر تحميل بعض الصور.",
    assetsMissing: "بعض الصور غير موجودة داخل static/images/objects/.",
    imageLabelFallback: "صورة"
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
    title: "Mémoriser les images",
    subtitle: "Regardez puis retrouvez les images vues.",
    level: "Niveau",
    score: "Score",
    introTitle: "Jeu de mémorisation d’images",
    introText: "Un groupe d’images sera affiché pendant quelques secondes, puis une grille plus grande apparaîtra. Sélectionnez uniquement les images que vous avez vues.",
    start: "Commencer",
    memorize: "Mémorisez bien ces images",
    continue: "Continuer",
    chooseSeen: "Choisissez les images vues",
    validate: "Valider la réponse",
    success: "Bonne réponse",
    fail: "Réponse incomplète",
    resultTitle: "Résultat final",
    playAgain: "Rejouer",
    returnMemory: "Retour mémoire",
    loading: "Chargement...",
    imageLoadError: "Impossible de charger certaines images.",
    assetsMissing: "Certaines images sont absentes dans static/images/objects/.",
    imageLabelFallback: "Image"
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
    title: "Memorize images",
    subtitle: "Observe then find the images you saw.",
    level: "Level",
    score: "Score",
    introTitle: "Image memory game",
    introText: "A group of images will be shown for a few seconds, then a larger grid will appear. Select only the images you actually saw.",
    start: "Start",
    memorize: "Memorize these images carefully",
    continue: "Continue",
    chooseSeen: "Choose the images you saw",
    validate: "Validate answer",
    success: "Correct answer",
    fail: "Incomplete answer",
    resultTitle: "Final result",
    playAgain: "Play again",
    returnMemory: "Back to memory",
    loading: "Loading...",
    imageLoadError: "Some images could not be loaded.",
    assetsMissing: "Some images are missing in static/images/objects/.",
    imageLabelFallback: "Image"
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
// Niveau 1 : 2 images sur 5, affichage 5s  → très facile
// Niveau 2 : 3 images sur 6, affichage 4.5s
// Niveau 3 : 4 images sur 8, affichage 4s
// Niveau 4 : 5 images sur 10, affichage 3.5s
// Niveau 5 : 6 images sur 12, affichage 3s  → difficile
// Niveau 6 : 7 images sur 14, affichage 2.5s → très difficile (+ plus de distracteurs)
// Progression de difficulté :
// Niveau 1 : 2 images à mémoriser, 5 choix, 5s mémorisation   → très facile
// Niveau 2 : 3 images, 6 choix, 5s
// Niveau 3 : 4 images, 9 choix, 5s
// Niveau 4 : 5 images, 11 choix, 5s
// Niveau 5 : 6 images, 13 choix, 5s                         → difficile
// Niveau 6 : 7 images, 16 choix, 5s                           → très difficile
const ROUNDS = [
  { shown: 2, totalChoices: 5,  displayMs: 5000 },
  { shown: 3, totalChoices: 6,  displayMs: 5000 },
  { shown: 4, totalChoices: 9,  displayMs: 5000 },
  { shown: 5, totalChoices: 11, displayMs: 5000 },
  { shown: 6, totalChoices: 13, displayMs: 5500 },
  { shown: 7, totalChoices: 16, displayMs: 5500 }
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

function renderImageCard(key, cardClass = "") {
  const asset = IMAGE_LIBRARY[key];
  const label = getImageLabel(key);

  return `
    <div class="${cardClass}">
      <div class="memory-card-media">
        <img
          src="${asset.src}"
          alt="${label}"
          class="memory-real-img"
          loading="eager"
          draggable="false"
        >
      </div>
    </div>
  `;
}

function renderMissingAssetsMessage() {
  const root = document.getElementById("memory-game-root");
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

function renderIntro() {
  const root = document.getElementById("memory-game-root");

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  root.innerHTML = `
    <div class="intro-c">
      <div class="ib lg" style="margin:0 auto">
        <svg viewBox="0 0 24 24">
          <path d="M9.5 2a2.5 2.5 0 0 1 4.9.44C16.1 3 17.5 4.4 17.5 6c0 .34-.04.67-.11 1H18a3 3 0 0 1 3 3c0 1.1-.6 2.1-1.5 2.6A3 3 0 0 1 18 18h-.5a2.5 2.5 0 0 1-4.9.44A2.5 2.5 0 0 1 9.5 16H9a3 3 0 0 1-1.5-5.6A3 3 0 0 1 9 4h.11A2.5 2.5 0 0 1 9.5 2z"/>
        </svg>
      </div>
      <h3>${t("introTitle")}</h3>
      <p>${t("introText")}</p>
      <button class="go-btn" id="start-memory-game-btn">${t("start")}</button>
    </div>
  `;

  document.getElementById("start-memory-game-btn").onclick = startGame;
}

function generateRoundData() {
  const config = ROUNDS[currentRoundIndex];
  const availableKeys = IMAGE_KEYS.filter((key) => loadedAssets.has(key));

  const shownImages = shuffle(availableKeys).slice(0, config.shown);
  const distractors = shuffle(
    availableKeys.filter((key) => !shownImages.includes(key))
  ).slice(0, config.totalChoices - config.shown);

  const choices = shuffle([...shownImages, ...distractors]);

  currentRoundData = {
    shownImages,
    choices,
    selected: new Set(),
    phase: "memorize"
  };
}

function renderCurrentScreen() {
  updateStaticTexts();

  if (!currentRoundData) {
    renderIntro();
    return;
  }

  if (currentRoundData.phase === "memorize") {
    renderMemorizePhase();
  } else if (currentRoundData.phase === "select") {
    renderSelectPhase();
  } else if (currentRoundData.phase === "result") {
    renderResultPhase();
  }
}

function renderMemorizePhase() {
  const root = document.getElementById("memory-game-root");
  const config = ROUNDS[currentRoundIndex];
  const totalSec = Math.round(config.displayMs / 1000);

  root.innerHTML = `
    <div class="game-note">${t("memorize")}</div>
    <div class="memory-order-section-title" style="text-align:center;margin-bottom:8px">
      <span id="mem-img-countdown" style="font-size:1.1rem;font-weight:700;color:var(--primary)">${totalSec}s</span>
    </div>
    <div class="memory-preview-grid">
      ${currentRoundData.shownImages.map((key) => renderImageCard(key, "memory-preview-card")).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="continue-memory-btn">${t("continue")}</button>
    </div>
  `;

  let secondsLeft = totalSec;
  const cdEl = document.getElementById("mem-img-countdown");
  const autoTimer = setInterval(() => {
    secondsLeft -= 1;
    if (cdEl) cdEl.textContent = `${secondsLeft}s`;
    if (secondsLeft <= 0) {
      clearInterval(autoTimer);
      currentRoundData.phase = "select";
      renderCurrentScreen();
    }
  }, 1000);

  document.getElementById("continue-memory-btn").onclick = () => {
    clearInterval(autoTimer);
    currentRoundData.phase = "select";
    renderCurrentScreen();
  };
}

function renderSelectPhase() {
  const root = document.getElementById("memory-game-root");
  root.innerHTML = `
    <div class="game-note">${t("chooseSeen")}</div>
    <div class="memory-choice-grid">
      ${currentRoundData.choices.map((key) => `
        <div class="memory-choice-card ${currentRoundData.selected.has(key) ? "selected" : ""}" data-key="${key}">
  <div class="memory-card-media">
    <img
      src="${IMAGE_LIBRARY[key].src}"
      alt="${getImageLabel(key)}"
      class="memory-real-img"
      loading="eager"
      draggable="false"
    >
  </div>
</div>
      `).join("")}
    </div>
    <div class="game-actions">
      <button class="go-btn" id="validate-memory-btn">${t("validate")}</button>
    </div>
    <div class="game-feedback" id="memory-feedback"></div>
  `;

  document.querySelectorAll(".memory-choice-card").forEach((card) => {
    card.onclick = () => {
      const { key } = card.dataset;

      if (currentRoundData.selected.has(key)) {
        currentRoundData.selected.delete(key);
      } else {
        currentRoundData.selected.add(key);
      }

      renderSelectPhase();
    };
  });

  document.getElementById("validate-memory-btn").onclick = validateRound;
}

function validateRound() {
  const seenSet = new Set(currentRoundData.shownImages);
  const selectedSet = currentRoundData.selected;

  let roundScore = 0;
  for (const key of seenSet) {
    if (selectedSet.has(key)) roundScore += 1;
  }

  currentScore += roundScore;

  document.querySelectorAll(".memory-choice-card").forEach((card) => {
    const { key } = card.dataset;

    if (seenSet.has(key) && selectedSet.has(key)) {
      card.classList.add("ok");
    } else if (selectedSet.has(key) && !seenSet.has(key)) {
      card.classList.add("bad");
    } else if (seenSet.has(key) && !selectedSet.has(key)) {
      card.classList.add("missed");
    }

    card.style.pointerEvents = "none";
  });

  const feedback = document.getElementById("memory-feedback");
  const perfect = roundScore === currentRoundData.shownImages.length && selectedSet.size === seenSet.size;

  feedback.textContent = perfect ? t("success") : t("fail");
  feedback.className = `game-feedback ${perfect ? "ok" : "bad"}`;

  currentRoundData.phase = "result";

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

function renderResultPhase() {
  // phase transitoire gérée par validateRound + timeout
}

async function startGame() {
  if (!currentUser) return;

  if (missingAssets.length > 0) {
    renderMissingAssetsMessage();
    return;
  }

  currentRoundIndex = 0;
  currentScore = 0;
  gameEnded = false;
  updateStaticTexts();

  const maxScore = ROUNDS.reduce((sum, round) => sum + round.shown, 0);

  const session = await createSession(currentUser.uid, {
    source: "memory-images"
  });
  currentSessionId = session.sessionId;

  const exercise = await startExercise(currentUser.uid, {
    sessionId: currentSessionId,
    exerciseKey: "memory_images",
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
        assetMode: "local-images",
        imagePoolSize: IMAGE_KEYS.length
      }
    });

    await completeSession(currentUser.uid, currentSessionId, {
      notes: "memory-images completed"
    });
  } catch (error) {
    console.error("Save result error:", error);
  }

  const root = document.getElementById("memory-game-root");
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
          assetMode: "local-images"
        }
      });
    }

    if (currentUser && currentSessionId && !gameEnded) {
      await cancelSession(currentUser.uid, currentSessionId, {
        notes: "memory-images abandoned"
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
