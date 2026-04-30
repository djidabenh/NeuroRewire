import { getSavedLang, setSavedLang, populateWilayaSelect } from "./app-shared.js";

const translations = {
  ar: {
    dir: "rtl",
    lang: "ar",
    login_title: "تسجيل الدخول",
    login_sub: "سجّل الدخول للوصول إلى مساحة المريض الخاصة بك.",
    login_btn: "تسجيل الدخول",
    register_title: "إنشاء حساب",
    register_sub: "أدخل معلوماتك للبدء.",
    register_btn: "إنشاء حساب",
    no_account: "ليس لديك حساب؟",
    create_account: "إنشاء حساب",
    have_account: "لديك حساب بالفعل؟",
    sign_in: "تسجيل الدخول",
    first_name: "الاسم",
    last_name: "اللقب",
    birth_date: "تاريخ الميلاد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirm_password: "تأكيد كلمة المرور",
    wilaya: "الولاية",
    phone: "الهاتف",
    hospital: "المستشفى",
    phone_placeholder: "أدخل رقم هاتفك",
    hospital_placeholder: "أدخل اسم المستشفى",
    first_name_placeholder: "أدخل اسمك",
    last_name_placeholder: "أدخل لقبك",
    email_placeholder: "patient@domaine.com",
    password_placeholder: "••••••••",
    tagline_login: "منصة لإعادة التأهيل المعرفي والحركي، بتجربة بسيطة وسلسة ومناسبة للجميع.",
    tagline_register: "انضم إلى المنصة لبدء مسار إعادة تأهيل منظم ومحفّز.",
    feat1: "متابعة شخصية للمريض",
    feat2: "تمارين تفاعلية ممتعة",
    feat3: "واجهة متعددة اللغات",
    wilaya_placeholder: "اختر الولاية",
    required_star: "*",
    hint_firstname: "الاسم يجب أن يحتوي على حروف فقط.",
    hint_lastname: "اللقب يجب أن يحتوي على حروف فقط.",
    hint_birthdate: "اختر تاريخ ميلاد صحيحًا وغير مستقبلي.",
    hint_email: "يجب أن يكون البريد الإلكتروني بهذا الشكل: nom@domaine.com",
    hint_password: "8 أحرف على الأقل، مع حرف كبير وحرف صغير ورقم.",
    hint_confirm_password: "يجب أن تكون مطابقة لكلمة المرور.",
    hint_wilaya: "يرجى اختيار الولاية.",
    hint_phone: "أرقام فقط، مع + اختياري في البداية.",
    hint_hospital: "يرجى إدخال اسم المستشفى."
  },
  fr: {
    dir: "ltr",
    lang: "fr",
    login_title: "Connexion",
    login_sub: "Connectez-vous pour accéder à votre espace patient.",
    login_btn: "Se connecter",
    register_title: "Créer un compte",
    register_sub: "Renseignez vos informations pour commencer.",
    register_btn: "Créer un compte",
    no_account: "Vous n’avez pas encore de compte ?",
    create_account: "Créer un compte",
    have_account: "Vous avez déjà un compte ?",
    sign_in: "Se connecter",
    first_name: "Nom",
    last_name: "Prénom",
    birth_date: "Date de naissance",
    email: "Email",
    password: "Mot de passe",
    confirm_password: "Confirmer le mot de passe",
    wilaya: "Wilaya",
    phone: "Téléphone",
    hospital: "Hôpital",
    phone_placeholder: "Entrez votre numéro de téléphone",
    hospital_placeholder: "Entrez votre hôpital",
    first_name_placeholder: "Entrez votre nom",
    last_name_placeholder: "Entrez votre prénom",
    email_placeholder: "patient@domaine.com",
    password_placeholder: "••••••••",
    tagline_login: "Plateforme de rééducation cognitive et motrice, pensée pour une expérience simple, douce et accessible.",
    tagline_register: "Rejoignez la plateforme pour commencer un parcours de rééducation structuré et motivant.",
    feat1: "Suivi personnalisé du patient",
    feat2: "Exercices interactifs et ludiques",
    feat3: "Interface multilingue adaptée",
    wilaya_placeholder: "Choisir la wilaya",
    required_star: "*",
    hint_firstname: "Le nom doit contenir uniquement des lettres.",
    hint_lastname: "Le prénom doit contenir uniquement des lettres.",
    hint_birthdate: "Choisissez une date valide, non future.",
    hint_email: "L’email doit être au format nom@domaine.com.",
    hint_password: "Au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
    hint_confirm_password: "Doit être identique au mot de passe.",
    hint_wilaya: "Veuillez sélectionner votre wilaya.",
    hint_phone: "Chiffres uniquement, avec + optionnel au début.",
    hint_hospital: "Veuillez entrer le nom de votre hôpital."
  },
  en: {
    dir: "ltr",
    lang: "en",
    login_title: "Sign in",
    login_sub: "Sign in to access your patient space.",
    login_btn: "Sign in",
    register_title: "Create account",
    register_sub: "Fill in your information to get started.",
    register_btn: "Create account",
    no_account: "Don’t have an account?",
    create_account: "Create account",
    have_account: "Already have an account?",
    sign_in: "Sign in",
    first_name: "First name",
    last_name: "Last name",
    birth_date: "Date of birth",
    email: "Email",
    password: "Password",
    confirm_password: "Confirm password",
    wilaya: "Wilaya",
    phone: "Phone",
    hospital: "Hospital",
    phone_placeholder: "Enter your phone number",
    hospital_placeholder: "Enter your hospital",
    first_name_placeholder: "Enter your first name",
    last_name_placeholder: "Enter your last name",
    email_placeholder: "patient@domain.com",
    password_placeholder: "••••••••",
    tagline_login: "A cognitive and motor rehabilitation platform designed for a simple, smooth, accessible experience.",
    tagline_register: "Join the platform to start a structured and motivating rehabilitation journey.",
    feat1: "Personalized patient follow-up",
    feat2: "Interactive and engaging exercises",
    feat3: "Multilingual interface",
    wilaya_placeholder: "Choose wilaya",
    required_star: "*",
    hint_firstname: "First name must contain letters only.",
    hint_lastname: "Last name must contain letters only.",
    hint_birthdate: "Choose a valid date that is not in the future.",
    hint_email: "Email must follow the format name@domain.com.",
    hint_password: "At least 8 characters, one uppercase, one lowercase and one digit.",
    hint_confirm_password: "Must match the password.",
    hint_wilaya: "Please select your wilaya.",
    hint_phone: "Digits only, with optional + at the beginning.",
    hint_hospital: "Please enter your hospital name."
  }
};

