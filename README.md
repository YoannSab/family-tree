# 🌳 Family Tree - Arbre Généalogique Interactif

Une application web moderne et interactive pour visualiser et explorer votre arbre généalogique. Développée avec React, Vite et D3.js via la librairie [Family Chart](https://donatso.github.io/family-chart-doc/), cette application offre une interface intuitive avec reconnaissance faciale, support multilingue et protection par mot de passe.

## ✨ Fonctionnalités Principales

- **🌲 Visualisation Interactive** : Arbre généalogique dynamique avec navigation fluide
- **👤 Profils Détaillés** : Informations complètes sur chaque membre de la famille
- **🔍 Reconnaissance Faciale** : Identification automatique des personnes sur les photos
- **🌍 Support Multilingue** : Interface disponible en français, anglais et italien
- **📊 Statistiques Familiales** : Analyses et données sur votre famille
- **🔒 Protection par Mot de Passe** : Accès sécurisé aux données familiales
- **📱 Design Responsive** : Compatible mobile, tablette et desktop
- **🎨 Interface Moderne** : Design élégant avec Chakra UI

## 🚀 Démarrage Rapide

### Prérequis

Assurez-vous d'avoir installé :
- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**

### Installation

1. **Cloner le projet**
```bash
git clone <url-du-repository>
cd familytree
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application en mode développement**
```bash
npm run dev
```

4. **Ouvrir votre navigateur**
   - L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
familytree/
├── public/                     # Fichiers statiques
│   ├── data/                   # Données des arbres généalogiques
│   │   └── data.json
│   ├── images/                 # Photos des membres de la famille
│   └── models/                 # Modèles de reconnaissance faciale
├── src/                        # Code source principal
│   ├── components/             # Composants React
│   │   ├── FamilyTree.jsx     # Composant principal de l'arbre
│   │   ├── PersonInfo.jsx     # Informations sur une personne
│   │   ├── FaceRecognition.jsx # Reconnaissance faciale
│   │   ├── FamilyStatsModal.jsx # Statistiques familiales
│   │   ├── LanguageSwitcher.jsx # Changement de langue
│   │   └── PasswordProtection.jsx # Protection par mot de passe
│   ├── i18n/                   # Internationalization
│   │   ├── locales/           # Fichiers de traduction
│   │   │   ├── fr.json        # Français
│   │   │   ├── en.json        # Anglais
│   │   │   └── it.json        # Italien
│   │   └── i18n.js            # Configuration i18n
│   ├── hooks/                  # Hooks React personnalisés
│   ├── services/              # Services et API
│   ├── utils/                 # Utilitaires
│   ├── config/                # Configuration
│   └── assets/                # Assets statiques
├── firebase.json              # Configuration Firebase
├── vite.config.js            # Configuration Vite
└── package.json              # Dépendances et scripts
```

## 🔧 Configuration

### Données Familiales

1. **Format des données** : Les données familiales sont stockées au format JSON dans `public/data/`
2. **Structure des données** :
```json
[
  {
    "id": "0",
    "data": {
      "firstName": "Prénom",
      "lastName": "Nom",
      "gender": "M/F",
      "birthday": "YYYY",
      "death": "YYYY", // optionnel
      "image": "nom_fichier_image",
      "occupation": "Profession",
      "generation": 1,
      "reliable": true
    },
    "rels": {
      "spouses": ["id_conjoint"],
      "children": ["id_enfant1", "id_enfant2"]
    }
  }
]
```

### Images

- **Dossier** : `public/images/`
- **Formats supportés** : JPG, PNG
- **Convention de nommage** : `prenom_nom_identifiant.jpg`
- **Image par défaut** : `default.png` utilisée si aucune image n'est trouvée

### Langues

Pour ajouter une nouvelle langue :

1. Créer un fichier dans `src/i18n/locales/` (ex: `es.json`)
2. Ajouter la langue dans `src/i18n/i18n.js`
3. Mettre à jour le composant `LanguageSwitcher.jsx`

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Construit l'application pour la production
npm run preview      # Prévisualise la version de production

# Qualité de code
npm run lint         # Vérifie le code avec ESLint

# Déploiement
npm run deploy       # Déploie sur GitHub Pages
```

## 🔐 Sécurité et Protection

### Mot de Passe

L'application inclut un système de protection par mot de passe :
- Hashage sécurisé avec crypto-js
- Session maintenue jusqu'à fermeture du navigateur
- Accès restreint aux données sensibles

### Confidentialité

- **Données locales** : Toutes les données restent dans votre navigateur
- **Pas de tracking** : `robots.txt` et meta `noindex` configurés
- **Images privées** : Photos stockées localement

## 🌐 Déploiement

### GitHub Pages

```bash
npm run deploy
```

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 🎨 Personnalisation

### Thème et Couleurs

L'application utilise Chakra UI. Pour personnaliser :

1. Modifier `src/App.css` pour les styles globaux
2. Utiliser les props Chakra UI dans les composants
3. Créer un thème personnalisé si nécessaire

### Ajout de Fonctionnalités

Structure modulaire facilitant l'ajout de nouvelles fonctionnalités :

1. Créer un nouveau composant dans `src/components/`
2. Ajouter les traductions nécessaires
3. Intégrer dans `App.jsx`

## 🤝 Contribution

### Prérequis de développement

- Node.js 16+
- Connaissance de React, JavaScript ES6+
- Familiarité avec Vite et Chakra UI

### Workflow de développement

1. Fork du projet
2. Créer une branche pour votre fonctionnalité
3. Développer et tester
4. Soumettre une Pull Request

## 📚 Technologies Utilisées

### Frontend
- **React 19** - Framework principal
- **Vite** - Build tool et serveur de développement
- **Chakra UI** - Bibliothèque de composants UI
- **D3.js** - Visualisations de données
- **family-chart** - [Composant d'arbre généalogique](https://donatso.github.io/family-chart-doc/)

### Outils et Utilitaires
- **face-api.js** - Reconnaissance faciale
- **i18next** - Internationalisation
- **crypto-js** - Chiffrement et hachage
- **ESLint** - Linting du code

## 🐛 Dépannage

### Problèmes courants

**L'application ne se lance pas**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Images qui ne s'affichent pas**
- Vérifier que les images sont dans `public/images/`
- Vérifier les noms de fichiers dans les données JSON
- S'assurer que `default.png` existe

**Reconnaissance faciale ne fonctionne pas**
- Vérifier que les modèles sont dans `public/models/`
- Autoriser l'accès à la caméra dans le navigateur

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation des dépendances
- Vérifier les logs du navigateur pour les erreurs

---

**Fait avec ❤️ pour préserver l'histoire familiale**