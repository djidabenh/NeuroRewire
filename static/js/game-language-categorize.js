import { auth } from '/static/js/firebase-config.js';
import { logoutEverywhere } from "/static/js/auth-session.js";
import {
	onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
	createSession,
	completeSession,
	cancelSession,
} from '/static/js/session-service.js';
import {
	startExercise,
	completeExercise,
	abandonExercise,
} from '/static/js/exercise-service.js';
import { speechService } from '/static/js/speech-service.js';

const T = {
	ar: {
		sidebarSubtitle: 'إعادة التأهيل',
		navDashboard: 'الرئيسية',
		navGames: 'التمارين',
		navProgress: 'التقدم',
		navAvc: 'الوقاية من السكتة الدماغية',
		navMotor: 'الحركي والتقييم',
		navSettings: 'الإعدادات',
		logout: 'تسجيل الخروج',
		back: 'رجوع',
		title: 'التصنيف',
		subtitle: 'انظر إلى الصورة ثم انطق الكلمة الصحيحة من بين الكلمات المقترحة.',
		introTitle: 'لعبة التصنيف',
		introText:
			'تظهر صورة حقيقية ومعها كلمتان أو ثلاث كلمات. يجب عليك نطق الكلمة التي تناسب الصورة.',
		start: 'إبدأ',
		level: 'المستوى',
		score: 'النتيجة',
		item: 'العنصر',
		correct: 'نطق صحيح',
		wrong: 'نطق غير صحيح',
		resultTitle: 'النتيجة النهائية',
		playAgain: 'إعادة اللعب',
		returnLanguage: 'العودة إلى اللغة',
		choicesTitle: 'الخيارات الممكنة',
		speakNow: 'تحدث الآن',
		practiceHint: 'اضغط على الميكروفون ثم انطق الكلمة الصحيحة.',
		startMic: 'ابدأ التسجيل',
		retry: 'إعادة المحاولة',
		next: 'التالي',
		wrongAnswers: 'الأخطاء',
		correctAnswers: 'النطق الصحيح',
		recognized: 'النص الملتقط',
		micUnsupported: 'التعرف الصوتي غير مدعوم في هذا المتصفح.',
		micDenied: 'تعذر الوصول إلى الميكروفون أو فشل التعرف الصوتي.',
		imageLoadError: 'تعذر تحميل بعض الصور.',
		assetsMissing: 'بعض الصور غير موجودة داخل static/images/language/.',
		loading: 'جاري التحميل...',
	},
	fr: {
		sidebarSubtitle: 'Rééducation',
		navDashboard: 'Accueil',
		navGames: 'Exercices',
		navProgress: 'Progrès',
		navAvc: 'Prévention AVC',
		navMotor: 'Moteur et bilan',
		navSettings: 'Paramètres',
		logout: 'Se déconnecter',
		back: 'Retour',
		title: 'Catégoriser',
		subtitle:
			'Regardez l’image puis prononcez le bon mot parmi les catégories proposées.',
		introTitle: 'Jeu catégoriser',
		introText:
			'Une vraie image s’affiche avec deux ou trois mots possibles. Vous devez prononcer celui qui correspond à l’image.',
		start: 'Commencer',
		level: 'Niveau',
		score: 'Score',
		item: 'Élément',
		correct: 'Prononciation correcte',
		wrong: 'Prononciation incorrecte',
		resultTitle: 'Résultat final',
		playAgain: 'Rejouer',
		returnLanguage: 'Retour langage',
		choicesTitle: 'Choix possibles',
		speakNow: 'Parlez maintenant',
		practiceHint: 'Appuyez sur le micro puis prononcez le bon mot.',
		startMic: 'Démarrer le micro',
		retry: 'Réessayer',
		next: 'Suivant',
		wrongAnswers: 'Erreurs',
		correctAnswers: 'Prononciations justes',
		recognized: 'Texte reconnu',
		micUnsupported:
			'La reconnaissance vocale n’est pas prise en charge par ce navigateur.',
		micDenied:
			'Impossible d’accéder au micro ou échec de la reconnaissance vocale.',
		imageLoadError: 'Impossible de charger certaines images.',
		assetsMissing:
			'Certaines images sont absentes dans static/images/language/.',
		loading: 'Chargement...',
	},
	en: {
		sidebarSubtitle: 'Rehabilitation',
		navDashboard: 'Home',
		navGames: 'Exercises',
		navProgress: 'Progrès',
		navAvc: 'Stroke Prevention',
		navMotor: 'Motor & Assessment',
		navSettings: 'Settings',
		logout: 'Sign out',
		back: 'Back',
		title: 'Categorize',
		subtitle:
			'Look at the image, then pronounce the correct word among the proposed categories.',
		introTitle: 'Categorize game',
		introText:
			'A real image is shown with two or three possible words. You must pronounce the one that matches the image.',
		start: 'Start',
		level: 'Level',
		score: 'Score',
		item: 'Item',
		correct: 'Correct pronunciation',
		wrong: 'Incorrect pronunciation',
		resultTitle: 'Final result',
		playAgain: 'Play again',
		returnLanguage: 'Back to language',
		choicesTitle: 'Possible choices',
		speakNow: 'Speak now',
		practiceHint: 'Press the microphone, then pronounce the correct word.',
		startMic: 'Start microphone',
		retry: 'Try again',
		next: 'Next',
		wrongAnswers: 'Mistakes',
		correctAnswers: 'Correct pronunciations',
		recognized: 'Recognized text',
		micUnsupported: 'Speech recognition is not supported in this browser.',
		micDenied: 'Could not access the microphone or recognition failed.',
		imageLoadError: 'Some images could not be loaded.',
		assetsMissing: 'Some images are missing in static/images/language/.',
		loading: 'Loading...',
	},
};

