# 🧠 Neuro ReWire

> Application web de **rééducation cognitive et motrice** basée sur **Flask + Firebase**, avec une **interface fidèle au prototype** et une règle stricte : **aucune donnée fictive dans l’application**.

---

# 1. Objectif du projet

Neuro ReWire est une application web de rééducation cognitive et motrice.

L’objectif est de proposer :
- une authentification réelle
- un profil patient réel
- des exercices interactifs
- une progression calculée à partir de **vraies données**
- une interface cohérente et proche du prototype fourni

---

## ⚠️ Principe fondamental

> ❌ Aucune donnée fictive dans l’application.

Cela signifie :
- pas de faux scores
- pas de faux pourcentages
- pas de faux historiques
- pas de faux compteurs de progression

Quand aucune donnée réelle n’existe encore :
- afficher `—`
- ou afficher un message clair comme “aucune donnée disponible”

---

# 2. Technologies utilisées

## Frontend
- HTML
- CSS custom (basé sur le prototype)
- JavaScript natif (ES Modules)

## Backend
- Flask (Python)

## Firebase
- Firebase Authentication
- Firebase Realtime Database

---

# 3. Structure actuelle du projet

```text
neurorewire/
│
├── app.py
├── requirements.txt
├── .env
│
├── templates/
│   ├── index.html
│   ├── dashboard.html
│   ├── settings.html
│   ├── progress.html
│   ├── avc.html
│   ├── exercises.html
│   ├── exercise_category.html
│   └── game_memory_images.html
│
├── static/
│   ├── css/
│   │   └── app.css
│   │
│   └── js/
│       ├── firebase-config.js
│       ├── auth-register.js
│       ├── auth-login.js
│       ├── session-service.js
│       ├── exercise-service.js
│       ├── progress-data.js
│       └── game-memory-images.js
│
└── README.md
```

---

# 4. Routes principales

Routes déjà en place ou utilisées dans le projet :

```text
/                      → Login / Register
/dashboard             → Dashboard
/settings              → Paramètres
/progress              → Progression
/avc                   → Prévention AVC
/exercises             → Catégories d’exercices
/exercises/memory      → Sous-catégorie mémoire
/games/memory-images   → Jeu réel : Mémoriser les images
```

---

# 5. Explication détaillée de chaque fichier

## `app.py`

### Rôle
Point d’entrée du backend Flask.

### Ce qu’il fait
- démarre le serveur
- gère les routes
- retourne les templates HTML

### Important
Quand on ajoute un nouveau jeu, on ajoute :
- une nouvelle route Flask
- un nouveau template HTML
- un nouveau fichier JS
- et un nouveau bloc CSS dans `app.css`

---

## `requirements.txt`

Contient les dépendances Python nécessaires au projet.

Exemple :
- Flask
- python-dotenv

---

## `.env`

Contient les variables d’environnement Flask.

Exemple :
```env
FLASK_APP=app.py
FLASK_ENV=development
```

---

# 6. Templates HTML

## `templates/index.html`

### Rôle
Page d’authentification.

### Contenu
- login
- register
- switch entre les deux
- sélection langue

### Fonctionnement
- création de compte avec Firebase Auth
- connexion avec Firebase Auth
- enregistrement du profil utilisateur dans Realtime Database au register

---

## `templates/dashboard.html`

### Rôle
Tableau de bord principal.

### Affiche uniquement des données réelles
- nom
- âge
- wilaya
- hôpital
- email
- téléphone
- date de création

### Important
Aucune stat fictive n’est affichée.

Si une donnée n’existe pas :
- afficher `—`

---

## `templates/settings.html`

### Rôle
Modifier le profil utilisateur.

### Permet
- modifier nom
- âge
- wilaya
- téléphone
- hôpital

### Fonctionnement
- charge les vraies données depuis Firebase
- sauvegarde les modifications dans Realtime Database

---

## `templates/progress.html`

### Rôle
Afficher la progression réelle.

