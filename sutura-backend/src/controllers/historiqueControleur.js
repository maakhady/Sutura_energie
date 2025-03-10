const Historique = require("../models/Historique");

/**
 * Créer une nouvelle entrée dans l'historique
 * @private Cette fonction est utilisée en interne par les autres contrôleurs
 */
const creerHistorique = async (data) => {
  try {
    const nouvelHistorique = await Historique.create({
      ...data,
      date_creation: Date.now(),
      date_modif: Date.now(),
    });
    return nouvelHistorique;
  } catch (error) {
    console.error("Erreur creerHistorique:", error);
    throw new Error(
      `Erreur lors de la création de l'historique: ${error.message}`
    );
  }
};

/**
 * Obtenir l'historique selon le rôle
 * @route GET /api/historiques
 * @access Private
 */
const obtenirHistoriques = async (req, res) => {
  try {
    let filtres = {};

    // Gestion des filtres basée sur le rôle
    if (req.user.role === "admin") {
      // L'admin peut tout voir et filtrer
      if (req.query.users_id) filtres.users_id = req.query.users_id;
    } else {
      // Utilisateur normal ne voit que ses logs
      filtres.users_id = req.user.id;
    }

    // Filtres communs pour tous les rôles
    if (req.query.type_entite) filtres.type_entite = req.query.type_entite;
    if (req.query.type_operation)
      filtres.type_operation = req.query.type_operation;
    if (req.query.statut) filtres.statut = req.query.statut;

    // Filtre par date
    if (req.query.date_debut || req.query.date_fin) {
      filtres.date_creation = {};
      if (req.query.date_debut) {
        filtres.date_creation.$gte = new Date(req.query.date_debut);
      }
      if (req.query.date_fin) {
        filtres.date_creation.$lte = new Date(req.query.date_fin);
      }
    }

    const historiques = await Historique.find(filtres)
      .sort({ date_creation: -1 })
      .populate("users_id", "nom prenom email")
      .populate("app_id", "nom_app")
      .populate("pieces_id", "nom_piece")
      .lean();

    res.status(200).json({
      success: true,
      count: historiques.length,
      data: historiques,
    });
  } catch (error) {
    console.error("Erreur obtenirHistoriques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des historiques",
      error: error.message,
    });
  }
};

const obtenirHistoriquesAppareils = async (req, res) => {
  try {
    let filtres = { type_entite: "appareil" }; // 🔹 Filtre pour ne prendre que les appareils

    // 🔹 Filtrer uniquement les actions "Allumer", "Éteindre" et "Programmation"
    filtres.type_operation = { $in: ["Allumer", "Eteindre", "Programmation"] };

    // 🔹 Récupérer les logs avec les relations (user & appareil)
    const historiques = await Historique.find(filtres)
      .sort({ date_creation: -1 })
      .populate("users_id", "nom prenom email") // Récupérer les infos de l'utilisateur
      .populate("app_id", "nom_app") // Récupérer le nom de l'appareil
      .lean();

    res.status(200).json({
      success: true,
      count: historiques.length,
      data: historiques,
    });
  } catch (error) {
    console.error("Erreur obtenirHistoriques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des historiques",
      error: error.message,
    });
  }
};

/**
 * Obtenir l'historique des actions de l'utilisateur connecté
 * @route GET /api/historiques/mes-actions
 * @access Private
 */
const obtenirMesActions = async (req, res) => {
  try {
    const filtres = {
      users_id: req.user.id,
    };

    const historiques = await Historique.find(filtres)
      .sort({ date_creation: -1 })
      .populate("app_id", "nom_app")
      .populate("pieces_id", "nom_piece")
      .lean();

    res.status(200).json({
      success: true,
      count: historiques.length,
      data: historiques,
    });
  } catch (error) {
    console.error("Erreur obtenirMesActions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de votre historique",
      error: error.message,
    });
  }
};

/**
 * Obtenir l'historique d'un utilisateur
 * @route GET /api/historiques/user/:userId
 * @access Private
 */
const obtenirHistoriqueParUser = async (req, res) => {
  try {
    const historiques = await Historique.find({ users_id: req.params.userId })
      .populate("users_id", "nom prenom email")
      .populate("app_id", "nom_app")
      .populate("pieces_id", "nom_piece")
      .lean();

    if (!historiques || historiques.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun historique trouvé pour cet utilisateur",
      });
    }

    // Vérification des droits d'accès
    if (req.user.role !== "admin" && req.params.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à cet historique",
      });
    }

    res.status(200).json({
      success: true,
      data: historiques,
    });
  } catch (error) {
    console.error("Erreur obtenirHistoriqueParUser:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique",
      error: error.message,
    });
  }
};

/**
 * Supprimer des historiques par plage de dates
 * @route DELETE /api/historiques
 * @access Private/Admin
 */
const supprimerHistoriques = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.body;

    if (!date_debut || !date_fin) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir une date de début et de fin",
      });
    }

    const dateDebut = new Date(date_debut);
    const dateFin = new Date(date_fin);

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Dates invalides",
      });
    }

    const result = await Historique.deleteMany({
      date_creation: {
        $gte: dateDebut,
        $lte: dateFin,
      },
    });

    // Créer une entrée pour la suppression
    await creerHistorique({
      users_id: req.user.id,
      type_entite: "historique",
      type_operation: "suppression",
      description: `Suppression de ${
        result.deletedCount
      } entrées d'historique entre ${dateDebut.toISOString()} et ${dateFin.toISOString()}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} historiques supprimés avec succès`,
    });
  } catch (error) {
    console.error("Erreur supprimerHistoriques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression des historiques",
      error: error.message,
    });
  }
};

module.exports = {
  creerHistorique,
  obtenirHistoriques,
  obtenirMesActions,
  supprimerHistoriques,
  obtenirHistoriqueParUser,
  obtenirHistoriquesAppareils,
};