window.currentLang = getSavedLang();

window.showPage = function(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
    page.style.display = "none";
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
    target.style.display = "flex";
  }
};

function setButtonStates(lang) {
  document.querySelectorAll(".lp").forEach((btn) => {
    btn.classList.remove("on");
    if (btn.dataset.lang === lang) {
      btn.classList.add("on");
    }
  });
}

function setLabelText(selector, text) {
  const label = document.querySelector(selector);
  if (!label) return;
  label.textContent = text;
}

function applyTranslations(lang) {
  const t = translations[lang];
  window.currentLang = lang;
  setSavedLang(lang);

  document.documentElement.lang = t.lang;
  document.documentElement.dir = t.dir;

  const loginPage = document.getElementById("page-login");
  const registerPage = document.getElementById("page-register");

  loginPage.querySelector("h2").textContent = t.login_title;
  loginPage.querySelector(".sub").textContent = t.login_sub;
  loginPage.querySelector(".ap-tag").textContent = t.tagline_login;

  const loginFeatTexts = loginPage.querySelectorAll(".ap-feat span:last-child");
  if (loginFeatTexts[0]) loginFeatTexts[0].textContent = t.feat1;
  if (loginFeatTexts[1]) loginFeatTexts[1].textContent = t.feat2;
  if (loginFeatTexts[2]) loginFeatTexts[2].textContent = t.feat3;

  setLabelText('label[for="login-email"]', t.email);
  setLabelText('label[for="login-password"]', t.password);

  document.getElementById("login-email").placeholder = t.email_placeholder;
  document.getElementById("login-password").placeholder = t.password_placeholder;
  document.getElementById("login-btn").textContent = t.login_btn;
  loginPage.querySelector(".asw span").textContent = `${t.no_account} `;
  loginPage.querySelector(".asw a").textContent = t.create_account;

  registerPage.querySelector("h2").textContent = t.register_title;
  registerPage.querySelector(".sub").textContent = t.register_sub;
  registerPage.querySelector(".ap-tag").textContent = t.tagline_register;

  const registerFeatTexts = registerPage.querySelectorAll(".ap-feat span:last-child");
  if (registerFeatTexts[0]) registerFeatTexts[0].textContent = t.feat1;
  if (registerFeatTexts[1]) registerFeatTexts[1].textContent = t.feat2;
  if (registerFeatTexts[2]) registerFeatTexts[2].textContent = t.feat3;

  setLabelText('label[for="reg-firstname"]', t.first_name);
  setLabelText('label[for="reg-lastname"]', t.last_name);
  setLabelText('label[for="reg-birthdate"]', t.birth_date);
  setLabelText('label[for="reg-email"]', t.email);
  setLabelText('label[for="reg-password"]', t.password);
  setLabelText('label[for="reg-confirm-password"]', t.confirm_password);
  setLabelText('label[for="reg-wilaya"]', t.wilaya);
  setLabelText('label[for="reg-phone"]', t.phone);
  setLabelText('label[for="reg-hospital"]', t.hospital);

  document.getElementById("reg-firstname").placeholder = t.first_name_placeholder;
  document.getElementById("reg-lastname").placeholder = t.last_name_placeholder;
  document.getElementById("reg-email").placeholder = t.email_placeholder;
  document.getElementById("reg-password").placeholder = t.password_placeholder;
  document.getElementById("reg-confirm-password").placeholder = t.password_placeholder;
  document.getElementById("reg-phone").placeholder = t.phone_placeholder;
  document.getElementById("reg-hospital").placeholder = t.hospital_placeholder;

  const errorTexts = {
    "error-reg-firstname": t.hint_firstname,
    "error-reg-lastname": t.hint_lastname,
    "error-reg-birthdate": t.hint_birthdate,
    "error-reg-email": t.hint_email,
    "error-reg-password": t.hint_password,
    "error-reg-confirm-password": t.hint_confirm_password,
    "error-reg-wilaya": t.hint_wilaya,
    "error-reg-phone": t.hint_phone,
    "error-reg-hospital": t.hint_hospital
  };

  Object.entries(errorTexts).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el && el.dataset.errorType) {
      el.textContent = text;
    }
  });

  populateWilayaSelect(document.getElementById("reg-wilaya"), t.wilaya_placeholder);

  document.getElementById("register-btn").textContent = t.register_btn;
  registerPage.querySelector(".asw span").textContent = `${t.have_account} `;
  registerPage.querySelector(".asw a").textContent = t.sign_in;

  setButtonStates(lang);
}

window.setLang = function(lang) {
  applyTranslations(lang);
};

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lp").forEach((btn) => {
    const text = btn.textContent.trim().toLowerCase();
    if (text === "fr") btn.dataset.lang = "fr";
    if (text === "ar") btn.dataset.lang = "ar";
    if (text === "en") btn.dataset.lang = "en";

    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (lang) setLang(lang);
    });
  });

  showPage("page-login");
  applyTranslations(getSavedLang());
});