const ITEM_LIBRARY = {
	apple: {
		src: '/static/images/language/apple.png',
		correctFr: 'tefaha',
		correctAr: 'تفاحة',
		accepted: ['tefaha', 'tfaha', 'تفاحة', 'te faire', 'sarah'],
		options: [
			{ fr: 'tefaha', ar: 'تفاحة' },
			{ fr: 'kelb', ar: 'كلب' },
			{ fr: 'bab', ar: 'باب' },
		],
	},
	dog: {
		src: '/static/images/language/dog.png',
		correctFr: 'kelb',
		correctAr: 'كلب',
		accepted: ['kelb', 'kalb', 'كلب', 'quel'],
		options: [
			{ fr: 'kelb', ar: 'كلب' },
			{ fr: 'warda', ar: 'وردة' },
			{ fr: 'ma', ar: 'ما' },
		],
	},
	phone: {
		src: '/static/images/language/phone.png',
		correctFr: 'tilifoun',
		correctAr: 'تيليفون',
		accepted: ['tilifoun', 'telefon', 'تيليفون', 'téléphone'],
		options: [
			{ fr: 'tilifoun', ar: 'تيليفون' },
			{ fr: 'khobz', ar: 'خبز' },
			{ fr: 'dar', ar: 'دار' },
		],
	},
	bread: {
		src: '/static/images/language/bread.png',
		correctFr: 'khobz',
		correctAr: 'خبز',
		accepted: [
			'khobz',
			'خبز',
			'krups',
			'obs',
			'hobbs',
			'trop bien',
			'comme ça',
			'rosa',
		],
		options: [
			{ fr: 'khobz', ar: 'خبز' },
			{ fr: 'nahla', ar: 'نحلة' },
			{ fr: 'kas', ar: 'كاس' },
		],
	},
	water: {
		src: '/static/images/language/water.png',
		correctFr: 'ma',
		correctAr: 'ما',
		accepted: ['ma', 'maa', 'ما', 'non'],
		options: [
			{ fr: 'ma', ar: 'ما' },
			{ fr: 'meftah', ar: 'مفتاح' },
			{ fr: 'kelb', ar: 'كلب' },
		],
	},
	door: {
		src: '/static/images/language/door.png',
		correctFr: 'bab',
		correctAr: 'باب',
		accepted: ['bab', 'باب', 'bad', 'babe', 'bah bonne'],
		options: [
			{ fr: 'bab', ar: 'باب' },
			{ fr: 'warda', ar: 'وردة' },
			{ fr: 'douda', ar: 'دودة' },
		],
	},
	chair: {
		src: '/static/images/language/chair.png',
		correctFr: 'koursi',
		correctAr: 'كورسي',
		accepted: [
			'koursi',
			'kursi',
			'كورسي',
			'كرسي',
			'gucci',
			'corsi',
			'koffi',
			'aussi',
			'merci',
			'courcy',
			'coursy',
			'courci',
		],
		options: [
			{ fr: 'koursi', ar: 'كورسي' },
			{ fr: 'ma', ar: 'ما' },
			{ fr: 'bab', ar: 'باب' },
		],
	},
	house: {
		src: '/static/images/language/house.png',
		correctFr: 'dar',
		correctAr: 'دار',
		accepted: ['dar', 'دار'],
		options: [
			{ fr: 'dar', ar: 'دار' },
			{ fr: 'faracha', ar: 'فراشة' },
			{ fr: 'kas', ar: 'كاس' },
		],
	},
	flower: {
		src: '/static/images/language/flower.png',
		correctFr: 'warda',
		correctAr: 'وردة',
		accepted: ['warda', 'وردة', 'pardon', 'volta'],
		options: [
			{ fr: 'warda', ar: 'وردة' },
			{ fr: 'khobz', ar: 'خبز' },
			{ fr: 'faracha', ar: 'فراشة' },
		],
	},
	cup: {
		src: '/static/images/language/cup.png',
		correctFr: 'kas',
		correctAr: 'كاس',
		accepted: ['kas', 'kass', 'كاس', 'casse', 'casque'],
		options: [
			{ fr: 'kas', ar: 'كاس' },
			{ fr: 'richa', ar: 'ريشة' },
			{ fr: 'bab', ar: 'باب' },
		],
	},
	hand: {
		src: '/static/images/language/hand.png',
		correctFr: 'yed',
		correctAr: 'يد',
		accepted: ['yed', 'يد', 'yep', 'diète'],
		options: [
			{ fr: 'yed', ar: 'يد' },
			{ fr: 'nahla', ar: 'نحلة' },
			{ fr: 'dar', ar: 'دار' },
		],
	},
	feather: {
		src: '/static/images/language/feather.png',
		correctFr: 'richa',
		correctAr: 'ريشة',
		accepted: ['richa', 'ريشة', 'raïssa', 'richard', 'richardson'],
		options: [
			{ fr: 'richa', ar: 'ريشة' },
			{ fr: 'khobz', ar: 'خبز' },
			{ fr: 'ma', ar: 'ما' },
		],
	},
	key: {
		src: '/static/images/language/key.png',
		correctFr: 'meftah',
		correctAr: 'مفتاح',
		accepted: ['meftah', 'miftah', 'مفتاح'],
		options: [
			{ fr: 'meftah', ar: 'مفتاح' },
			{ fr: 'warda', ar: 'وردة' },
			{ fr: 'yed', ar: 'يد' },
		],
	},
	worm: {
		src: '/static/images/language/worm.png',
		correctFr: 'douda',
		correctAr: 'دودة',
		accepted: ['douda', 'دودة', 'dodo', 'doda'],
		options: [
			{ fr: 'douda', ar: 'دودة' },
			{ fr: 'dar', ar: 'دار' },
			{ fr: 'kas', ar: 'كاس' },
		],
	},
	butterfly: {
		src: '/static/images/language/butterfly.png',
		correctFr: 'faracha',
		correctAr: 'فراشة',
		accepted: ['faracha', 'farasha', 'فراشة', 'formation'],
		options: [
			{ fr: 'faracha', ar: 'فراشة' },
			{ fr: 'khobz', ar: 'خبز' },
			{ fr: 'nahla', ar: 'نحلة' },
		],
	},
	bee: {
		src: '/static/images/language/bee.png',
		correctFr: 'nahla',
		correctAr: 'نحلة',
		accepted: ['nahla', 'نحلة'],
		options: [
			{ fr: 'nahla', ar: 'نحلة' },
			{ fr: 'bab', ar: 'باب' },
			{ fr: 'kas', ar: 'كاس' },
		],
	},
};

