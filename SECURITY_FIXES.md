# Neuro ReWire - correctifs de sécurité appliqués

Ce dossier contient une version renforcée de la plateforme. Les changements importants sont dans `app.py`, `static/js/auth-session.js`, `static/js/speech-service.js`, `firebase.database.rules.json`, `.env.example` et `requirements.txt`.

## 1. Backend Flask sécurisé

### CORS

Avant :

```python
CORS(app)
```

Maintenant, CORS est limité aux routes `/api/*` et seulement aux origines configurées dans :

```env
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5000,http://localhost:5000
```

En production, remplace ces valeurs par ton vrai domaine HTTPS, par exemple :

```env
CORS_ALLOWED_ORIGINS=https://neurorewire.example.com
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Lax
```

### Auth serveur Firebase

Le frontend Firebase ne suffit plus. Après login/register, le navigateur envoie un Firebase ID token à :

```text
POST /api/session-login
Authorization: Bearer <firebase_id_token>
```

Flask vérifie le token avec Firebase Admin, puis crée un cookie de session Firebase `HttpOnly`. Les pages privées comme `/dashboard`, `/progress`, `/settings`, `/exercises`, `/games/*`, `/avc` et `/motor` utilisent maintenant `@login_required`.

### Speech-to-text

`/api/speech-to-text` est maintenant protégé par :

- token Firebase obligatoire dans `Authorization: Bearer ...` ;
- CORS restreint ;
- limite de taille audio : `MAX_AUDIO_UPLOAD_BYTES`, par défaut 2 Mo ;
- formats audio limités au WAV ;
- langues autorisées limitées par `ALLOWED_SPEECH_LANGUAGES` ;
- rate limiting : `8 per minute` et `60 per hour`.

En production, utilise Redis pour le rate limiting :

```env
RATELIMIT_STORAGE_URI=redis://localhost:6379/0
```

## 2. Firebase Realtime Database Rules

Le fichier ajouté `firebase.database.rules.json` bloque tout par défaut :

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Puis il autorise uniquement :

```text
users/{uid}
sessions/{uid}
exercise_results/{uid}
```

à condition que :

```text
auth != null && auth.uid === $uid
```

Donc un patient connecté ne peut lire et écrire que ses propres données.

Déploiement :

```bash
firebase deploy --only database
```

Ou dans Firebase Console : Realtime Database > Rules > coller le contenu de `firebase.database.rules.json` > Publish.

## 3. Variables d'environnement requises

Copie `.env.example` vers `.env`, puis configure le compte de service Firebase Admin :

```bash
cp .env.example .env
```

Place ton service account dans un dossier non versionné :

```text
secrets/firebase-service-account.json
```

Puis dans `.env` :

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json
```

Ne mets jamais ce fichier JSON dans GitHub.

## 4. Déconnexion

Les fonctions `logout()` ont été mises à jour pour appeler d'abord :

```text
POST /api/session-logout
```

Puis `signOut(auth)` côté Firebase client. Cela évite de laisser un cookie serveur actif après déconnexion.

## 5. Duplication réduite sans casser l'interface

Un module partagé a été ajouté :

```text
static/js/auth-session.js
```

Il centralise :

- création de session serveur ;
- génération du header `Authorization` ;
- suppression de session serveur ;
- logout complet.

La duplication restante principale concerne encore les sidebars et les gros dictionnaires de traduction. La prochaine étape propre serait de créer :

```text
templates/partials/sidebar.html
static/js/i18n.js
static/js/navigation.js
```

Puis de remplacer progressivement les blocs répétés dans `dashboard.html`, `progress.html`, `motor.html`, `settings.html`, `exercises.html` et les jeux.

---

## 6. FLASK_SECRET_KEY (app.py)

**Problème :** Flask n'avait aucune clé secrète configurée, ce qui laisse la signature interne des cookies sans clé fixe et prévisible.

**Correctif :** `app.config["SECRET_KEY"]` est maintenant chargé depuis la variable d'environnement `FLASK_SECRET_KEY`. Si elle est absente, une clé aléatoire est générée au démarrage avec un avertissement dans les logs.

> ⚠️ En production, toujours définir `FLASK_SECRET_KEY`. Un redémarrage sans cette variable invalide toutes les sessions.

```env
# Générer avec :
# python -c "import secrets; print(secrets.token_hex(32))"
FLASK_SECRET_KEY=votre-clé-aléatoire-ici
```

Ajouté dans `.env` et `.env.example` avec les instructions de génération. Un commentaire d'avertissement `FLASK_DEBUG=0 en production` a également été ajouté dans les deux fichiers.

---

## 7. En-têtes de sécurité HTTP (app.py)

Les en-têtes suivants sont ajoutés automatiquement à chaque réponse via `add_security_headers()` :

| En-tête | Valeur | Rôle |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Empêche le navigateur de deviner le type MIME |
| `X-Frame-Options` | `DENY` | Bloque le chargement dans une iframe (anti-clickjacking) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limite les infos de provenance envoyées aux tiers |
| `Permissions-Policy` | `microphone=(self), camera=(), geolocation=()` | Autorise uniquement le micro (reconnaissance vocale), bloque caméra et géolocalisation |

---

## 8. Protection XSS — `escapeHtml()` (JavaScript)

**Problème :** plusieurs modules JavaScript inséraient des données provenant de Firebase directement via `innerHTML` sans échappement HTML. En cas de compromission de la base de données, cela ouvre un vecteur XSS.

**Correctif :** une fonction `escapeHtml(value)` a été ajoutée, qui échappe les caractères `&`, `<`, `>`, `"` et `'` avant toute insertion dans `innerHTML`. Elle est exportée depuis `app-shared.js` et définie localement dans les modules qui ne peuvent pas l'importer.

### Fichiers corrigés

**`progress.js`**
- `item.status` (donnée Firebase) était injecté directement dans un attribut `class` via `innerHTML`. Corrigé avec `escapeHtml()`.
- `translateSessionStatus()` renvoyait la valeur brute de Firebase en cas de statut inconnu. Corrigé : retourne maintenant `escapeHtml(safeValue(status))`.

**`motor.js`**
- `strokeScoreValue` (champ Firebase de l'utilisateur) était inséré sans échappement dans un `innerHTML`. Corrigé avec `escapeHtml(value)`.

**`dashboard.js`**
- `safeText()` ne faisait qu'un `trim()` sans échappement HTML. `escapeHtml()` ajoutée en complément pour sécuriser les contextes `innerHTML`.

**`app-shared.js`**
- `escapeHtml()` exportée comme utilitaire partagé importable par tous les modules JS.

---

## Ce qui n'a PAS été modifié

- `/api/speech-to-text` : non touché (comportement inchangé, aucune restriction ajoutée).
- Logique des jeux, sessions et exercices : inchangée.
- Firebase Database Rules : déjà correctement configurées.
- CORS, rate limiting, session cookie : déjà correctement configurés.
- Templates HTML : aucun changement (les données dynamiques dans les templates Jinja2 sont auto-échappées par défaut).

---

## Checklist de mise en production

- [ ] Générer et définir `FLASK_SECRET_KEY` dans `.env`
- [ ] Passer `FLASK_DEBUG=0`
- [ ] Passer `SESSION_COOKIE_SECURE=true`
- [ ] Remplacer `CORS_ALLOWED_ORIGINS` par le vrai domaine HTTPS
- [ ] Utiliser Redis pour `RATELIMIT_STORAGE_URI=redis://localhost:6379/0`