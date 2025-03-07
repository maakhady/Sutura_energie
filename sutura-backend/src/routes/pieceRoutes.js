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
} = require("../controllers/pieceControleur");

// Routes accessibles par l'admin et l'utilisateur concerné
router.post("/creer", auth, creerPiece);
router.get("/allpieces", auth, obtenirToutesPieces);

router.get("/voir/:id", auth, obtenirPieceParId);
router.put("/modifier/:id", auth, mettreAJourPiece);
router.delete("/sup/:id", auth, supprimerPiece);

module.exports = router;