// Progression de difficulté (nombre d'items par niveau) :
// Niveau 1 : 3 items  → très facile (peu d'items, répétition réduite)
// Niveau 2 : 3 items
// Niveau 3 : 4 items
// Niveau 4 : 4 items  → modéré
// Niveau 5 : 5 items  → difficile
// Niveau 6 : 5 items  → très difficile (max items, endurance)
// Progression de difficulté (nombre de questions + temps par question) :
// Niveau 1 : 3 questions, pas de timer               → très facile
// Niveau 2 : 3 questions, 20s par question
// Niveau 3 : 4 questions, 16s par question
// Niveau 4 : 4 questions, 13s par question
// Niveau 5 : 5 questions, 11s par question            → difficile
// Niveau 6 : 5 questions, 8s par question             → très difficile
const LEVELS = [
  { count: 3, timeLimitSec: 0  },
  { count: 3, timeLimitSec: 20 },
  { count: 4, timeLimitSec: 16 },
  { count: 4, timeLimitSec: 13 },
  { count: 5, timeLimitSec: 11 },
  { count: 5, timeLimitSec: 8  }
];
const ITEM_KEYS = Object.keys(ITEM_LIBRARY);

let currentLang = localStorage.getItem('nrw_lang') || 'ar';
let currentUser = null;
let currentSessionId = null;
let currentResultId = null;
let currentLevelIndex = 0;
let currentScore = 0;
let wrongAnswers = 0;
let itemCursor = 0;
let levelItems = [];
let gameEnded = false;
let _langTimer = null;
let _langTimeLeft = 0;
let loadedAssets = new Set();
let missingAssets = [];
let usedKeys = new Set();
let currentRecognitionInProgress = false;

