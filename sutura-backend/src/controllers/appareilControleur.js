const Appareil = require("../models/Appareil");

// Créer un nouvel appareil à partir d'une pièce
exports.creerAppareil = async (req, res) => {
  try {
    const { pieces_id, nom_app, intervalle, automatique } = req.body;

    const appareil = new Appareil({
      users_id: req.user._id, // Utiliser l'ID de l'utilisateur authentifié
      pieces_id,
      nom_app,
      intervalle,
      automatique: automatique || false, // Par défaut, mode manuel
    });

    const nouvelAppareil = await appareil.save();
    res.status(201).json(nouvelAppareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de l'appareil",
      error: error.message,
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

    res.status(200).json(appareilModifie);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de l'appareil",
      error: error.message,
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

    // Marquer l'appareil comme supprimé et le désactiver
    appareil.supprime = true;
    appareil.actif = false; // Désactiver l'appareil lors de la suppression
    await appareil.save();

    res.status(200).json({ message: "Appareil supprimé avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'appareil",
      error: error.message,
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

    appareil.actif = req.body.actif;
    await appareil.save();

    res.status(200).json(appareil);
  } catch (error) {
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

    res.status(200).json(appareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la définition du mode de l'appareil",
      error: error.message,
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

    res.status(200).json(appareil);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la gestion de l'intervalle",
      error: error.message,
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
