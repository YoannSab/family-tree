# 🌳 Family Tree

Application web interactive pour visualiser un arbre généalogique avec reconnaissance faciale.

**Stack** : React 19 + Vite · D3.js + Family Chart · Chakra UI · Face-api.js · i18next (FR/EN/IT)

## 🚀 Installation

```bash
git clone <url-du-repository>
cd familytree
npm install
npm run dev
```

➡️ `http://localhost:5173`

---

## ⚙️ Modes de données

Dans `src/config/config.js`, choisissez votre mode :

```javascript
const DATA_SOURCE = "local";    // données statiques locales
const DATA_SOURCE = "firebase"; // Firestore en ligne
```

---

### 🏠 Mode local

Toutes les données sont lues depuis un fichier JSON statique — aucun backend requis, pas d'authentification.  
L'arbre s'ouvre directement au démarrage.

**1. Données** — placez votre JSON dans `public/data/data.json` :

```json
[
  {
    "id": "0",
    "data": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "gender": "M",
      "birthday": "1950",
      "image": "jean_dupont_001",
      "occupation": "Ingénieur"
    },
    "rels": {
      "spouses": ["1"],
      "children": ["2", "3"]
    }
  }
]
```

**2. Images** — placez les photos dans `public/images/` (format `prenom_nom_id.JPG`).  
Ajoutez un fichier `default.png` pour les membres sans photo.

**3. Personnalisation** — modifiez `FAMILY_CONFIG` dans `src/config/config.js` :

```javascript
const FAMILY_CONFIG = {
  familyName: "Votre Nom de Famille",
  countryIcon: "🌳",
};
```

---

### 🔥 Mode Firebase

Toutes les données sont stockées dans Firestore, les images dans Firebase Storage.  
Plusieurs familles peuvent coexister, chacune accessible via son URL (`/f/:familyId`).

#### Prérequis Firebase

**1.** Créez un projet Firebase et activez **Firestore**, **Storage**, **Authentication** et **Cloud Functions**.

**2.** Copiez `.env.example` en `.env` et remplissez vos identifiants :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**3.** Déployez les Cloud Functions :

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**4.** Déployez les règles Firestore et Storage :

```bash
firebase deploy --only firestore:rules,storage:rules
```

#### Authentification (mode Firebase)

La sécurité repose sur des **Firebase Custom Auth Tokens** côté serveur — le mot de passe n'est jamais stocké en clair ni vérifié côté client.

- Lors de la création d'une famille, le hash SHA-256 du mot de passe est envoyé à une Cloud Function qui le stocke dans une sous-collection privée de Firestore (`families/{id}/private/auth`), inaccessible publiquement.
- À chaque connexion, la Cloud Function `verifyFamilyPassword` compare le hash et retourne un Custom Token Firebase contenant un claim `familyId`.
- Ce token est utilisé par les règles Firestore et Storage pour n'autoriser l'accès qu'aux membres de la bonne famille.
- Les familles sans mot de passe reçoivent automatiquement un token au chargement de la page.

Aucun compte utilisateur n'est créé — le token est partagé entre tous les membres de la famille.

#### Déploiement hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔍 Reconnaissance faciale

Téléchargez les modèles depuis [face-api.js weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) et placez-les dans `public/models/`.

---

## 🛠️ Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Prévisualisation du build
```

---

## 🐛 Problèmes courants

**L'app ne démarre pas**
```bash
rm -rf node_modules package-lock.json && npm install && npm run dev
```

**Images invisibles** → vérifiez `public/images/` et la présence de `default.png`

**Reconnaissance faciale** → vérifiez que les modèles sont bien dans `public/models/`

**Erreur `permission-denied` Firestore** → vérifiez que les Cloud Functions sont déployées et que l'utilisateur est bien authentifié (token valide)