function t(key) {
	return T[currentLang][key];
}

function shuffle(arr) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function showGlobalLoading(show, text = '') {
	let overlay = document.getElementById('global-loader');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'global-loader';
		overlay.className = 'global-loading-overlay';
		overlay.innerHTML = `
      <span class="loading-spinner" style="width:40px; height:40px; border-width:4px;"></span>
      <div class="global-loading-text" id="global-loader-text"></div>
    `;
		document.body.appendChild(overlay);
	}
	const txtEl = document.getElementById('global-loader-text');
	txtEl.textContent = text || t('loading');
	if (show) overlay.classList.add('show');
	else overlay.classList.remove('show');
}

function normalizeText(str) {
	return (str || '')
		.toLowerCase()
		.trim()
		.replace(/[.,!?;:]/g, '')
		.replace(/\s+/g, ' ');
}

function matchesAccepted(transcript, acceptedList) {
	const clean = normalizeText(transcript);
	if (!clean) return false;
	return acceptedList.some(candidate => normalizeText(candidate) === clean);
}

function getSpeechRecognitionCtor() {
	return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function recognizeOnce(SpeechCtor) {
	return new Promise((resolve, reject) => {
		const recognition = new SpeechCtor();
		recognition.lang =
			currentLang === 'ar' ? 'ar-DZ' : currentLang === 'fr' ? 'fr-FR' : 'en-US';
		recognition.interimResults = false;
		recognition.maxAlternatives = 3;
		recognition.continuous = false;

		let done = false;

		recognition.onresult = event => {
			if (done) return;
			done = true;

			const transcripts = [];
			for (let i = 0; i < event.results.length; i += 1) {
				for (let j = 0; j < event.results[i].length; j += 1) {
					transcripts.push(event.results[i][j].transcript);
				}
			}

			recognition.stop();
			resolve((transcripts[0] || '').trim());
		};

		recognition.onerror = event => {
			if (done) return;
			done = true;
			recognition.stop();
			reject(new Error(event.error || 'speech-error'));
		};

		recognition.onnomatch = () => {
			if (done) return;
			done = true;
			recognition.stop();
			resolve('');
		};

		recognition.onend = () => {
			if (done) return;
			done = true;
			resolve('');
		};

		recognition.start();
	});
}

function updateTexts() {
	document.documentElement.lang = currentLang;
	document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

	document.getElementById('sidebar-subtitle').textContent =
		t('sidebarSubtitle');
	document.getElementById('nav-dashboard').textContent = t('navDashboard');
	document.getElementById('nav-games').textContent = t('navGames');
	document.getElementById('nav-progress').textContent = t('navProgress');
	document.getElementById('nav-avc').textContent = t('navAvc');
	document.getElementById('nav-motor').textContent = t('navMotor');
	document.getElementById('nav-settings').textContent = t('navSettings');
	document.getElementById('logout-text').textContent = t('logout');
	document.getElementById('back-text').textContent = t('back');
	document.getElementById('game-title').textContent = t('title');
	document.getElementById('game-subtitle').textContent = t('subtitle');
	document.getElementById('game-round-label').textContent =
		`${t('level')} ${Math.min(currentLevelIndex + 1, LEVELS.length)} / ${LEVELS.length}`;
	document.getElementById('game-score-label').textContent =
		`${t('score')} : ${currentScore}`;

	document.querySelectorAll('.slp').forEach(btn => btn.classList.remove('on'));
	const activeBtn = document.getElementById(`lang-${currentLang}`);
	if (activeBtn) activeBtn.classList.add('on');
}

window.setGameLang = function setGameLang(lang) {
	localStorage.setItem('nrw_lang', lang);
	currentLang = lang;
	updateTexts();
	renderCurrentScreen();
};

async function preloadImages() {
	const entries = Object.entries(ITEM_LIBRARY);
	const results = await Promise.all(
		entries.map(
			([key, asset]) =>
				new Promise(resolve => {
					const img = new Image();
					img.onload = () => resolve({ key, ok: true });
					img.onerror = () => resolve({ key, ok: false });
					img.src = asset.src;
				}),
		),
	);

	loadedAssets = new Set(results.filter(r => r.ok).map(r => r.key));
	missingAssets = results.filter(r => !r.ok).map(r => r.key);
}

function renderMissingAssets() {
	const root = document.getElementById('language-categorize-root');
	root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t('imageLoadError')}</h3>
      <p>${t('assetsMissing')}</p>
      <div class="memory-missing-list">
        ${missingAssets.map(key => `<span class="memory-missing-chip">${key}</span>`).join('')}
      </div>
      <div class="game-actions">
        <button class="btn-sec" onclick="window.location.href='/exercises/language'">${t('returnLanguage')}</button>
      </div>
    </div>
  `;
}

function pickLevelItems(levelIndex) {
	const count = LEVELS[levelIndex].count;
	let available = ITEM_KEYS.filter(
		key => loadedAssets.has(key) && !usedKeys.has(key),
	);

	if (available.length < count) {
		usedKeys = new Set();
		available = ITEM_KEYS.filter(key => loadedAssets.has(key));
	}

	const picked = shuffle(available).slice(0, count);
	picked.forEach(k => usedKeys.add(k));
	return picked;
}

function renderIntro() {
	updateTexts();

	const root = document.getElementById('language-categorize-root');

	if (missingAssets.length > 0) {
		renderMissingAssets();
		return;
	}

	root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t('introTitle')}</h3>
      <p>${t('introText')}</p>
      <button class="go-btn" id="start-language-categorize-btn">${t('start')}</button>
    </div>
  `;

	document.getElementById('start-language-categorize-btn').onclick = startGame;
}

