const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const verifRole = require("../middleware/verifRole");
const {
  recevoirDonneesCapteurs,
  getHistorique,
  getConsommationTotale,
  getConsommationTotaleAll,
  getConsommationParPiece,
  getConsommationParJour,
  getConsommationSemaine,
  getConsommationParMois,
} = require("../controllers/energieControleur");

// 📌 Route pour recevoir les données des capteurs
router.post("/data", recevoirDonneesCapteurs);

// 📌 Route pour récupérer l’historique de consommation
router.get("/historique", auth, getHistorique);

// 📌 Route pour récupérer la consommation totale par appareil
router.get("/total", auth, getConsommationTotale);

// 📌 Route pour récupérer la consommation totale de tous les appareils
router.get("/total/all", auth, getConsommationTotaleAll);

// 📌 Route pour récupérer la consommation totale par pièce
router.get("/total/piece", auth, getConsommationParPiece);

// 📌 Route pour récupérer la consommation totale par jour
router.get("/consommation/jour", auth, getConsommationParJour);

// 📌 Route pour récupérer la consommation totale par semaine
router.get("/consommation/semaine", auth, getConsommationSemaine);

// 📌 Route pour récupérer la consommation totale par mois
router.get("/consommation/mois", auth, getConsommationParMois);

module.exports = router;