### Affiche
- séances complétées
- exercices complétés
- temps total
- dernière activité
- moyennes par catégorie
- historique des séances

### Source
Toutes ces valeurs sont calculées à partir de :
- `sessions/{uid}`
- `exercise_results/{uid}`

Aucune valeur n’est inventée.

---

## `templates/avc.html`

### Rôle
Page informative sur la prévention AVC.

### Contenu
- facteurs de risque
- conseils
- bloc FAST
- mythes et réalités

### Statut
Page surtout UI / contenu, pas encore connectée à des données utilisateurs.

---

## `templates/exercises.html`

### Rôle
Page principale des catégories d’exercices.

### Catégories affichées
- Mémoire
- Attention
- Coordination
- Robot
- Trajectoire
- Langage
- Quiz

### Fonction
- rediriger vers les sous-catégories

---

## `templates/exercise_category.html`

### Rôle
Sous-interface après clic sur une catégorie d’exercice.

### Exemple
- `/exercises/memory`

### Ce que la page fait
- affiche le titre de la catégorie
- affiche les 3 sous-jeux (ou moins si prévu)
- reprend les textes exacts du prototype
- affiche la numérotation `1 / 2 / 3`
- gère les 3 langues
- gère la navigation vers les routes de jeux

### Important
Cette page a été corrigée pour :
- respecter les textes exacts du prototype
- respecter la structure visuelle `sg-grid / sg-c / sg-num`
- permettre d’ouvrir le premier vrai jeu :
  - `mem_memorize` → `/games/memory-images`

---

## `templates/game_memory_images.html`

### Rôle
Premier vrai jeu développé : **Mémoire → Mémoriser les images**

### Structure
- sidebar
- bouton retour
- hero du jeu
- topbar niveau / score
- zone de jeu dynamique

### Fonctionnement
Le contenu du jeu n’est pas codé en dur dans le HTML.
Il est injecté par :
- `static/js/game-memory-images.js`

---

# 7. CSS global

## `static/css/app.css`

### Rôle
Fichier CSS global de toute l’application.

### Ce qu’il contient
- design auth
- sidebar
- dashboard
- settings
- progress
- avc
- catégories
- sous-catégories
- styles du premier vrai jeu mémoire

### Important
On ne remplace pas ce fichier par page.
On ajoute seulement des blocs à la fin quand un nouveau module apparaît.

### Blocs déjà présents
- auth
- dashboard
- settings
- progress
- avc
- catégories
- sous-catégories
- **memory images game**
  - hero
  - shell
  - cards
  - boutons
  - feedback
  - résultat final

---

# 8. JavaScript global

## `static/js/firebase-config.js`

### Rôle
Initialiser Firebase.

### Exporte
- `auth`
- `db`

### Utilisé par
- auth
- dashboard
- settings
- progress
- jeux

---

## `static/js/auth-register.js`

### Rôle
Gérer l’inscription.

### Process
1. lire les champs du formulaire
2. créer le compte Firebase Auth
3. récupérer le `uid`
4. créer le profil dans Realtime Database sous :
```text
users/{uid}
```

---

## `static/js/auth-login.js`

### Rôle
Gérer la connexion.

### Process
- email + mot de passe
- Firebase Auth
- redirection vers l’application

---

## `static/js/session-service.js`

### Rôle
Gérer les séances.

### Fonctions existantes
- `createSession(uid, options)`
- `completeSession(uid, sessionId, options)`
- `cancelSession(uid, sessionId, options)`
- `getSessionById(uid, sessionId)`
- `getUserSessions(uid)`

### Stockage
```text
sessions/{uid}/{sessionId}
```

### Utilisation
Chaque vrai jeu doit créer une session au démarrage.

---

## `static/js/exercise-service.js`

### Rôle
Gérer les résultats d’exercices.

### Fonctions existantes
- `startExercise(uid, payload)`
- `completeExercise(uid, resultId, payload)`
- `failExercise(uid, resultId, payload)`
- `abandonExercise(uid, resultId, payload)`
- `getExerciseById(uid, resultId)`
- `getUserExerciseResults(uid)`
- `getSessionExerciseResults(uid, sessionId)`

