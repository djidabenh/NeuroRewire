import { auth, db } from "./firebase-config.js";
import { createServerSession } from "./auth-session.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  normalizeName,
  isValidBirthDate,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isAlphabeticName
} from "./app-shared.js";

function showRegisterMessage(message, isError = true) {
  const box = document.getElementById("register-message");
  if (!box) return;
  box.style.display = "block";
  box.style.color = isError ? "var(--ER)" : "var(--OK)";
  box.textContent = message;
}

function clearRegisterMessage() {
  const box = document.getElementById("register-message");
  if (!box) return;
  box.style.display = "none";
  box.textContent = "";
}

function getRegisterTexts() {
  const lang = window.currentLang || "ar";

  const map = {
    ar: {
      required: "يرجى ملء جميع الحقول المطلوبة.",
      firstNameInvalid: "الاسم يجب أن يحتوي على حروف فقط.",
      lastNameInvalid: "اللقب يجب أن يحتوي على حروف فقط.",
      birthDateInvalid: "تاريخ الميلاد غير صالح.",
      emailInvalid: "البريد الإلكتروني غير صالح.",
      phoneInvalid: "رقم الهاتف يجب أن يحتوي على أرقام فقط ويمكن أن يبدأ بـ +.",
      passLength: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.",
      passStrong: "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل.",
      passMatch: "كلمتا المرور غير متطابقتين.",
      wilayaRequired: "يرجى اختيار الولاية.",
      hospitalRequired: "يرجى إدخال اسم المستشفى.",
      creating: "جاري إنشاء الحساب...",
      success: "تم إنشاء الحساب بنجاح.",
      emailUsed: "هذا البريد الإلكتروني مستخدم بالفعل.",
      weakPassword: "كلمة المرور ضعيفة جدًا.",
      generic: "حدث خطأ أثناء إنشاء الحساب.",
      button: "إنشاء حساب",
      scoreTypeRequired: "يرجى اختيار نوع النتيجة.",
      scoreValueRequired: "يرجى اختيار قيمة النتيجة.",
      scoreTypeLabel: "نوع النتيجة (اختياري)",
      scoreValueLabel: "قيمة النتيجة (اختياري)",
      nihssLabel: "NIHSS",
      rankinLabel: "Rankin",
      star: "*"
    },
    fr: {
      required: "Veuillez remplir tous les champs obligatoires.",
      firstNameInvalid: "Le nom doit contenir uniquement des lettres.",
      lastNameInvalid: "Le prénom doit contenir uniquement des lettres.",
      birthDateInvalid: "La date de naissance est invalide.",
      emailInvalid: "L’adresse email est invalide.",
      phoneInvalid: "Le téléphone doit contenir uniquement des chiffres, avec + en option.",
      passLength: "Le mot de passe doit contenir au moins 8 caractères.",
      passStrong: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.",
      passMatch: "Les mots de passe ne correspondent pas.",
      wilayaRequired: "Veuillez sélectionner votre wilaya.",
      hospitalRequired: "Veuillez entrer le nom de votre hôpital.",
      creating: "Création du compte...",
      success: "Compte créé avec succès.",
      emailUsed: "Cet email est déjà utilisé.",
      weakPassword: "Mot de passe trop faible.",
      generic: "Une erreur est survenue lors de la création du compte.",
      button: "Créer un compte",
      scoreTypeRequired: "Veuillez choisir le type de score.",
      scoreValueRequired: "Veuillez choisir la valeur du score.",
      scoreTypeLabel: "Type de score (optionnel)",
      scoreValueLabel: "Valeur du score (optionnel)",
      nihssLabel: "NIHSS",
      rankinLabel: "Rankin",
      star: "*"
    },
    en: {
      required: "Please fill in all required fields.",
      firstNameInvalid: "First name must contain letters only.",
      lastNameInvalid: "Last name must contain letters only.",
      birthDateInvalid: "Date of birth is invalid.",
      emailInvalid: "Email address is invalid.",
      phoneInvalid: "Phone must contain digits only, with optional + prefix.",
      passLength: "Password must be at least 8 characters long.",
      passStrong: "Password must contain at least one uppercase letter, one lowercase letter, and one digit.",
      passMatch: "Passwords do not match.",
      wilayaRequired: "Please select your wilaya.",
      hospitalRequired: "Please enter your hospital name.",
      creating: "Creating account...",
      success: "Account created successfully.",
      emailUsed: "This email is already in use.",
      weakPassword: "Password is too weak.",
      generic: "An error occurred while creating the account.",
      button: "Create account",
      scoreTypeRequired: "Please choose the score type.",
      scoreValueRequired: "Please choose the score value.",
      scoreTypeLabel: "Score type (optional)",
      scoreValueLabel: "Score value (optional)",
      nihssLabel: "NIHSS",
      rankinLabel: "Rankin",
      star: "*"
    }
  };

  return map[lang];
}

