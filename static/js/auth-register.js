import { auth, db } from "./firebase-config.js";
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
    "reg-firstname",
    "reg-lastname",
    "reg-birthdate",
    "reg-email",
    "reg-password",
    "reg-confirm-password",
    "reg-wilaya",
    "reg-phone",
    "reg-hospital"
  ].forEach(clearFieldError);
}

function bindLiveFieldCleanup() {
  [
    "reg-firstname",
    "reg-lastname",
    "reg-birthdate",
    "reg-email",
    "reg-password",
    "reg-confirm-password",
    "reg-wilaya",
    "reg-phone",
    "reg-hospital"
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

  const firstName = normalizeName(document.getElementById("reg-firstname")?.value || "");
  const lastName = normalizeName(document.getElementById("reg-lastname")?.value || "");
  const birthDate = document.getElementById("reg-birthdate")?.value || "";
  const email = document.getElementById("reg-email")?.value.trim() || "";
  const password = document.getElementById("reg-password")?.value || "";
  const confirmPassword = document.getElementById("reg-confirm-password")?.value || "";
  const wilaya = document.getElementById("reg-wilaya")?.value.trim() || "";
  const phone = document.getElementById("reg-phone")?.value.trim() || "";
  const hospital = normalizeName(document.getElementById("reg-hospital")?.value || "");
  const registerBtn = document.getElementById("register-btn");

  let hasError = false;

  if (!firstName) {
    showFieldError("reg-firstname", t.required, "required");
    hasError = true;
  } else if (!isAlphabeticName(firstName)) {
    showFieldError("reg-firstname", t.firstNameInvalid, "invalid");
    hasError = true;
  }

  if (!lastName) {
    showFieldError("reg-lastname", t.required, "required");
    hasError = true;
  } else if (!isAlphabeticName(lastName)) {
    showFieldError("reg-lastname", t.lastNameInvalid, "invalid");
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
      firstName,
      lastName,
      birthDate,
      email,
      wilaya,
      phone,
      hospital,
      createdAt: new Date().toISOString()
    });

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

window.addEventListener("DOMContentLoaded", () => {
  bindLiveFieldCleanup();
});