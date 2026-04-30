import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function showLoginMessage(message, isError = true) {
  const box = document.getElementById("login-message");
  if (!box) return;
  box.style.display = "block";
  box.style.color = isError ? "var(--ER)" : "var(--OK)";
  box.textContent = message;
}

function clearLoginMessage() {
  const box = document.getElementById("login-message");
  if (!box) return;
  box.style.display = "none";
  box.textContent = "";
}

function getLoginTexts() {
  const lang = window.currentLang || "ar";

  const map = {
    ar: {
      required: "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
      loading: "جاري تسجيل الدخول...",
      success: "تم تسجيل الدخول بنجاح.",
      invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      generic: "حدث خطأ أثناء تسجيل الدخول.",
      button: "تسجيل الدخول"
    },
    fr: {
      required: "Veuillez saisir l’email et le mot de passe.",
      loading: "Connexion en cours...",
      success: "Connexion réussie.",
      invalid: "Email ou mot de passe incorrect.",
      generic: "Une erreur est survenue lors de la connexion.",
      button: "Se connecter"
    },
    en: {
      required: "Please enter email and password.",
      loading: "Signing in...",
      success: "Signed in successfully.",
      invalid: "Incorrect email or password.",
      generic: "An error occurred while signing in.",
      button: "Sign in"
    }
  };

  return map[lang];
}

window.loginUser = async function loginUser() {
  clearLoginMessage();

  const t = getLoginTexts();

  const email = document.getElementById("login-email")?.value.trim();
  const password = document.getElementById("login-password")?.value;
  const loginBtn = document.getElementById("login-btn");

  if (!email || !password) {
    showLoginMessage(t.required);
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = t.loading;

    await signInWithEmailAndPassword(auth, email, password);

    showLoginMessage(t.success, false);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 700);
  } catch (error) {
    let message = t.generic;

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      message = t.invalid;
    }

    showLoginMessage(message, true);
    console.error("Login error:", error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = t.button;
  }
};