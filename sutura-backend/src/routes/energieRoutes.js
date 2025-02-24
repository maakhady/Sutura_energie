const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const verifRole = require('../middleware/verifRole');
const {
  enregistrerMesure,
  calculerConsommationPeriode,
  getStatistiques
} = require('../controllers/energieControleur');

// Route pour enregistrer une nouvelle mesure d'énergie
router.post('/enregistrer-mesure', auth, enregistrerMesure);

// Route pour calculer la consommation sur une période
router.get('/calculer-consommation', auth, calculerConsommationPeriode);

// Route pour obtenir les statistiques (réservée aux admins)
router.get('/statistiques', auth, verifRole(['admin']), getStatistiques);

module.exports = router;