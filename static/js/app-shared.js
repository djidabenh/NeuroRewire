export const ALGERIA_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Zouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M’Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M’Ghair",
  "El Meniaa",
  "Aflou",
  "Brikcha (Bir El Ater)",
  "El-Qantara",
  "Bir El Ater",
  "El Aricha",
  "Ksar Chelala",
  "Aïn Oussera",
  "M’saâd",
  "Ksar El Boukhari",
  "Boussaâda",
  "El Abiodh Sidi Cheikh"
];

export const STORAGE_LANG_KEY = "nrw_lang";

export function getSavedLang() {
  return localStorage.getItem(STORAGE_LANG_KEY) || "ar";
}

export function setSavedLang(lang) {
  localStorage.setItem(STORAGE_LANG_KEY, lang);
}

export function populateWilayaSelect(selectEl, placeholder = "—") {
  if (!selectEl) return;

  const currentValue = selectEl.value;
  selectEl.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  selectEl.appendChild(empty);

  ALGERIA_WILAYAS.forEach((wilaya) => {
    const opt = document.createElement("option");
    opt.value = wilaya;
    opt.textContent = wilaya;
    selectEl.appendChild(opt);
  });

  if (currentValue) {
    selectEl.value = currentValue;
  }
}

export function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

export function isAlphabeticName(value) {
  return /^[A-Za-zÀ-ÿ\u0600-\u06FF' -]+$/u.test(value);
}

export function isValidBirthDate(value) {
  if (!value) return false;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dob <= today;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function isValidPhone(value) {
  return /^\+?\d+$/.test(value);
}