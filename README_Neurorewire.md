# 🧠 Neuro ReWire

Application web de **rééducation cognitive, motrice et langagière** après AVC, développée avec **Flask + Firebase + HTML/CSS/JavaScript natif**.

> **Principe fondamental :**  
> Aucune donnée fictive ne doit être affichée dans l'application.  
> Tous les scores, erreurs, temps, séances, historiques et statistiques proviennent des **vraies données enregistrées** en base. Quand aucune donnée réelle n'existe, on affiche `—` ou un message explicite `Aucune donnée disponible`.

---

## Sommaire

1. [Objectif du projet](#1-objectif-du-projet)
2. [Technologies utilisées](#2-technologies-utilisées)
3. [Sécurité](#3-sécurité)
4. [Installation et lancement](#4-installation-et-lancement)
5. [Architecture du projet](#5-architecture-du-projet)
6. [Structure Firebase](#6-structure-firebase)
7. [Routes principales](#7-routes-principales)
8. [Description des fichiers](#8-description-des-fichiers)
9. [Jeux développés](#9-jeux-développés)
10. [Flux commun d'un jeu](#10-flux-commun-dun-jeu)
11. [Scores et métadonnées](#11-scores-et-métadonnées)
12. [Multilingue](#12-multilingue)
13. [Conventions de nommage](#13-conventions-de-nommage)
14. [État actuel du projet](#14-état-actuel-du-projet)
15. [Prochaines étapes](#15-prochaines-étapes)

---

## 1. Objectif du projet

Neuro ReWire est une plateforme de rééducation moderne, claire et motivante pour les patients après AVC. Elle propose :

- une authentification réelle avec session serveur sécurisée
- un profil patient complet (données médicales, score neurologique)
- des exercices interactifs organisés en 6 catégories (18 jeux au total)
- un suivi de progression basé exclusivement sur des données réelles
- une page informative de prévention AVC
- une page Moteur et bilan (échelles mRS / NIHSS)
- une interface multilingue cohérente (FR / AR / EN)

---

## 2. Technologies utilisées

**Frontend**
- HTML5, CSS custom (fichier unique `app.css`)
- JavaScript natif (ES Modules)

**Backend**
- Flask 3.x (Python)
- Flask-CORS (restreint aux origines configurées)
- Flask-Limiter (rate limiting sur les routes sensibles)
- Waitress (serveur WSGI de production)

**Base de données & Auth**
- Firebase Authentication
- Firebase Realtime Database
- Firebase Admin SDK (vérification des tokens côté serveur)

**IA & Services**
- OpenAI API (intégration optionnelle)
- SpeechRecognition + pydub (reconnaissance vocale)

**Dépendances Python complètes** — voir `requirements.txt`.

---

## 3. Sécurité

Cette version intègre plusieurs correctifs de sécurité importants. Voir `SECURITY_FIXES.md` pour le détail complet.

### 3.1. Authentification serveur

Le frontend Firebase ne suffit plus. Après login/register, le navigateur envoie un Firebase ID token :

```
POST /api/session-login
Authorization: Bearer <firebase_id_token>
```

Flask vérifie le token via Firebase Admin puis crée un cookie de session `HttpOnly`. Toutes les pages privées (`/dashboard`, `/progress`, `/settings`, `/exercises`, `/games/*`, `/avc`, `/motor`) sont protégées par le décorateur `@login_required`.

### 3.2. CORS

CORS est limité aux routes `/api/*` et aux origines définies dans `.env` :

```env
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5000,http://localhost:5000
```

En production, remplacer par le domaine HTTPS réel.

### 3.3. Speech-to-text

La route `/api/speech-to-text` est protégée par :
- token Firebase obligatoire (`Authorization: Bearer ...`)
- taille audio limitée (`MAX_AUDIO_UPLOAD_BYTES`, défaut 2 Mo)
- formats restreints au WAV
- langues autorisées (`ALLOWED_SPEECH_LANGUAGES`)
- rate limiting : 8 req/min et 60 req/heure

En production, utiliser Redis pour le rate limiting :

```env
RATELIMIT_STORAGE_URI=redis://localhost:6379/0
```

### 3.4. Déconnexion

La déconnexion appelle d'abord `POST /api/session-logout` (suppression du cookie serveur), puis `signOut(auth)` côté Firebase.

### 3.5. Règles Firebase Realtime Database

Le fichier `firebase.database.rules.json` bloque tout par défaut, puis autorise uniquement `users/{uid}`, `sessions/{uid}` et `exercise_results/{uid}` si `auth != null && auth.uid === $uid`.

Déploiement des règles :

```bash
firebase deploy --only database
```

---

## 4. Installation et lancement

### 4.1. Prérequis

- Python 3.11+
- pip
- Un navigateur moderne
- Un projet Firebase configuré

### 4.2. Configuration de l'environnement

```bash
cp .env.example .env
```

Renseigner dans `.env` :

```env
FLASK_APP=app.py
FLASK_DEBUG=True
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5000,http://localhost:5000
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json
SESSION_COOKIE_SECURE=false   # true en production HTTPS
SESSION_COOKIE_SAMESITE=Lax
```

Placer le fichier de service account Firebase dans :

```
secrets/firebase-service-account.json
```

> ⚠️ Ne jamais versionner ce fichier JSON.

Renseigner également les credentials Firebase dans `static/js/firebase-config.js`.

### 4.3. Installation des dépendances

```bash
pip install -r requirements.txt
```

### 4.4. Lancer l'application

**Simple :**
```bash
python app.py
```

**Mode développement — Linux / macOS :**
```bash
export FLASK_DEBUG=True && python app.py
```

**Mode développement — Windows PowerShell :**
```powershell
$env:FLASK_DEBUG="True"
python app.py
```

**Mode production (sans debug) :**
```bash
export FLASK_DEBUG=False && python app.py
```

### 4.5. Erreurs courantes

| Erreur | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'speech_recognition'` | `pip install SpeechRecognition` |
| `ModuleNotFoundError: No module named 'waitress'` | `pip install waitress` |
| `ModuleNotFoundError: No module named 'flask_limiter'` | `pip install Flask-Limiter` |

---

## 5. Architecture du projet

```
neurorewire/
│
├── app.py                          # Point d'entrée Flask
├── requirements.txt
├── .env                            # Variables d'environnement (non versionné)
├── .env.example                    # Modèle .env
├── .gitignore
├── firebase.json
├── firebase.database.rules.json    # Règles de sécurité Firebase
│
├── secrets/
│   └── firebase-service-account.json  # ⚠️ jamais versionné
│
├── templates/
│   ├── index.html                  # Login / Register
│   ├── dashboard.html
│   ├── settings.html
│   ├── progress.html
│   ├── avc.html
│   ├── exercises.html
│   ├── exercise_category.html
│   ├── motor.html
│   │
│   ├── game_memory_images.html
│   ├── game_memory_order.html
│   ├── game_memory_pairs.html
│   ├── game_attention_intruder.html
│   ├── game_attention_click_target.html
│   ├── game_attention_scene_search.html
│   ├── game_coordination_catch_fruits.html
│   ├── game_coordination_drag_drop.html
│   ├── game_coordination_tap_target.html
│   ├── game_trajectory_connect_dots.html
│   ├── game_trajectory_draw_shapes.html
│   ├── game_trajectory_draw_circle.html
│   ├── game_trajectory_maze.html
│   ├── game_quiz_general.html
│   ├── game_quiz_rapid_compare.html
│   ├── game_quiz_rapid_math.html
│   ├── game_language_word_image.html
│   ├── game_language_complete_word.html
│   └── game_language_categorize.html
│
├── static/
│   ├── css/
│   │   └── app.css                 # CSS global unique
│   │
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── auth-login.js
│   │   ├── auth-register.js
│   │   ├── auth-session.js         # ← nouveau : session serveur centralisée
│   │   ├── app-shared.js
│   │   ├── app-ui.js
│   │   ├── dashboard.js
│   │   ├── progress-data.js
│   │   ├── progress.js
│   │   ├── session-service.js
│   │   ├── exercise-service.js
│   │   ├── exercise-category-page.js
│   │   ├── motor.js
│   │   ├── speech-service.js
│   │   │
│   │   ├── game-memory-images.js
│   │   ├── game-memory-order.js
│   │   ├── game-memory-pairs.js
│   │   ├── game-attention-intruder.js
│   │   ├── game-attention-click-target.js
│   │   ├── game-attention-scene-search.js
│   │   ├── game-coordination-catch-fruits.js
│   │   ├── game-coordination-drag-drop.js
│   │   ├── game-coordination-tap-target.js
│   │   ├── game-trajectory-connect-dots.js
│   │   ├── game-trajectory-draw-shapes.js
│   │   ├── game-trajectory-maze.js
│   │   ├── game-quiz-general.js
│   │   ├── game-quiz-rapid-compare.js
│   │   ├── game-quiz-rapid-math.js
│   │   ├── game-language-word-image.js
│   │   ├── game-language-complete-word.js
│   │   └── game-language-categorize.js
│   │
│   └── images/
│       ├── coordination/           # bed, blanket, chair, clock, cup…
│       ├── language/               # apple, bee, bread, butterfly…
│       └── memory/                 # apple, banana, book, car, cat…
│
├── SECURITY_FIXES.md
└── README_NeuroReWire.md
```

---

## 6. Structure Firebase

### 6.1. Profil utilisateur — `users/{uid}`

| Champ | Type | Description |
|---|---|---|
| `uid` | string | Identifiant Firebase |
| `givenName` | string | Prénom |
| `familyName` | string | Nom |
| `birthDate` | string | Date de naissance |
| `email` | string | Email du compte |
| `wilaya` | string | Wilaya du patient |
| `phone` | string | Téléphone |
| `hospital` | string | Hôpital |
| `strokeScoreType` | string | `nihss` ou `rankin` |
| `strokeScoreValue` | number | NIHSS : 0–13 / Rankin : 0–6 |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### 6.2. Sessions — `sessions/{uid}/{sessionId}`

| Champ | Description |
|---|---|
| `startedAt` | Début de la séance |
| `endedAt` | Fin de la séance |
| `durationSeconds` | Durée réelle |
| `status` | `completed` ou `cancelled` |
| `source` | Origine (ex. `memory-images`) |
| `notes` | Notes libres |
| `createdAt` / `updatedAt` | |

### 6.3. Résultats d'exercices — `exercise_results/{uid}/{resultId}`

| Champ | Description |
|---|---|
| `sessionId` | Lien vers la session |
| `exerciseKey` | Identifiant stable (ex. `memory_images`) |
| `category` | `memory`, `attention`, `coordination`, `trajectory`, `quiz`, `language` |
| `startedAt` / `endedAt` | |
| `durationSeconds` | |
| `score` / `maxScore` | |
| `status` | `completed` ou `abandoned` |
| `metadata` | Données spécifiques au jeu (voir §11) |
| `createdAt` / `updatedAt` | |

---

## 7. Routes principales

### Pages

| Route | Page |
|---|---|
| `/` | Login / Register |
| `/dashboard` | Tableau de bord |
| `/settings` | Paramètres |
| `/progress` | Progression |
| `/avc` | Prévention AVC |
| `/motor` | Moteur et bilan |
| `/exercises` | Catégories d'exercices |
| `/exercises/<category>` | Sous-catégorie |

### API

| Route | Méthode | Description |
|---|---|---|
| `/api/session-login` | POST | Crée un cookie de session Firebase (HttpOnly) |
| `/api/session-logout` | POST | Supprime le cookie de session |
| `/api/speech-to-text` | POST | Reconnaissance vocale (protégée, rate-limited) |

### Jeux

```
/games/memory-images         /games/memory-order          /games/memory-pairs
/games/attention-intruder    /games/attention-click-target /games/attention-scene-search
/games/coordination-catch-fruits /games/coordination-drag-drop /games/coordination-tap-target
/games/trajectory-connect-dots   /games/trajectory-draw-shapes /games/trajectory-maze
/games/quiz-general          /games/quiz-rapid-compare    /games/quiz-rapid-math
/games/language-word-image   /games/language-complete-word /games/language-categorize
```

---

## 8. Description des fichiers

### Backend

**`app.py`** — Point d'entrée Flask. Initialise l'app, les middlewares (CORS, limiter), la vérification des tokens Firebase Admin, les routes publiques et privées (`@login_required`), et le rendu des templates.

**`requirements.txt`** — Toutes les dépendances Python épinglées à leur version exacte.

**`.env`** — Variables d'environnement locales (non versionné). Copier depuis `.env.example`.

**`firebase.database.rules.json`** — Règles de sécurité Firebase Realtime Database. À déployer via `firebase deploy --only database`.

---

### JavaScript global

**`firebase-config.js`** — Initialise Firebase et exporte `auth` et `db`.

**`auth-login.js`** — Connexion : lit les champs, appelle Firebase Auth, puis `POST /api/session-login`, puis redirige.

**`auth-register.js`** — Inscription : valide les champs, crée le compte Firebase Auth, écrit dans `users/{uid}`.

**`auth-session.js`** *(nouveau)* — Module partagé centralisant la création/suppression de session serveur et le logout complet (serveur + Firebase client).

**`app-ui.js`** — Traductions FR / AR / EN pour le login/register. Gère la persistance de langue via `localStorage["nrw_lang"]`.

**`app-shared.js`** — Utilitaires partagés entre les pages.

**`dashboard.js`** — Lit le profil Firebase et affiche les données réelles du patient (prénom, cartes visuelles, navigation rapide).

**`session-service.js`** — CRUD des sessions Firebase :
- `createSession(uid, options)`
- `completeSession(uid, sessionId, options)`
- `cancelSession(uid, sessionId, options)`
- `getSessionById(uid, sessionId)`
- `getUserSessions(uid)`

**`exercise-service.js`** — CRUD des résultats d'exercices Firebase :
- `startExercise(uid, payload)`
- `completeExercise(uid, resultId, payload)`
- `failExercise(uid, resultId, payload)`
- `abandonExercise(uid, resultId, payload)`
- `getExerciseById(uid, resultId)`
- `getUserExerciseResults(uid)`
- `getSessionExerciseResults(uid, sessionId)`

**`progress-data.js`** — Lit les séances et résultats Firebase, agrège les vraies statistiques (temps total, exercices complétés, répartition par catégorie, historique).

**`progress.js`** — Rendu visuel de la page Progress à partir des données calculées par `progress-data.js`.

**`motor.js`** — Lit `strokeScoreType` / `strokeScoreValue`, affiche les onglets mRS / NIHSS, le score actuel du patient et les textes explicatifs multilingues.

**`speech-service.js`** — Enregistre l'audio du microphone et envoie au backend `/api/speech-to-text` avec le token Firebase.

**`exercise-category-page.js`** — Affiche les 3 sous-jeux d'une catégorie et mappe vers les routes de jeux.

---

### Fichiers de jeux

Chaque jeu a son propre fichier JS. Pattern commun :

1. Vérifie que l'utilisateur est connecté
2. Affiche l'intro
3. `createSession(uid, { source })`
4. `startExercise(uid, { sessionId, exerciseKey, category, maxScore, metadata })`
5. Exécute la logique gameplay
6. Calcule score / erreurs / rounds / précision
7. En fin normale : `completeExercise(...)` + `completeSession(...)`
8. En sortie anticipée : `abandonExercise(...)` + `cancelSession(...)`

---

### CSS

**`static/css/app.css`** — Fichier CSS global unique (123 Ko). Contient les styles de toutes les pages : auth, sidebar, dashboard, settings, progress, AVC, exercices, jeux, moteur et bilan. Les styles des nouvelles pages s'ajoutent à la fin de ce fichier.

---

## 9. Jeux développés

| Catégorie | Jeu 1 | Jeu 2 | Jeu 3 |
|---|---|---|---|
| **Mémoire** | Mémoriser les images | Remettre en ordre | Trouver les paires |
| **Attention** | Trouver l'intrus | Cliquer la cible | Chercher dans la scène |
| **Coordination** | Attraper les fruits | Mettre chaque objet dans sa pièce | Toucher la cible colorée |
| **Trajectoire** | Relier les points | Tracer les formes | Le labyrinthe |
| **Quiz & Rapidité** | Questions générales | Comparaison rapide | Calcul rapide |
| **Langage** | Mot et image | Compléter le mot | Catégoriser |

**Total : 18 jeux.**

---

## 10. Flux commun d'un jeu

```
1. Vérifier utilisateur connecté
2. Afficher l'intro
3. createSession(uid, { source })
4. startExercise(uid, { sessionId, exerciseKey, category, maxScore, metadata })
5. Exécuter le gameplay
6. Mettre à jour score / erreurs / rounds / précision
7a. Fin normale  → completeExercise(...) + completeSession(...)
7b. Sortie anticipée → abandonExercise(...) + cancelSession(...)
```

---

## 11. Scores et métadonnées

- `score` = nombre de réussites réelles
- `maxScore` = score maximum théorique
- `status` = `completed` ou `abandoned`
- `accuracyPercent = round(score / maxScore * 100)`

**Exemples de champs `metadata` selon la catégorie :**

| Catégorie | Champs metadata typiques |
|---|---|
| Mémoire | `mistakes`, `wrongPlacements`, `wrongPairs` |
| Attention | `wrongClicks`, `missedTargets` |
| Coordination | `wrongDrops`, `missedFruits`, `wrongColors` |
| Trajectoire | `wallHits`, `wrongSegments`, `failedShapes` |
| Quiz | `wrongAnswers`, `timeouts` |
| Langage | `wrongPronunciations`, `unrecognized` |

---

## 12. Multilingue

La langue choisie est stockée dans `localStorage["nrw_lang"]` et relue dans toutes les pages (login, dashboard, settings, progress, AVC, exercises, motor, jeux).

Langues supportées : **Français (FR)**, **Arabe (AR)**, **Anglais (EN)**.

---

## 13. Conventions de nommage

**Profil :** `givenName` (prénom), `familyName` (nom).

**Score neurologique :** `strokeScoreType` (`nihss` | `rankin`), `strokeScoreValue`.

**Jeux :**
- `source` : lisible, utilisé dans les sessions — ex. `memory-images`
- `exerciseKey` : stable, utilisé dans les résultats — ex. `memory_images`
- `category` : `memory` | `attention` | `coordination` | `trajectory` | `quiz` | `language`

---

## 14. État actuel du projet

| Module | État |
|---|---|
| Authentification (login / register) | ✅ Fonctionnel + sécurisé (session serveur) |
| Profil patient (settings) | ✅ Lecture et modification réelles |
| Dashboard | ✅ Données réelles affichées |
| Progression | ✅ Statistiques réelles depuis Firebase |
| Page AVC | ✅ Interface informative complète |
| Moteur et bilan (mRS / NIHSS) | ✅ Score patient affiché si disponible |
| 18 jeux (6 catégories) | ✅ Logique réelle, scores Firebase |
| Multilingue FR / AR / EN | ✅ Persistant via localStorage |
| Sécurité (CORS, session serveur, rate limiting) | ✅ Appliquée |
| Règles Firebase Realtime Database | ✅ Configurées |

---

## 15. Prochaines étapes

Les améliorations identifiées pour les prochains sprints :

- **Réduire la duplication des sidebars** → créer `templates/partials/sidebar.html`
- **Centraliser les traductions** → créer `static/js/i18n.js`
- **Centraliser la navigation** → créer `static/js/navigation.js`
- **Rate limiting Redis** en production pour `speech-to-text`
- **Optimisation des images** (certaines dépassent 1 Mo)
- **Tests automatisés** (routes Flask + services Firebase)

---

*Neuro ReWire — Application web de rééducation post-AVC. Développée avec Flask, Firebase et JavaScript natif.*
