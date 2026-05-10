# Déploiement sur Render — NeuroReWire

## Pourquoi Render ?
Render supporte Flask nativement — pas de réécriture, tout fonctionne (jeux, auth, speech-to-text).

---

## Étape 1 — Mettre le projet sur GitHub

Render déploie depuis GitHub. Si ce n'est pas encore fait :

```bash
cd neurorewire/
git init
git add .
git commit -m "initial commit"
# Crée un repo sur github.com, puis :
git remote add origin https://github.com/TON_USER/neurorewire.git
git push -u origin main
```

> ⚠️ Assure-toi que `.gitignore` contient bien `secrets/` et `.env` pour ne pas exposer tes clés.

---

## Étape 2 — Créer le service sur Render

1. Va sur [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connecte ton compte GitHub et sélectionne le repo `neurorewire`
3. Render détecte automatiquement le `render.yaml` et pré-remplit tout
4. Vérifie que ces champs sont corrects :
   - **Runtime** : Python 3
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT --timeout 60`

---

## Étape 3 — Variables d'environnement (OBLIGATOIRE)

Dans **Environment → Environment Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `FLASK_SECRET_KEY` | clé aléatoire : `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | colle tout le contenu de `secrets/firebase-service-account.json` |
| `FIREBASE_DATABASE_URL` | `https://neuro-rewire-default-rtdb.firebaseio.com` |
| `CORS_ALLOWED_ORIGINS` | ton URL Render (ex: `https://neurorewire.onrender.com`) |

Les autres variables (`FLASK_ENV`, `SESSION_COOKIE_SECURE`, etc.) sont déjà définies dans `render.yaml`.

---

## Étape 4 — Déployer

Clique sur **Create Web Service**. Render installe les dépendances et lance l'app automatiquement.

Le premier déploiement prend ~3 minutes. Ensuite chaque `git push` redéploie automatiquement.

---

## Après le déploiement

1. Copie ton URL Render (ex: `https://neurorewire.onrender.com`)
2. Retourne dans **Environment Variables**
3. Mets à jour `CORS_ALLOWED_ORIGINS` avec cette URL exacte
4. Clique **Save Changes** — Render redémarre automatiquement

---

## Fonctionnalités

| Fonctionnalité | Statut |
|---|---|
| Tous les jeux | ✅ Fonctionnel |
| Jeux de langage + reconnaissance vocale | ✅ Fonctionnel |
| Authentification Firebase | ✅ Fonctionnel |
| Dashboard / Progrès | ✅ Fonctionnel |

---

## Note plan gratuit Render

Sur le plan gratuit, le service se **met en veille après 15 min d'inactivité**.
Le premier chargement après veille prend ~30 secondes. Pour éviter ça, passe au plan Starter ($7/mois).
