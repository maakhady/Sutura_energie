const Piece = require("../models/Piece");
const Appareil = require("../models/Appareil"); // Assurez-vous d'importer le modèle Appareil
const { creerHistorique } = require("./historiqueControleur");

exports.creerPiece = async (req, res) => {
  try {
    const piece = new Piece({
      users_id: req.user._id,
      nom_piece: req.body.nom_piece,
      actif: req.body.actif,
    });

    const nouvellePiece = await piece.save();

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "creation",
      description: `Création de la pièce ${req.body.nom_piece}`,
      statut: "succès",
    });

    res.status(201).json(nouvellePiece); // Retourner la pièce créée avec son ID
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de la pièce",
      error: error.message,
    });

    // Créer un historique en cas d'erreur
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
  }
};

// Supprimer une pièce définitivement de la base de données
exports.supprimerPiece = async (req, res) => {
  try {
    const piece = await Piece.findById(req.params.id);
    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée" });
    }

    // verifier si la piece est utilisée par un appareil
    const appareils = await Appareil.find({ pieces_id: piece._id });
    if (appareils.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Impossible de supprimer cette pièce car elle est utilisée par un ou plusieurs appareils",
        });
    }

    // Vérifier si l'utilisateur a le droit de supprimer cette pièce
    if (
      req.user.role !== "admin" &&
      piece.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    await Piece.deleteOne({ _id: req.params.id });

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "pieces",
      type_operation: "suppression",
      description: `Suppression de la pièce ${piece.nom_piece}`,
      statut: "succès",
    });

    res.status(200).json({ message: "Pièce supprimée avec succès" });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la suppression de la pièce",
      error: error.message,
    });
  }
};
