import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function waitForCurrentUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};
    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error("Authentication required."));
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export async function getAuthorizationHeader(forceRefresh = false) {
  const user = await waitForCurrentUser();
  const idToken = await user.getIdToken(forceRefresh);
  return { Authorization: `Bearer ${idToken}` };
}

export async function createServerSession(user) {
  const activeUser = user || await waitForCurrentUser();
  const idToken = await activeUser.getIdToken(true);

  const response = await fetch("/api/session-login", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      Accept: "application/json"
    },
    credentials: "same-origin"
  });

  if (!response.ok) {
    let message = "Could not create secure server session.";
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch (_error) {
      // Keep default message.
    }
    throw new Error(message);
  }

  return response.json();
}

export async function clearServerSession() {
  try {
    await fetch("/api/session-logout", {
      method: "POST",
      credentials: "same-origin"
    });
  } catch (error) {
    console.warn("Could not clear server session:", error);
  }
}

export async function logoutEverywhere() {
  await clearServerSession();

  try {
    await signOut(auth);
  } finally {
    window.location.href = "/";
  }
}
