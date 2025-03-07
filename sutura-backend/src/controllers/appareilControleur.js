const Appareil = require("../models/Appareil");
const relayService = require("../services/relayService");
const { creerHistorique } = require("./historiqueControleur");

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

    // Vérifier si l'utilisateur a le droit de voir cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
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

    // Vérifier si l'utilisateur a le droit de modifier cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
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

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
      description: `${
        req.body.actif ? "Activation" : "Désactivation"
      } de l'appareil ${appareil.nom_app}`,
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

// Définir le mode manuel ou automatique
exports.definirMode = async (req, res) => {
  try {
    const appareil = await Appareil.findById(req.params.id); // Correction de la faute de frappe
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
      type_operation: "creation",
      description: `Définition de l'intervalle de l'appareil ${appareil.nom_app}`,
      statut: "succès",
    });

    // Vérifier si l'utilisateur a le droit de modifier cet appareil
    if (
      req.user.role !== "admin" &&
      appareil.users_id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Mettre à jour l'intervalle
    appareil.intervalle = req.body.intervalle;
    await appareil.save();

    // Créer un historique
    await creerHistorique({
      users_id: req.user._id,
      type_entite: "appareil",
      type_operation: "modif",
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