### Stockage
```text
exercise_results/{uid}/{resultId}
```

### Utilisation
Chaque vrai jeu doit :
- créer un résultat au démarrage
- le terminer ou l’abandonner à la fin

---

## `static/js/progress-data.js`

### Rôle
Calculer la progression réelle à partir des données Firebase.

### Calcule
- total des séances
- séances complétées
- exercices complétés
- exercices échoués
- exercices abandonnés
- temps total
- dernière activité
- moyennes par catégorie
- historique des séances

---

## `static/js/game-memory-images.js`

### Rôle
Premier vrai jeu fonctionnel : **Mémoire → Mémoriser les images**

### Fonctionnement général
Le jeu suit cette logique :

#### 1. Vérifier utilisateur connecté
- si non connecté → redirection `/`

#### 2. Écran intro
- titre
- explication
- bouton start

#### 3. Démarrage du jeu
Au clic sur start :
- créer une session
- créer un exercise result

#### 4. Rounds
Le jeu a plusieurs niveaux/rounds :

```javascript
const ROUNDS = [
  { shown: 3, totalChoices: 6 },
  { shown: 4, totalChoices: 8 },
  { shown: 5, totalChoices: 10 }
];
```

#### 5. Phase mémorisation
Afficher quelques images à retenir.

#### 6. Phase sélection
Afficher une grille plus grande :
- bonnes images
- distracteurs
Le joueur clique uniquement sur les images vues.

#### 7. Validation
On compare :
- images montrées
- images sélectionnées

#### 8. Score
Le score est calculé à partir du nombre de bonnes images sélectionnées.

#### 9. Sauvegarde finale
À la fin :
- `completeExercise(...)`
- `completeSession(...)`

#### 10. Si quitter avant la fin
- `abandonExercise(...)`
- `cancelSession(...)`

### Important
Le premier jeu a été développé d’abord avec des SVG inline.
Mais on veut désormais pouvoir le **redévelopper avec de vraies images locales**.

---

# 9. Structure Firebase

## Utilisateur
```text
users/{uid}
```

Exemple :
```json
{
  "uid": "...",
  "fullName": "...",
  "age": 45,
  "email": "...",
  "wilaya": "...",
  "phone": "...",
  "hospital": "...",
  "createdAt": "..."
}
```

---

## Sessions
```text
sessions/{uid}/{sessionId}
```