function startlangCatTimer(totalSec) {
  clearInterval(_langTimer);
  _langTimeLeft = totalSec;
  _langTimer = setInterval(() => {
    _langTimeLeft -= 1;
    const el = document.getElementById("lang-cat-timer-val");
    if (el) el.textContent = _langTimeLeft;
    const pill = document.getElementById("lang-cat-timer-pill");
    if (pill && _langTimeLeft <= 8) pill.style.color = "var(--danger, #e74c3c)";
    if (_langTimeLeft <= 0) {
      clearInterval(_langTimer);
      if (!gameEnded) {
        _langTimeLeft = 0;
        finishGame();
      }
    }
  }, 1000);
}

function stoplangCatTimer() {
  clearInterval(_langTimer);
  _langTimeLeft = 0;
}

function renderCurrentScreen() {
	updateTexts();

	if (!levelItems.length && !gameEnded) {
		renderIntro();
		return;
	}

	renderPracticeItem();
}

function renderPracticeItem() {
	updateTexts();

	const root = document.getElementById('language-categorize-root');
	const key = levelItems[itemCursor];
	const asset = ITEM_LIBRARY[key];

	root.innerHTML = `
    <div class="language-shell-card">
      <div class="quiz-meta-row">
        <div class="quiz-mini-badge">${t('item')} ${itemCursor + 1} / ${levelItems.length}</div>
        <div class="quiz-mini-badge">${t('wrongAnswers')} : ${wrongAnswers}</div>
      </div>

      <div class="language-image-card">
        <img src="${asset.src}" alt="${asset.correctFr}" class="language-main-image" draggable="false">
      </div>

      <div class="language-pronunciation-card language-pronunciation-card-main">
        <div class="language-pronunciation-head">${t('choicesTitle')}</div>
        <div class="language-category-options">
          ${asset.options
						.map(
							opt => `
            <span class="language-category-chip">
              <span class="language-chip-ar">${opt.ar}</span>
              <span class="language-chip-fr">${opt.fr}</span>
            </span>
          `,
						)
						.join('')}
        </div>
        <div class="language-pronunciation-hint">${t('practiceHint')}</div>
      </div>

      <div class="language-action-row">
        <button class="go-btn" id="start-mic-btn">${t('startMic')}</button>
        <button class="btn-sec" id="retry-btn">${t('retry')}</button>
        <button class="btn-sec" id="next-btn" disabled>${t('next')}</button>
      </div>

      <div class="recording-progress-container" id="mic-progress-container">
        <div class="recording-progress-bar" id="mic-progress-bar"></div>
      </div>

      <div class="game-feedback" id="language-categorize-feedback"></div>
    </div>
  `;

	document.getElementById('start-mic-btn').onclick =
		startRecognitionForCurrentItem;
	document.getElementById('retry-btn').onclick = () => renderPracticeItem();
	document.getElementById('next-btn').onclick = goNextItem;
}

