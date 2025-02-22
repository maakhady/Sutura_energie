const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');
const {
  obtenirHistoriques,
  obtenirMesActions,
  obtenirHistorique,
  supprimerHistoriques
} = require('../controllers/historiqueControleur');

// Route pour les utilisateurs normaux
router.get('/mes-actions', auth, obtenirMesActions);

// Routes protégées pour les admins
router.get('/', auth, verifRole(['admin']), obtenirHistoriques);
router.get('/:id', auth, verifRole(['admin']), obtenirHistorique);
router.delete('/', auth, verifRole(['admin']), supprimerHistoriques);

module.exports = router;