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

Toutes les données sont lues depuis des fichiers statiques — aucun backend requis.

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
  subtitle:   "Votre description courte",
  countryIcon: "🌳",
};
```

---

### 🔥 Mode Firebase

Aucun fichier de données à gérer — tout est dans Firestore.

**1.** Créez un projet Firebase et activez Firestore + Storage.

**2.** Copiez `.env.example` en `.env` et remplissez vos identifiants :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

C'est tout — l'interface permet ensuite de créer et gérer les familles directement.

---

## 🔒 Protection par mot de passe (mode local uniquement)

Dans `.env`, définissez `VITE_TARGET_HASH` :

- **Vide** (`VITE_TARGET_HASH=`) → aucune authentification requise, l'arbre s'ouvre directement.
- **Rempli** → mettez le hash SHA-256 du mot de passe souhaité.

```bash
# Générer le hash d'un mot de passe (Node.js)
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('monMotDePasse').digest('hex'))"
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
npm run deploy   # Déploiement GitHub Pages
```

## 🐛 Problèmes courants

**L'app ne démarre pas**
```bash
rm -rf node_modules package-lock.json && npm install && npm run dev
```

**Images invisibles** → vérifiez `public/images/` et la présence de `default.png`

**Reconnaissance faciale** → vérifiez que les modèles sont bien dans `public/models/`