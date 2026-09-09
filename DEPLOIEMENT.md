# CoolestKidz — Déploiement Vercel + Supabase

## Étape 1 : Créer le projet Supabase (gratuit)

1. Va sur **https://supabase.com** et crée un compte
2. Clique sur **New Project**
3. Choisis un nom (ex: `coolestkidz`), un mot de passe fort pour la base, et une région (Europe ou la plus proche)
4. Attends 1-2 minutes que le projet soit prêt

## Étape 2 : Créer la table des articles

1. Dans ton projet Supabase, va dans **SQL Editor** (menu de gauche)
2. Clique sur **New query**
3. Ouvre le fichier `supabase-setup.sql` de ce dossier
4. Copie tout le contenu et colle-le dans l’éditeur
5. Clique sur **Run**

Tu dois voir « Success ». La table `products` est créée avec quelques articles d’exemple.

## Étape 3 : Récupérer les clés API

1. Va dans **Project Settings** (icône engrenage) → **API**
2. Copie :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public** key (une longue clé qui commence par `eyJ...`)

## Étape 4 : Configurer le site

1. Ouvre le fichier `config.js`
2. Remplace :
```js
SUPABASE_URL: "https://TON-PROJET.supabase.co",
SUPABASE_ANON_KEY: "TON_ANON_KEY_ICI",
```
par tes vraies valeurs.

3. (Optionnel) Change aussi le mot de passe admin :
```js
ADMIN_PASSWORD: "ton-mot-de-passe-secret"
```

## Étape 5 : Déployer sur Vercel

### Méthode simple (recommandée)

1. Va sur **https://vercel.com** et connecte-toi (avec GitHub de préférence)
2. Clique sur **Add New Project**
3. Importe le dossier `coolestkidz` (ou pousse-le sur un repo GitHub puis importe le repo)
4. Laisse les réglages par défaut (Framework Preset : Other / Vite / etc. → choisis **Other**)
5. Clique sur **Deploy**

Vercel va te donner une URL du type :  
`https://coolestkidz-xxxx.vercel.app`

### Méthode avec GitHub (meilleure pour les mises à jour)

1. Crée un repo GitHub et pousse le dossier `coolestkidz`
2. Sur Vercel → Import Project → sélectionne le repo
3. Deploy

## Étape 6 : Tester

- **Site public** : `https://ton-site.vercel.app`
- **Admin** : `https://ton-site.vercel.app/admin.html`  
  Mot de passe : celui défini dans `config.js` (par défaut `coolestkidz2026`)

---

## Fichiers importants

| Fichier | Rôle |
|---------|------|
| `index.html` | Site vitrine public |
| `admin.html` | Panneau d’administration |
| `config.js` | Clés Supabase + mot de passe admin |
| `styles.css` | Design |
| `script.js` | Logique du site public |
| `logo.png` | Logo |
| `supabase-setup.sql` | Script pour créer la table |

## Sécurité (important)

Pour le moment, les politiques RLS permettent à tout le monde d’écrire dans la table (pratique pour démarrer).  
Plus tard, on pourra :
- Activer **Supabase Auth** (connexion email pour l’admin uniquement)
- Restreindre les politiques d’écriture

Pour un site vitrine de marque, le mot de passe de la page admin + le fait que l’URL `/admin.html` ne soit pas publicisée est déjà une bonne base.
