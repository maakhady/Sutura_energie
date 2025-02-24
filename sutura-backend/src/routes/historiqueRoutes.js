const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');
const {
  obtenirHistoriques,
  obtenirMesActions,
  supprimerHistoriques,
  obtenirHistoriqueParUser

} = require('../controllers/historiqueControleur');

// Route pour les utilisateurs normaux
router.get('/mes-actions', auth, obtenirMesActions);
router.get('/user/:userId', auth, obtenirHistoriqueParUser);


// Routes protégées pour les admins
router.get('/', auth, verifRole(['admin']), obtenirHistoriques);
router.delete('/', auth, verifRole(['admin']), supprimerHistoriques);
router.get('/user/:userId', auth, verifRole(['admin']),obtenirHistoriqueParUser);


module.exports = router;