async function startRecognitionForCurrentItem() {
	const key = levelItems[itemCursor];
	const asset = ITEM_LIBRARY[key];
	const fb = document.getElementById('language-categorize-feedback');
	const nextBtn = document.getElementById('next-btn');
	const micBtn = document.getElementById('start-mic-btn');
	const progCont = document.getElementById('mic-progress-container');
	const progBar = document.getElementById('mic-progress-bar');

	micBtn.disabled = true;
	micBtn.classList.add('mic-pulse');

	fb.textContent = t('speakNow');
	fb.className = 'game-feedback';

	progCont.classList.add('show');
	progBar.style.width = '0%';

	// Animate progress bar over 3 seconds
	let start = Date.now();
	const duration = 3000;
	const timer = setInterval(() => {
		let elapsed = Date.now() - start;
		let pct = Math.min(100, (elapsed / duration) * 100);
		progBar.style.width = pct + '%';
		if (elapsed >= duration) clearInterval(timer);
	}, 50);

	try {
		const blob = await speechService.startRecording(duration);

		clearInterval(timer);
		progCont.classList.remove('show');
		micBtn.classList.remove('mic-pulse');

		micBtn.innerHTML = `<span class="loading-spinner"></span>`;
		fb.innerHTML = `<div class="processing-view"><span class="loading-spinner"></span> <span>${t('loading')}</span></div>`;

		const result = await speechService.recognize(
			blob,
			currentLang === 'ar' ? 'ar-DZ' : currentLang === 'fr' ? 'fr-FR' : 'en-US',
		);
		const transcript = result.text || '';
		const ok = matchesAccepted(transcript, asset.accepted);

		if (ok) {
	currentScore += 1;
	fb.textContent = t('correct');
	fb.className = 'game-feedback ok';
} else {
	wrongAnswers += 1;
	fb.textContent = t('wrong');
	fb.className = 'game-feedback bad';
}

		nextBtn.disabled = false;
	} catch (err) {
		console.error(err);
		fb.textContent = t('micDenied');
		fb.className = 'game-feedback bad';
		if (progCont) progCont.classList.remove('show');
		micBtn.classList.remove('mic-pulse');
	} finally {
		micBtn.disabled = false;
		micBtn.textContent = t('startMic');
	}
}

