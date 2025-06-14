// Utilitaire pour réinitialiser l'authentification
// Ouvrez la console de votre navigateur et collez ce code pour vous déconnecter :

// Pour effacer l'authentification :
// localStorage.removeItem('auth');
// location.reload();

// Pour vérifier le hash d'un mot de passe (dev uniquement) :
// import CryptoJS from 'crypto-js';
// console.log(CryptoJS.SHA256('votre_mot_de_passe').toString());

export const clearAuth = () => {
  localStorage.removeItem('auth');
  window.location.reload();
};

export const checkPasswordHash = (password) => {
  const CryptoJS = require('crypto-js');
  return CryptoJS.SHA256(password).toString();
};