Exemple :
```json
{
  "startedAt": "...",
  "endedAt": "...",
  "durationSeconds": 80,
  "status": "completed",
  "notes": "memory-images completed",
  "source": "memory-images",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Résultats d’exercices
```text
exercise_results/{uid}/{resultId}
```

Exemple :
```json
{
  "sessionId": "...",
  "exerciseKey": "memory_images",
  "category": "memory",
  "startedAt": "...",
  "endedAt": "...",
  "durationSeconds": 80,
  "score": 9,
  "maxScore": 12,
  "status": "completed",
  "metadata": {
    "rounds": 3,
    "accuracyPercent": 75
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# 10. Multilingue

Langues supportées :
- arabe (RTL)
- français
- anglais

Le multilingue existe déjà dans :
- auth
- dashboard
- settings
- progress
- exercise_category
- game_memory_images

Chaque nouveau jeu doit être développé dans la même logique :
- objet de traductions
- switch de langue
- mise à jour du `dir`
- même structure de boutons de langue

---

# 11. Ce qui a été fait jusqu’à maintenant

## Base application
- architecture Flask fonctionnelle
- CSS global solide
- sidebar cohérente
- navigation entre les pages principales

## Auth
- register réel
- login réel
- profil stocké dans Firebase

## Dashboard
- affichage des vraies infos utilisateur
- aucun fake data

## Settings
- modification réelle du profil
- sauvegarde dans Realtime Database

## Progress
- lecture réelle des données
- calcul réel des sessions / exercices / progression

## AVC
- page informative stylée

## Exercises
- page catégories
- page sous-catégorie mémoire
- textes exacts du prototype
- numérotation 1 / 2 / 3

## 1er vrai jeu
- **Mémoire → Mémoriser les images**
- vraie logique
- vrai score
- vraie session
- vrai result Firebase
- vrai flow abandon / completion
- design amélioré pour ressembler au prototype

---

# 12. Ce qu’il faut faire maintenant

## Priorité immédiate
Développer les autres jeux **exactement de la même manière** que le premier jeu.

### Dans l’ordre recommandé :
1. `Mémoire → Remettre en ordre`
2. `Mémoire → Trouver les paires`
3. jeux d’attention
4. jeux de coordination
5. robot
6. trajectoire
7. langage
8. quiz

---

# 13. Méthode à suivre pour tous les prochains jeux

Chaque nouveau jeu doit suivre cette architecture :

## A. Route Flask
Ajouter une nouvelle route :
```python
@app.route("/games/...")
def ...():
    return render_template("...")
```

## B. Template HTML dédié
Créer :
```text
templates/game_xxx.html
```

Ce template doit contenir :
- sidebar
- back button
- game hero
- topbar score / niveau
- root div du jeu

## C. Fichier JS dédié
Créer :
```text
static/js/game-xxx.js
```

Le JS doit contenir :
- traductions
- logique du jeu
- état du jeu
- intégration Firebase

## D. CSS ajouté à la fin de `app.css`
Ajouter un bloc dédié :
```css
/* XXX GAME */
...
```

## E. Brancher depuis `exercise_category.html`
Dans la fonction `openGame`, mapper le `gid` vers la route réelle si besoin.

---

# 14. Important pour le prochain prompt

Le prochain prompt doit savoir que :

## 1. Le 1er jeu existe déjà
- `game_memory_images.html`
- `game-memory-images.js`
- bloc CSS memory images game

## 2. Mais on veut pouvoir le refaire avec de vraies images locales
La prochaine version du jeu mémoire doit pouvoir utiliser :
```text
/static/images/memory/...
```

au lieu des SVG inline.

## 3. Tous les futurs jeux doivent suivre la même logique
Toujours :
- `createSession()`
- `startExercise()`
- logique gameplay
- `completeExercise()` / `abandonExercise()`
- `completeSession()` / `cancelSession()`

## 4. On veut garder le même niveau visuel
Chaque nouveau jeu doit être :
- cohérent avec le prototype
- cohérent avec le CSS global existant
- cohérent avec le système de langue

---

# 15. Exemple de prompt à utiliser ensuite

Tu peux utiliser un prompt comme :

> Je développe Neuro ReWire, une application Flask + HTML/CSS/JS + Firebase Auth + Realtime Database.
> Règle absolue : aucune donnée fictive dans l’application.
> Le premier vrai jeu “Mémoire → Mémoriser les images” existe déjà et suit ce flow :
> - route Flask
> - template HTML dédié
> - fichier JS dédié
> - bloc CSS ajouté dans app.css
> - createSession()
> - startExercise()
> - completeExercise() / abandonExercise()
> - completeSession() / cancelSession()
>
> Je veux maintenant développer le jeu suivant exactement de la même manière :
> - même qualité visuelle
> - même structure technique
> - vraies données Firebase
> - support arabe / français / anglais
>
> Aide-moi à créer :
> - la route Flask à ajouter
> - le template HTML complet
> - le JS complet
> - le CSS à ajouter à app.css
> - et le branchement depuis `exercise_category.html`

---

# 16. Conclusion

Neuro ReWire est maintenant :
- une vraie application Flask + Firebase
- une vraie base de données de progression
- une vraie interface fidèle au prototype
- un premier jeu réel déjà fonctionnel
- une architecture claire pour développer tous les autres jeux

Le projet n’en est plus à la phase “maquette”.
Il est maintenant dans la phase :
> **développer chaque jeu réel, le connecter à Firebase, et alimenter la progression avec des données authentiques.**