function goNextItem() {
	itemCursor += 1;

	if (itemCursor < levelItems.length) {
		renderPracticeItem();
		return;
	}

	currentLevelIndex += 1;

	if (currentLevelIndex < LEVELS.length) {
		levelItems = pickLevelItems(currentLevelIndex);
		itemCursor = 0;
		renderPracticeItem();
	} else {
		finishGame();
	}
}

async function startGame() {
	if (!currentUser) return;

	currentLevelIndex = 0;
	currentScore = 0;
	wrongAnswers = 0;
	itemCursor = 0;
	usedKeys = new Set();
	gameEnded = false;

	levelItems = pickLevelItems(0);

	const maxScore = LEVELS.reduce((sum, v) => sum + v.count, 0);

	showGlobalLoading(true);
	try {
		const session = await createSession(currentUser.uid, {
			source: 'language-categorize',
		});
		currentSessionId = session.sessionId;

		const exercise = await startExercise(currentUser.uid, {
			sessionId: currentSessionId,
			exerciseKey: 'language_categorize',
			category: 'language',
			maxScore,
			metadata: {
				rounds: LEVELS.length,
				itemsShown: maxScore,
				correctPronunciations: 0,
				wrongPronunciations: 0,
				speechRecognitionEnabled: true,
				mode: 'categorize-pronunciation',
				assetMode: 'local-images',
				imagePoolSize: ITEM_KEYS.length,
			},
		});
		currentResultId = exercise.resultId;

		renderPracticeItem();
	} catch (e) {
		console.error(e);
	} finally {
		showGlobalLoading(false);
	}
}

async function finishGame() {
  stoplangCatTimer();
	gameEnded = true;
	const maxScore = LEVELS.reduce((sum, v) => sum + v.count, 0);
	const accuracyPercent = Math.round((currentScore / maxScore) * 100);

	showGlobalLoading(true);
	try {
		await completeExercise(currentUser.uid, currentResultId, {
			score: currentScore,
			maxScore,
			metadata: {
				rounds: LEVELS.length,
				itemsShown: maxScore,
				correctPronunciations: currentScore,
				wrongPronunciations: wrongAnswers,
				accuracyPercent,
				speechRecognitionEnabled: true,
				mode: 'categorize-pronunciation',
				assetMode: 'local-images',
				imagePoolSize: ITEM_KEYS.length,
			},
		});

		await completeSession(currentUser.uid, currentSessionId, {
			notes: 'language-categorize completed',
		});
	} catch (e) {
		console.error(e);
	} finally {
		showGlobalLoading(false);
	}

	const root = document.getElementById('language-categorize-root');
	root.innerHTML = `
    <div class="intro-c language-intro-card">
      <h3>${t('resultTitle')}</h3>
      <div class="memory-final-score">${currentScore} / ${maxScore}</div>
      <p>${t('correctAnswers')} : ${currentScore}</p>
      <p>${t('wrongAnswers')} : ${wrongAnswers}</p>
      <p>${t('score')} : ${accuracyPercent}%</p>
      <div class="game-actions">
        <button class="go-btn" onclick="window.location.reload()">${t('playAgain')}</button>
        <button class="btn-sec" onclick="window.location.href='/exercises/language'">${t('returnLanguage')}</button>
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
					correctPronunciations: currentScore,
					wrongPronunciations: wrongAnswers,
				},
			});
		}

		if (currentUser && currentSessionId && !gameEnded) {
			await cancelSession(currentUser.uid, currentSessionId, {
				notes: 'language-categorize abandoned',
			});
		}
	} catch (e) {
		console.error(e);
	}

	window.location.href = '/exercises/language';
};

window.logout = logoutEverywhere;

onAuthStateChanged(auth, async user => {
	if (!user) {
		window.location.href = '/';
		return;
	}

	currentUser = user;
	await preloadImages();
	renderIntro();
});
