const Appareil = require("../models/Appareil");
const relayService = require("../services/relayService");
const { creerHistorique } = require("./historiqueControleur");
const axios = require("axios");

// Fonction pour obtenir le prochain relay_ID disponible
const getNextRelayID = async () => {
  const appareils = await Appareil.find().sort({ relay_ID: 1 });
  const usedRelayIDs = appareils.map((a) => a.relay_ID);

  for (let i = 1; i <= 8; i++) {
    if (!usedRelayIDs.includes(i)) {
      return i;
    }
  }
  throw new Error("Tous les relais sont attribués !");
};

// Créer un nouvel appareil à partir d'une pièce
exports.creerAppareil = async (req, res) => {
  try {
    const { pieces_id, nom_app, actif, intervalle, automatique } = req.body;

    // Obtenir le prochain relay_ID disponible
    const relay_ID = await getNextRelayID();

    const appareil = new Appareil({
      users_id: req.user._id,
      pieces_id,
      nom_app,
      actif,
      intervalle,
      automatique: automatique || false,
      relay_ID, // Ajout du relay_ID
    });

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "creation",
      description: `Création de l'appareil ${nom_app} avec relay_ID ${relay_ID}`,
      statut: "succès",
    });

    const nouvelAppareil = await appareil.save();
    res.status(201).json(nouvelAppareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de l'appareil",
      error: error.message,
    });

    // Créer un historique en cas d'erreur
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "creation",
      description: `Erreur lors de la création de l'appareil ${req.body.nom_app}`,
      statut: "erreur",
    });
  }
};

// Voir un appareil spécifique
exports.voirAppareil = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    res.status(200).json(appareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération de l'appareil",
      error: error.message,
    });
  }
};

// Récupérer tous les appareils de l'utilisateur
exports.voirTousAppareils = async (req, res) => {
  try {
    const appareils = await Appareil.find({
      users_id: req.user._id, // Récupérer uniquement les appareils de l'utilisateur
      supprime: false, // Exclure les appareils supprimés
    });

    res.status(200).json(appareils);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération des appareils",
      error: error.message,
    });
  }
};

// Modifier un appareil
exports.modifierAppareil = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    // Vérifier si l'utilisateur a le droit de modifier cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Mettre à jour les champs fournis dans le corps de la requête
    const appareilModifie = await Appareil.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `Modification de l'appareil ${appareilModifie.nom_app}`,
      statut: "succès",
    });

    res.status(200).json(appareilModifie);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de l'appareil",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `Erreur lors de la modification de l'appareil ${req.body.nom_app}`,
      statut: "erreur",
    });
  }
};

// Supprimer un appareil (suppression logique)
exports.supprimerAppareil = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    // Vérifier si l'utilisateur a le droit de supprimer cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // crréer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "suppression",
      description: `Suppression de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    // Marquer l'appareil comme supprimé et le désactiver
    await appareil.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Appareil supprimé avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'appareil",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "suppression",
      description: `Erreur lors de la suppression de l'appareil ${req.body.nom_app}`,
      statut: "erreur",
    });
  }
};