function getLabelBaseText(fieldId) {
  const label = document.querySelector(`label[for="${fieldId}"]`);
  return label ? label.textContent.replace("*", "").trim() : "";
}

function setFieldStar(fieldId, show) {
  const label = document.querySelector(`label[for="${fieldId}"]`);
  if (!label) return;

  const base = getLabelBaseText(fieldId);
  label.innerHTML = show ? `${base} <span class="req-inline">*</span>` : base;
}

function showFieldError(fieldId, message, errorType = "") {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.dataset.errorType = errorType;
  errorEl.classList.add("show");
  setFieldStar(fieldId, true);
}

function clearFieldError(fieldId) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.dataset.errorType = "";
  errorEl.classList.remove("show");
  setFieldStar(fieldId, false);
}

function clearAllFieldErrors() {
  [
  "reg-familyname",
  "reg-givenname",
  "reg-birthdate",
  "reg-email",
  "reg-password",
  "reg-confirm-password",
  "reg-wilaya",
  "reg-phone",
  "reg-hospital",
  "reg-stroke-score-type",
  "reg-stroke-score-value"
].forEach(clearFieldError);
}

function bindLiveFieldCleanup() {
  [
  "reg-familyname",
  "reg-givenname",
  "reg-birthdate",
  "reg-email",
  "reg-password",
  "reg-confirm-password",
  "reg-wilaya",
  "reg-phone",
  "reg-hospital",
  "reg-stroke-score-type",
  "reg-stroke-score-value"
].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.boundErrorListener === "1") return;

    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      clearFieldError(id);
      clearRegisterMessage();
    });
    el.dataset.boundErrorListener = "1";
  });
}

