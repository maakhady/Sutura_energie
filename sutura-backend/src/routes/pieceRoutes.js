const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const verifRole = require("../middleware/verifRole");
const {
  creerPiece,
  obtenirToutesPieces,
  obtenirPieceParId,
  mettreAJourPiece,
  supprimerPiece,
  obtenirPiecesParUtilisateur,
} = require("../controllers/pieceControleur");

// Routes nécessitant un rôle admin
router.post("/", auth, verifRole(["admin"]), creerPiece);
router.get("/allpieces", auth, verifRole(["admin"]), obtenirToutesPieces);

// Routes accessibles par l'admin et l'utilisateur concerné

router.get("/voir/:id", auth, obtenirPieceParId);
router.put("/modifier/:id", auth, mettreAJourPiece);
router.delete("/sup/:id", auth, supprimerPiece);

module.exports = router;
