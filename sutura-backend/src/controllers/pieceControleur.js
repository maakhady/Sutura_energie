const Piece = require("../models/Piece");
const Appareil = require("../models/Appareil"); // Assurez-vous d'importer le modèle Appareil
const { creerHistorique } = require("./historiqueControleur");

// Créer une nouvelle pièce (admin seulement)
exports.creerPiece = async (req, res) => {
  try {
    const piece = new Piece({
      users_id: req.user._id, // Utiliser l'ID de l'utilisateur authentifié
      nom_piece: req.body.nom_piece,
      actif: req.body.actif,
    });

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "creation",
      description: `Création de la pièce ${req.body.nom_piece}`,
      statut: "succès",
    });

    const nouvellePiece = await piece.save();
    res.status(201).json(nouvellePiece);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de la pièce",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "creation",
      description: `Erreur lors de la création de la pièce ${req.body.nom_piece}`,
      statut: "erreur",
    });
  }
};

// Obtenir toutes les pièces (admin seulement)
exports.obtenirToutesPieces = async (req, res) => {
  try {
    const pieces = await Piece.find();

    // Récupérer les appareils pour chaque pièce
    const piecesAvecAppareils = await Promise.all(
      pieces.map(async (piece) => {
        const appareils = await Appareil.find({ pieces_id: piece._id });
        return {
          piece,
          appareils,
        };
      })
    );

    res.status(200).json(piecesAvecAppareils);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des pièces",
      error: error.message,
    });
  }
};

// Obtenir une pièce spécifique
exports.obtenirPieceParId = async (req, res) => {
  try {
    const piece = await Piece.findById(req.params.id);
    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    // Vérifier si l'utilisateur a le droit d'accéder à cette pièce
    if (
      req.user.role !== "admin" &&
      piece.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Récupérer les appareils associés à cette pièce
    const appareils = await Appareil.find({ pieces_id: piece._id });

    res.status(200).json({
      piece,
      appareils,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la pièce",
      error: error.message,
    });
  }
};

// Mettre à jour une pièce
exports.mettreAJourPiece = async (req, res) => {
  try {
    const piece = await Piece.findById(req.params.id);
    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    // Vérifier si l'utilisateur a le droit de modifier cette pièce
    if (
      req.user.role !== "admin" &&
      piece.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const pieceModifiee = await Piece.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "modif",
      description: `Modification de la pièce ${pieceModifiee.nom_piece}`,
      statut: "succès",
    });

    res.status(200).json(pieceModifiee);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de la pièce",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "modif",
      description: `Erreur lors de la modification de la pièce ${pieceModifiee.nom_piece}`,
      statut: "erreur",
    });
  }
};

// Supprimer une pièce (suppression logique)
exports.supprimerPiece = async (req, res) => {
  try {
    const piece = await Piece.findById(req.params.id);
    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    // Vérifier si l'utilisateur a le droit de supprimer cette pièce
    if (
      req.user.role !== "admin" &&
      piece.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier si la pièce contient des appareils
    const appareils = await Appareil.find({ pieces_id: piece._id });
    if (appareils.length > 0) {
      return res.status(403).json({
        message: "Impossible de supprimer une pièce contenant des appareils",
      });
    }
    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "suppression",
      description: `Suppression de la pièce ${piece.nom_piece}`,
      statut: "erreur",
    });
    // Désactiver la pièce
    piece.actif = false;
    await piece.save();

    res.status(200).json({ message: "Pièce désactivée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la pièce",
      error: error.message,
    });
  }
};
