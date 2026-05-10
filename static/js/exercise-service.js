import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/**
 * Démarre un exercice pour un utilisateur.
 * @param {string} uid
 * @param {Object} payload
 * @returns {Promise<{resultId: string, resultData: Object}>}
 */
export async function startExercise(uid, payload = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis pour démarrer un exercice.");
  }

  if (!payload.exerciseKey) {
    throw new Error("exerciseKey requis.");
  }

  if (!payload.category) {
    throw new Error("category requis.");
  }

  const resultsRef = ref(db, `exercise_results/${uid}`);
  const newResultRef = push(resultsRef);

  const now = new Date().toISOString();

  const resultData = {
    sessionId: payload.sessionId ?? null,
    exerciseKey: payload.exerciseKey,
    category: payload.category,
    startedAt: now,
    endedAt: null,
    durationSeconds: null,
    score: null,
    maxScore: payload.maxScore ?? null,
    status: "started",
    metadata: payload.metadata ?? {},
    createdAt: now,
    updatedAt: now
  };

  await set(newResultRef, resultData);

  return {
    resultId: newResultRef.key,
    resultData
  };
}

/**
 * Termine un exercice avec ses vraies données.
 * @param {string} uid
 * @param {string} resultId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function completeExercise(uid, resultId, payload = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis.");
  }

  if (!resultId) {
    throw new Error("resultId requis.");
  }

  const resultRef = ref(db, `exercise_results/${uid}/${resultId}`);
  const snapshot = await get(resultRef);

  if (!snapshot.exists()) {
    throw new Error("Résultat d'exercice introuvable.");
  }

  const existing = snapshot.val();
  const now = new Date().toISOString();

  let durationSeconds = null;

  if (existing.startedAt) {
    const start = new Date(existing.startedAt).getTime();
    const end = new Date(now).getTime();

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durationSeconds = Math.floor((end - start) / 1000);
    }
  }

  const updatePayload = {
    endedAt: now,
    durationSeconds,
    score: payload.score ?? existing.score ?? null,
    maxScore: payload.maxScore ?? existing.maxScore ?? null,
    status: "completed",
    updatedAt: now
  };

  if (payload.metadata !== undefined) {
    updatePayload.metadata = payload.metadata;
  }

  await update(resultRef, updatePayload);

  return {
    resultId,
    ...existing,
    ...updatePayload
  };
}

/**
 * Marque un exercice comme échoué.
 * @param {string} uid
 * @param {string} resultId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function failExercise(uid, resultId, payload = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis.");
  }

  if (!resultId) {
    throw new Error("resultId requis.");
  }

  const resultRef = ref(db, `exercise_results/${uid}/${resultId}`);
  const snapshot = await get(resultRef);

  if (!snapshot.exists()) {
    throw new Error("Résultat d'exercice introuvable.");
  }

  const existing = snapshot.val();
  const now = new Date().toISOString();

  let durationSeconds = null;

  if (existing.startedAt) {
    const start = new Date(existing.startedAt).getTime();
    const end = new Date(now).getTime();

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durationSeconds = Math.floor((end - start) / 1000);
    }
  }

  const updatePayload = {
    endedAt: now,
    durationSeconds,
    score: payload.score ?? existing.score ?? null,
    maxScore: payload.maxScore ?? existing.maxScore ?? null,
    status: "failed",
    updatedAt: now
  };

  if (payload.metadata !== undefined) {
    updatePayload.metadata = payload.metadata;
  }

  await update(resultRef, updatePayload);

  return {
    resultId,
    ...existing,
    ...updatePayload
  };
}

/**
 * Marque un exercice comme abandonné.
 * @param {string} uid
 * @param {string} resultId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function abandonExercise(uid, resultId, payload = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis.");
  }

  if (!resultId) {
    throw new Error("resultId requis.");
  }

  const resultRef = ref(db, `exercise_results/${uid}/${resultId}`);
  const snapshot = await get(resultRef);

  if (!snapshot.exists()) {
    throw new Error("Résultat d'exercice introuvable.");
  }

  const existing = snapshot.val();
  const now = new Date().toISOString();

  let durationSeconds = null;

  if (existing.startedAt) {
    const start = new Date(existing.startedAt).getTime();
    const end = new Date(now).getTime();

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durationSeconds = Math.floor((end - start) / 1000);
    }
  }

  const updatePayload = {
    endedAt: now,
    durationSeconds,
    status: "abandoned",
    updatedAt: now
  };

  if (payload.metadata !== undefined) {
    updatePayload.metadata = payload.metadata;
  }

  await update(resultRef, updatePayload);

  return {
    resultId,
    ...existing,
    ...updatePayload
  };
}

/**
 * Retourne un résultat d'exercice par son id.
 * @param {string} uid
 * @param {string} resultId
 * @returns {Promise<Object|null>}
 */
export async function getExerciseById(uid, resultId) {
  if (!uid || !resultId) {
    throw new Error("uid et resultId sont requis.");
  }

  const resultRef = ref(db, `exercise_results/${uid}/${resultId}`);
  const snapshot = await get(resultRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    resultId,
    ...snapshot.val()
  };
}

/**
 * Récupère tous les résultats d'exercices d'un utilisateur.
 * @param {string} uid
 * @returns {Promise<Array>}
 */
export async function getUserExerciseResults(uid) {
  if (!uid) {
    throw new Error("UID utilisateur requis.");
  }

  const resultsRef = ref(db, `exercise_results/${uid}`);
  const snapshot = await get(resultsRef);

  if (!snapshot.exists()) {
    return [];
  }

  const raw = snapshot.val();

  const results = Object.entries(raw).map(([resultId, resultData]) => ({
    resultId,
    ...resultData
  }));

  results.sort((a, b) => {
    const aTime = new Date(a.createdAt || a.startedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.startedAt || 0).getTime();
    return bTime - aTime;
  });

  return results;
}

/**
 * Récupère les résultats d'une séance donnée.
 * @param {string} uid
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
export async function getSessionExerciseResults(uid, sessionId) {
  if (!uid || !sessionId) {
    throw new Error("uid et sessionId sont requis.");
  }

  const allResults = await getUserExerciseResults(uid);

  return allResults.filter(result => result.sessionId === sessionId);
}