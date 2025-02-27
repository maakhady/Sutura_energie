const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const verifRole = require("../middleware/verifRole");
const {
  creerUtilisateur,
  obtenirTousUtilisateurs,
  obtenirUtilisateur,
  mettreAJourUtilisateur,
  supprimerUtilisateurs,
  toggleStatutUtilisateur,
  assignerCarteRFID,
  desassignerCarteRFID,
  desactiverMaCarteRFID,
  reactiverCarteRFID,
  assignerEmpreinte,
  desassignerEmpreinte,
  reinitialiserMotDePasse,
  demanderReinitialisation,
  changerpassword,
} = require("../controllers/utilisateurControleur");

// Routes nécessitant un rôle admin
router.post("/", auth, verifRole(["admin"]), creerUtilisateur);
router.get("/", auth, verifRole(["admin"]), obtenirTousUtilisateurs);
router.patch(
  "/:id/toggle-statut",
  auth,
  verifRole(["admin"]),
  toggleStatutUtilisateur
);
router.patch(
  "/:id/assigner-carte",
  auth,
  verifRole(["admin"]),
  assignerCarteRFID
);
router.delete(
  "/:id/desassigner-carte",
  auth,
  verifRole(["admin"]),
  desassignerCarteRFID
);
router.patch(
  "/:id/reactiver-carte",
  auth,
  verifRole(["admin"]),
  reactiverCarteRFID
);
router.patch(
  "/:id/assigner-empreinte",
  auth,
  verifRole(["admin"]),
  assignerEmpreinte
);
router.delete(
  "/:id/desassigner-empreinte",
  auth,
  verifRole(["admin"]),
  desassignerEmpreinte
);
router.delete("/", auth, verifRole(["admin"]), supprimerUtilisateurs);

// Routes accessibles par l'admin et l'utilisateur concerné
router.get("/:id", auth, obtenirUtilisateur);
router.put("/:id", auth, mettreAJourUtilisateur);
router.post("/reinitialiser-password", reinitialiserMotDePasse);
router.post("/demander-reinitialisation", demanderReinitialisation);
router.post("/changerpassword", auth, changerpassword);

// Route pour l'utilisateur (désactiver sa propre carte)
router.patch("/desactiver-ma-carte", auth, desactiverMaCarteRFID);

module.exports = router;
