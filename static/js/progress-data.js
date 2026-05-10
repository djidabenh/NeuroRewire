import { getUserSessions } from "./session-service.js";
import { getUserExerciseResults } from "./exercise-service.js";

/**
 * Retourne la dernière date d'activité trouvée dans les séances et exercices.
 * @param {Array} sessions
 * @param {Array} exercises
 * @returns {string|null}
 */
function getLastActivityAt(sessions, exercises) {
  const allDates = [];

  sessions.forEach((session) => {
    if (session.updatedAt) allDates.push(session.updatedAt);
    else if (session.endedAt) allDates.push(session.endedAt);
    else if (session.startedAt) allDates.push(session.startedAt);
  });

  exercises.forEach((exercise) => {
    if (exercise.updatedAt) allDates.push(exercise.updatedAt);
    else if (exercise.endedAt) allDates.push(exercise.endedAt);
    else if (exercise.startedAt) allDates.push(exercise.startedAt);
  });

  if (allDates.length === 0) return null;

  allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return allDates[0];
}

/**
 * Calcule la moyenne de score par catégorie, uniquement sur les exercices terminés
 * qui ont score et maxScore valides.
 * @param {Array} exercises
 * @returns {Object}
 */
function getCategoryAverages(exercises) {
  const grouped = {};

  exercises
    .filter((exercise) =>
      exercise.status === "completed" &&
      typeof exercise.score === "number" &&
      typeof exercise.maxScore === "number" &&
      exercise.maxScore > 0 &&
      exercise.category
    )
    .forEach((exercise) => {
      const category = exercise.category;

      if (!grouped[category]) {
        grouped[category] = {
          totalScore: 0,
          totalMaxScore: 0,
          completedCount: 0
        };
      }

      grouped[category].totalScore += exercise.score;
      grouped[category].totalMaxScore += exercise.maxScore;
      grouped[category].completedCount += 1;
    });

  const result = {};

  Object.entries(grouped).forEach(([category, values]) => {
    const percentage =
      values.totalMaxScore > 0
        ? Math.round((values.totalScore / values.totalMaxScore) * 100)
        : null;

    result[category] = {
      completedCount: values.completedCount,
      totalScore: values.totalScore,
      totalMaxScore: values.totalMaxScore,
      averagePercent: percentage
    };
  });

  return result;
}

/**
 * Retourne un historique simple des séances, enrichi avec le nombre d'exercices
 * liés à chaque séance.
 * @param {Array} sessions
 * @param {Array} exercises
 * @returns {Array}
 */
function buildSessionHistory(sessions, exercises) {
  return sessions.map((session) => {
    const relatedExercises = exercises.filter(
      (exercise) => exercise.sessionId === session.sessionId
    );

    const completedExercises = relatedExercises.filter(
      (exercise) => exercise.status === "completed"
    ).length;

    return {
      sessionId: session.sessionId,
      startedAt: session.startedAt ?? null,
      endedAt: session.endedAt ?? null,
      durationSeconds: session.durationSeconds ?? null,
      status: session.status ?? null,
      exerciseCount: relatedExercises.length,
      completedExerciseCount: completedExercises,
      notes: session.notes ?? ""
    };
  });
}

/**
 * Récupère et calcule toutes les vraies données de progression d'un utilisateur.
 * @param {string} uid
 * @returns {Promise<Object>}
 */
export async function getUserProgressData(uid) {
  if (!uid) {
    throw new Error("UID utilisateur requis pour calculer les données de progression.");
  }

  const sessions = await getUserSessions(uid);
  const exercises = await getUserExerciseResults(uid);

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );

  const startedSessions = sessions.filter(
    (session) => session.status === "started"
  );

  const cancelledSessions = sessions.filter(
    (session) => session.status === "cancelled"
  );

  const completedExercises = exercises.filter(
    (exercise) => exercise.status === "completed"
  );

  const startedExercises = exercises.filter(
    (exercise) => exercise.status === "started"
  );

  const failedExercises = exercises.filter(
    (exercise) => exercise.status === "failed"
  );

  const abandonedExercises = exercises.filter(
    (exercise) => exercise.status === "abandoned"
  );

  const totalSessionDurationSeconds = completedSessions.reduce((sum, session) => {
    return sum + (typeof session.durationSeconds === "number" ? session.durationSeconds : 0);
  }, 0);

  const totalExerciseDurationSeconds = completedExercises.reduce((sum, exercise) => {
    return sum + (typeof exercise.durationSeconds === "number" ? exercise.durationSeconds : 0);
  }, 0);

  const categoryAverages = getCategoryAverages(exercises);
  const lastActivityAt = getLastActivityAt(sessions, exercises);
  const sessionHistory = buildSessionHistory(sessions, exercises);

  return {
    raw: {
      sessions,
      exercises
    },
    summary: {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      startedSessions: startedSessions.length,
      cancelledSessions: cancelledSessions.length,

      totalExercises: exercises.length,
      completedExercises: completedExercises.length,
      startedExercises: startedExercises.length,
      failedExercises: failedExercises.length,
      abandonedExercises: abandonedExercises.length,

      totalSessionDurationSeconds,
      totalExerciseDurationSeconds,
      lastActivityAt
    },
    categoryAverages,
    sessionHistory
  };
}