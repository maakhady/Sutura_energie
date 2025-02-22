const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');
const { 
  connexionParEmail, 
  connexionParCode, 
  changerMotDePasseInitial, 
  deconnexion, 
  monProfil 
} = require('../controllers/authControleur');

// Routes publiques
router.post('/connexion', connexionParEmail);
router.post('/logincode', connexionParCode);

// Routes protégées
router.post('/changer-password', auth, changerMotDePasseInitial);
router.post('/logout', auth, deconnexion);
router.get('/mon-profil',auth, verifRole(['admin', 'utilisateur']), monProfil);

module.exports = router;