// Activer/Désactiver un appareil
exports.activerDesactiverAppareil = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    // Vérifier si l'état est déjà celui demandé
    if (appareil.actif === req.body.actif) {
      return res.status(200).json({
        message: `L'appareil est déjà ${
          req.body.actif ? "activé" : "désactivé"
        }`,
        appareil,
      });
    }

    // Modifier l'état de l'appareil
    appareil.actif = req.body.actif;
    await appareil.save();

    // ✅ Activer/désactiver le relais correspondant
    await relayService.activerDesactiverRelay(appareil);
    console.log("📢 Données envoyées au service relay :", appareil);

    // Déterminer le type d'opération
    const typeOperation = req.body.actif ? "Allumer" : "Eteindre";

    // ✅ Créer un historique avec le bon type d'opération
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: typeOperation,
      description: `${typeOperation} de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    // Retourner l'appareil mis à jour
    res.status(200).json(appareil);
  } catch (error) {
    console.error("Erreur lors du contrôle du relais :", error);
    res.status(400).json({
      message: "Erreur lors de l'activation/désactivation de l'appareil",
      error: error.message,
    });
  }
};
//
// Activer/Désactiver plusieurs appareils ou en en fonction des pieces partagées
exports.activerDesactiverPlusieursAppareils = async (req, res) => {
  try {
    const { pieceId, actif } = req.body;

    if (typeof actif !== "boolean") {
      return res.status(400).json({
        message: "Le paramètre 'actif' est requis et doit être un booléen.",
      });
    }

    let filtres = {};
    if (pieceId) {
      filtres.pieces_id = pieceId; // Filtrer les appareils par pièce
    }

    const appareils = await Appareil.find(filtres);
    if (appareils.length === 0) {
      return res.status(404).json({ message: "Aucun appareil trouvé." });
    }

    // **Créer une liste des IDs de relais**
    const relais_ids = appareils
      .filter((appareil) => typeof appareil.relay_ID === "number")
      .map((appareil) => appareil.relay_ID);

    if (relais_ids.length === 0) {
      return res.status(400).json({ message: "Aucun relais valide trouvé." });
    }

    // ✅ Utiliser relayService pour envoyer UNE SEULE requête au Raspberry Pi
    await relayService.activerDesactiverPlusieursRelais(relais_ids, actif);

    // ✅ Mettre à jour l’état des appareils en base de données
    await Promise.all(
      appareils.map((appareil) => {
        appareil.actif = actif;
        return appareil.save();
      })
    );

    // ✅ Création de l'historique
    const typeOperation = actif ? "Allumer" : "Eteindre";
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: typeOperation,
      description: `${typeOperation} ${appareils.length} appareil(s)`,
      statut: "succès",
    });

    res.status(200).json({
      message: `Tous les appareils ${pieceId ? "de la pièce" : ""} ont été ${
        actif ? "activés" : "désactivés"
      }.`,
    });
  } catch (error) {
    console.error("❌ Erreur lors du contrôle des relais :", error);
    res.status(500).json({
      message: "Erreur lors de l’activation/désactivation des appareils",
      error: error.message,
    });
  }
};

exports.arreterTousLesAppareils = async (req, res) => {
  try {
    console.log("🚨 Alerte reçue du Raspberry Pi : extinction d'urgence !");

    const appareilsActifs = await Appareil.find({ actif: true });
    if (appareilsActifs.length === 0) {
      return res.status(200).json({ message: "Aucun appareil n'était actif." });
    }

    // Get all relay IDs that need to be turned off
    const relais_ids = appareilsActifs
      .filter((appareil) => typeof appareil.relay_ID === "number")
      .map((appareil) => appareil.relay_ID);

    // Turn off all relays physically
    if (relais_ids.length > 0) {
      await relayService.activerDesactiverPlusieursRelais(relais_ids, false);
    }

    // Update database status
    await Promise.all(
      appareilsActifs.map((appareil) => {
        appareil.actif = false;
        return appareil.save();
      })
    );

    // Emit Socket.IO event with more detailed information
    global.io.emit("emergency_shutdown", {
      message:
        "Arrêt d'urgence : Tous les appareils ont été désactivés en raison d'une alerte incendie",
      devices: appareilsActifs.map((app) => ({
        _id: app._id,
        nom_app: app.nom_app,
        pieces_id: app.pieces_id,
      })),
    });

    console.log("🔥 Tous les appareils ont été arrêtés suite à l'alerte !");
    res.status(200).json({
      message:
        "Tous les appareils ont été arrêtés en raison d'une alerte incendie.",
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt d'urgence :", error);
    res.status(500).json({
      message: "Erreur lors de l'arrêt d'urgence des appareils",
      error: error.message,
    });
  }
};

// Définir le mode manuel ou automatique
exports.definirMode = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id); // Correction de la faute de frappe
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    appareil.automatique = req.body.automatique;
    await appareil.save();

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `Définition du mode de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    res.status(200).json(appareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la définition du mode de l'appareil",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareils",
      type_operation: "modif",
      description: `Erreur lors de la définition du mode de l'appareil ${req.body.nom_app}`,
      statut: "erreur",
    });
  }
};

// Créer ou modifier un intervalle pour un appareil
exports.creerIntervalle = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    //créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "Programmation",
      description: `Définition de l'intervalle de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    // Mettre à jour l'intervalle
    appareil.intervalle = req.body.intervalle;
    await appareil.save();

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "Programmation",
      description: `Définition de l'intervalle de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    res.status(200).json(appareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la gestion de l'intervalle",
      error: error.message,
    });

    // Créer un historique en cas d
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `Erreur lors de la définition de l'intervalle de l'appareil ${req.body.nom_app}`,
      statut: "erreur",
    });
  }
};

// Voir l'intervalle d'un appareil
exports.voirIntervalle = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    res.status(200).json(appareil.intervalle);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la récupération de l'intervalle",
      error: error.message,
    });
  }
};

// Supprimer l'intervalle d'un appareil
exports.supprimerIntervalle = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id);
    if (!appareil) {
      return res.status(404).json({ message: "Appareil non trouvé" });
    }

    // Vérifier si l'utilisateur a le droit de modifier cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // creer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `Suppression de l'intervalle de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    // Supprimer l'intervalle
    appareil.intervalle = undefined;
    await appareil.save();

    res.status(200).json({ message: "Intervalle supprimé avec succès" });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la suppression de l'intervalle",
      error: error.message,
    });
  }
};
