const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const verifRole = require("../middleware/verifRole");
const {
  creerAppareil,
  voirAppareil,
  voirTousAppareils,
  modifierAppareil,
  supprimerAppareil,
  activerDesactiverAppareil,
  definirMode,
  creerIntervalle,
  voirIntervalle,
  supprimerIntervalle,
} = require("../controllers/appareilControleur");

// Routes nécessitant un rôle admin
router.post("/ajouter", auth, creerAppareil);

// Routes accessibles par l'admin et l'utilisateur concerné
router.get("/voir", auth, voirTousAppareils);
router.get("/:id", auth, voirAppareil);
router.put("/modifier/:id", auth, modifierAppareil);
router.delete("/supprimer/:id", auth, supprimerAppareil);
router.put("/activer-desactiver/:id", auth, activerDesactiverAppareil);
router.put("/definir-mode/:id", auth, definirMode);

// Routes pour la gestion des intervalles
router.post("/intervalle/:id", auth, creerIntervalle);
router.get("/intervalle/:id", auth, voirIntervalle);
router.put("/intervalle/:id", auth, creerIntervalle);
router.delete("/intervalle/:id", auth, supprimerIntervalle);

module.exports = router;
