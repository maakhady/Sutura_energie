const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const verifRole = require("../middleware/verifRole");
const { recevoirDonneesCapteurs, getHistorique, getConsommationTotale } = require("../controllers/energieControleur");

// 📌 Route pour recevoir les données des capteurs
router.post("/data", recevoirDonneesCapteurs);

// 📌 Route pour récupérer l’historique de consommation
router.get("/historique", auth, getHistorique);

// 📌 Route pour récupérer la consommation totale
router.get("/total", auth, getConsommationTotale);

module.exports = router;
