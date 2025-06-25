# 🌳 Family Tree - Arbre Généalogique Interactif

Une application web moderne pour visualiser et explorer votre arbre généalogique avec reconnaissance faciale.

## 🛠️ Technologies

- **React 19** + **Vite** - Interface moderne et performante
- **D3.js** + **Family Chart** - Visualisation interactive de l'arbre
- **Chakra UI** - Design responsive et élégant
- **Face-api.js** - Reconnaissance faciale IA
- **i18next** - Support multilingue (FR/EN/IT)

## ✨ Fonctionnalités

🌲 **Arbre interactif** • 👤 **Profils détaillés** • 🔍 **Reconnaissance faciale** • 🌍 **Multilingue** • 📊 **Statistiques** • 🔒 **Protection mot de passe** • 📱 **Responsive**

## 🚀 Installation

```bash
# 1. Cloner et installer
git clone <url-du-repository>
cd familytree
npm install

# 2. Lancer l'application
npm run dev
```

➡️ **L'application sera accessible sur `http://localhost:5173`**

## ⚙️ Configuration

### 📊 Données de la famille

**Choisissez votre mode de stockage dans `src/config/config.js` :**

```javascript
// Option 1: Données locales (recommandé pour débuter)
const DATA_SOURCE = "local"; 
// ➡️ Placez votre fichier dans public/data/data.json

// Option 2: Firebase (pour partage/synchronisation)
const DATA_SOURCE = "firebase";
// ➡️ Configurez firebaseConfig et créez votre base Firestore
```

### 🏠 Nom et description de famille

**Personnalisez dans `src/config/config.js` :**

```javascript
const FAMILY_CONFIG = {
  familyName: "Votre Nom de Famille",
  subtitle: "Votre description courte"
};
```

### 📁 Structure des données JSON

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

### 🖼️ Images

- **Dossier** : `public/images/`
- **Format** : `prenom_nom_id.JPG`
- **Image par défaut** : `default.png`

### 🔍 Reconnaissance faciale

**Modèles requis dans `public/models/` :**
- `ssd_mobilenetv1_model-weights_manifest.json`
- `face_landmark_68_model-weights_manifest.json` 
- `face_recognition_model-weights_manifest.json`
- `age_gender_model-weights_manifest.json`

[Télécharger les modèles](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)

## 🛠️ Scripts

```bash
npm run dev      # 🔧 Développement
npm run build    # 📦 Production  
npm run preview  # 👀 Prévisualisation
npm run deploy   # 🚀 Déploiement GitHub Pages
```

## 🔐 Sécurité

- **Mot de passe** : Protection optionnelle avec hashage sécurisé
- **Données privées** : Tout reste dans votre navigateur
- **Pas de tracking** : Configuré pour la confidentialité

## 🐛 Problèmes courants

**L'app ne démarre pas ?**
```bash
rm -rf node_modules package-lock.json
npm install && npm run dev
```

**Images invisibles ?** ➡️ Vérifiez `public/images/` et `default.png`

**Reconnaissance faciale ?** ➡️ Téléchargez les modèles dans `public/models/`

---

**Préservez votre histoire familiale avec style ! 👨‍👩‍👧‍👦**