window.registerUser = async function registerUser() {
  clearRegisterMessage();
  clearAllFieldErrors();
  bindLiveFieldCleanup();

  const t = getRegisterTexts();

  const familyName = normalizeName(document.getElementById("reg-familyname")?.value || "");
  const givenName = normalizeName(document.getElementById("reg-givenname")?.value || "");
  const birthDate = document.getElementById("reg-birthdate")?.value || "";
  const email = document.getElementById("reg-email")?.value.trim() || "";
  const password = document.getElementById("reg-password")?.value || "";
  const confirmPassword = document.getElementById("reg-confirm-password")?.value || "";
  const wilaya = document.getElementById("reg-wilaya")?.value.trim() || "";
  const phone = document.getElementById("reg-phone")?.value.trim() || "";
  const hospital = normalizeName(document.getElementById("reg-hospital")?.value || "");
  const strokeScoreType = document.getElementById("reg-stroke-score-type")?.value || "";
  const strokeScoreValue = document.getElementById("reg-stroke-score-value")?.value || "";
  const registerBtn = document.getElementById("register-btn");

  let hasError = false;

  if (!familyName) {
  showFieldError("reg-familyname", t.required, "required");
  hasError = true;
} else if (!isAlphabeticName(familyName)) {
  showFieldError("reg-familyname", t.firstNameInvalid, "invalid");
  hasError = true;
}

if (!givenName) {
  showFieldError("reg-givenname", t.required, "required");
  hasError = true;
} else if (!isAlphabeticName(givenName)) {
  showFieldError("reg-givenname", t.lastNameInvalid, "invalid");
  hasError = true;
}

  if (!birthDate) {
    showFieldError("reg-birthdate", t.required, "required");
    hasError = true;
  } else if (!isValidBirthDate(birthDate)) {
    showFieldError("reg-birthdate", t.birthDateInvalid, "invalid");
    hasError = true;
  }

  if (!email) {
    showFieldError("reg-email", t.required, "required");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError("reg-email", t.emailInvalid, "invalid");
    hasError = true;
  }

  if (!password) {
    showFieldError("reg-password", t.required, "required");
    hasError = true;
  } else if (password.length < 8) {
    showFieldError("reg-password", t.passLength, "invalid");
    hasError = true;
  } else if (!isValidPassword(password)) {
    showFieldError("reg-password", t.passStrong, "invalid");
    hasError = true;
  }

  if (!confirmPassword) {
    showFieldError("reg-confirm-password", t.required, "required");
    hasError = true;
  } else if (password !== confirmPassword) {
    showFieldError("reg-confirm-password", t.passMatch, "invalid");
    hasError = true;
  }

  if (!wilaya) {
    showFieldError("reg-wilaya", t.wilayaRequired, "required");
    hasError = true;
  }

  if (!phone) {
    showFieldError("reg-phone", t.required, "required");
    hasError = true;
  } else if (!isValidPhone(phone)) {
    showFieldError("reg-phone", t.phoneInvalid, "invalid");
    hasError = true;
  }

  if (!hospital) {
    showFieldError("reg-hospital", t.hospitalRequired, "required");
    hasError = true;
  }

  if (strokeScoreType && !strokeScoreValue) {
  showFieldError("reg-stroke-score-value", t.scoreValueRequired, "required");
  hasError = true;
}

if (!strokeScoreType && strokeScoreValue) {
  showFieldError("reg-stroke-score-type", t.scoreTypeRequired, "required");
  hasError = true;
}

  if (hasError) {
  return;
  }

  try {
    registerBtn.disabled = true;
    registerBtn.textContent = t.creating;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await set(ref(db, `users/${uid}`), {
  uid,
  givenName,
  familyName,
  birthDate,
  email,
  wilaya,
  phone,
  hospital,
  strokeScoreType: strokeScoreType || "",
  strokeScoreValue: strokeScoreValue || "",
  createdAt: new Date().toISOString()
}); 

    await createServerSession(userCredential.user);

    showRegisterMessage(t.success, false);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 700);
  } catch (error) {
    console.error("Register error:", error);

    let message = t.generic;

    if (error.code === "auth/email-already-in-use") {
      message = t.emailUsed;
      showFieldError("reg-email", t.emailUsed, "invalid");
    } else if (error.code === "auth/invalid-email") {
      message = t.emailInvalid;
      showFieldError("reg-email", t.emailInvalid, "invalid");
    } else if (error.code === "auth/weak-password") {
      message = t.weakPassword;
      showFieldError("reg-password", t.weakPassword, "invalid");
    }

    showRegisterMessage(message, true);
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = t.button;
  }
};

function populateStrokeScoreValues() {
  const typeSelect = document.getElementById("reg-stroke-score-type");
  const valueSelect = document.getElementById("reg-stroke-score-value");
  if (!typeSelect || !valueSelect) return;

  const selectedType = typeSelect.value;
  const currentValue = valueSelect.value;

  valueSelect.innerHTML = '<option value="">—</option>';

  let max = -1;
  if (selectedType === "nihss") max = 13;
  if (selectedType === "rankin") max = 6;

  if (max >= 0) {
    for (let i = 0; i <= max; i++) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = String(i);
      valueSelect.appendChild(option);
    }
  }

  if (currentValue && Number(currentValue) <= max) {
    valueSelect.value = currentValue;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  bindLiveFieldCleanup();

  const typeSelect = document.getElementById("reg-stroke-score-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      populateStrokeScoreValues();
      clearFieldError("reg-stroke-score-type");
      clearFieldError("reg-stroke-score-value");
      clearRegisterMessage();
    });
  }

  const valueSelect = document.getElementById("reg-stroke-score-value");
  if (valueSelect) {
    valueSelect.addEventListener("change", () => {
      clearFieldError("reg-stroke-score-value");
      clearRegisterMessage();
    });
  }

  populateStrokeScoreValues();
});