import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/**
 * Crée une nouvelle séance pour un utilisateur.
 * @param {string} uid - UID Firebase de l'utilisateur
 * @param {Object} options - Données optionnelles de la séance
 * @returns {Promise<{sessionId: string, sessionData: Object}>}
 */
export async function createSession(uid, options = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis pour créer une séance.");
  }

  const sessionsRef = ref(db, `sessions/${uid}`);
  const newSessionRef = push(sessionsRef);

  const startedAt = new Date().toISOString();

  const sessionData = {
    startedAt,
    endedAt: null,
    durationSeconds: null,
    status: "started",
    notes: options.notes ?? "",
    source: options.source ?? "manual",
    createdAt: startedAt,
    updatedAt: startedAt
  };

  await set(newSessionRef, sessionData);

  return {
    sessionId: newSessionRef.key,
    sessionData
  };
}

/**
 * Termine une séance existante.
 * Calcule automatiquement la durée si startedAt existe.
 * @param {string} uid
 * @param {string} sessionId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function completeSession(uid, sessionId, options = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis pour terminer une séance.");
  }

  if (!sessionId) {
    throw new Error("sessionId requis pour terminer une séance.");
  }

  const sessionRef = ref(db, `sessions/${uid}/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) {
    throw new Error("Séance introuvable.");
  }

  const existingSession = snapshot.val();
  const endedAt = new Date().toISOString();

  let durationSeconds = null;

  if (existingSession.startedAt) {
    const start = new Date(existingSession.startedAt).getTime();
    const end = new Date(endedAt).getTime();

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durationSeconds = Math.floor((end - start) / 1000);
    }
  }

  const updatePayload = {
    endedAt,
    durationSeconds,
    status: "completed",
    updatedAt: endedAt
  };

  if (options.notes !== undefined) {
    updatePayload.notes = options.notes;
  }

  await update(sessionRef, updatePayload);

  return {
    sessionId,
    ...existingSession,
    ...updatePayload
  };
}

/**
 * Annule une séance existante.
 * @param {string} uid
 * @param {string} sessionId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function cancelSession(uid, sessionId, options = {}) {
  if (!uid) {
    throw new Error("UID utilisateur requis pour annuler une séance.");
  }

  if (!sessionId) {
    throw new Error("sessionId requis pour annuler une séance.");
  }

  const sessionRef = ref(db, `sessions/${uid}/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) {
    throw new Error("Séance introuvable.");
  }

  const now = new Date().toISOString();

  const updatePayload = {
    status: "cancelled",
    updatedAt: now
  };

  if (options.notes !== undefined) {
    updatePayload.notes = options.notes;
  }

  await update(sessionRef, updatePayload);

  return {
    sessionId,
    ...snapshot.val(),
    ...updatePayload
  };
}

/**
 * Récupère une séance unique.
 * @param {string} uid
 * @param {string} sessionId
 * @returns {Promise<{sessionId: string, ...Object} | null>}
 */
export async function getSessionById(uid, sessionId) {
  if (!uid || !sessionId) {
    throw new Error("uid et sessionId sont requis.");
  }

  const sessionRef = ref(db, `sessions/${uid}/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    sessionId,
    ...snapshot.val()
  };
}

/**
 * Récupère toutes les séances d'un utilisateur.
 * Retourne un tableau trié par date de création décroissante.
 * @param {string} uid
 * @returns {Promise<Array>}
 */
export async function getUserSessions(uid) {
  if (!uid) {
    throw new Error("UID utilisateur requis.");
  }

  const sessionsRef = ref(db, `sessions/${uid}`);
  const snapshot = await get(sessionsRef);

  if (!snapshot.exists()) {
    return [];
  }

  const raw = snapshot.val();

  const sessions = Object.entries(raw).map(([sessionId, sessionData]) => ({
    sessionId,
    ...sessionData
  }));

  sessions.sort((a, b) => {
    const aTime = new Date(a.createdAt || a.startedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.startedAt || 0).getTime();
    return bTime - aTime;
  });

  return sessions;
}