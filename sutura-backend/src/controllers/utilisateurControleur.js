const Utilisateur = require("../models/Utilisateur");
const emailService = require("../services/emailService");
const jwt = require("jsonwebtoken"); // Ajoutez cette ligne pour importer jsonwebtoken
const { creerHistorique } = require("./historiqueControleur");
const fingerprintService = require("../services/fingerprintService");

/**
 * Créer un nouvel utilisateur
 * @route POST /api/utilisateurs
 * @access Private/Admin
 */

const creerUtilisateur = async (req, res) => {
  try {
    // Générer un code unique à 4 chiffres
    const code = await Utilisateur.generateUniqueCode();

    // Créer l'utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      ...req.body,
      code,
    });

    // Créer l'historique pour la création réussie
    await creerHistorique({
      users_id: nouvelUtilisateur._id,
      type_entite: "utilisateur",
      type_operation: "creation",
      description: `Création d'un nouvel utilisateur (${nouvelUtilisateur.nom} ${nouvelUtilisateur.prenom})`,
      statut: "succès",
    });

    // Générer un token pour la définition du mot de passe (valide 15 minutes)
    const token = genererToken(nouvelUtilisateur._id, "15m");

    // Envoyer un email de bienvenue avec les identifiants et le lien
    try {
      await emailService.envoyerIdentifiants(nouvelUtilisateur, token);
      console.log(`Email d'invitation envoyé à ${nouvelUtilisateur.email}`);

      // Historique pour l'envoi d'email réussi
      await creerHistorique({
        users_id: nouvelUtilisateur._id,
        type_entite: "utilisateur",
        type_operation: "creation",
        description: `Email d'invitation envoyé avec succès à ${nouvelUtilisateur.email}`,
        statut: "succès",
      });
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email d'invitation:",
        emailError
      );

      // Historique pour l'échec d'envoi d'email
      await creerHistorique({
        users_id: nouvelUtilisateur._id,
        type_entite: "utilisateur",
        type_operation: "creation",
        description: `Échec de l'envoi d'email d'invitation à ${nouvelUtilisateur.email}: ${emailError.message}`,
        statut: "erreur",
      });
    }

    // Ne pas renvoyer le mot de passe dans la réponse
    const utilisateurSansMdp = nouvelUtilisateur.toObject();
    delete utilisateurSansMdp.password;

    // Inclure le token dans la réponse pour les tests
    res.status(201).json({
      success: true,
      message:
        "Utilisateur créé avec succès. Un email d'invitation a été envoyé pour définir le mot de passe.",
      data: utilisateurSansMdp,
      token_for_testing: token, // Ajouter cette ligne pour les tests
    });
  } catch (error) {
    console.error("Erreur creerUtilisateur:", error);

    let message = "Erreur lors de la création de l'utilisateur";
    let statusCode = 500;

    // Gérer les erreurs de validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      message = messages.join(", ");
      statusCode = 400;

      await creerHistorique({
        type_entite: "utilisateur",
        type_operation: "creation",
        description: `Échec de création d'utilisateur - Erreur de validation: ${message}`,
        statut: "erreur",
      });
    }

    // Gérer les erreurs de duplicate (email, téléphone, etc.)
    else if (error.code === 11000) {
      const champ = Object.keys(error.keyValue)[0];
      message = `Ce ${champ} est déjà utilisé`;
      statusCode = 400;

      await creerHistorique({
        type_entite: "utilisateur",
        type_operation: "creation",
        description: `Échec de création d'utilisateur - Doublon: ${message}`,
        statut: "erreur",
      });
    }

    // Erreur système
    else {
      await creerHistorique({
        type_entite: "utilisateur",
        type_operation: "creation",
        description: `Erreur système lors de la création d'utilisateur: ${error.message}`,
        statut: "erreur",
      });
    }

    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * Obtenir tous les utilisateurs
 * @route GET /api/utilisateurs
 * @access Private/Admin
 */
const obtenirTousUtilisateurs = async (req, res) => {
  try {
    // Construire les filtres de recherche à partir des query params
    const filtres = {};

    // Récupérer l'ID de l'utilisateur connecté (admin)
    const adminConnecteId = req.user._id;

    // Construire les filtres de base pour le comptage et la recherche
    const filtresBase = {};

    // Filtre sur le statut actif
    if (req.query.actif !== undefined) {
      filtres.actif = req.query.actif === "true";
      filtresBase.actif = req.query.actif === "true";
    }

    // Filtre sur le rôle
    if (req.query.role) {
      filtresBase.role = req.query.role;
    }

    // Recherche textuelle
    if (req.query.recherche) {
      const recherche = req.query.recherche;
      filtresBase.$or = [
        { nom: { $regex: recherche, $options: "i" } },
        { prenom: { $regex: recherche, $options: "i" } },
        { email: { $regex: recherche, $options: "i" } },
        { code: { $regex: recherche, $options: "i" } },
      ];
    }

    // Compter TOUS les utilisateurs (y compris l'admin connecté)
    const total = await Utilisateur.countDocuments(filtresBase);

    // Ajouter le filtre pour exclure l'admin connecté pour la requête de recherche
    const filtresRecherche = {
      ...filtresBase,
      _id: { $ne: adminConnecteId },
    };

    // Récupérer les utilisateurs avec pagination (sans l'admin connecté)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const utilisateurs = await Utilisateur.find(filtresRecherche)
      .sort({ date_creation: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: total,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: utilisateurs,
    });
  } catch (error) {
    console.error("Erreur obtenirTousUtilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
    });
  }
};

/**
 * Obtenir un utilisateur par son ID
 * @route GET /api/utilisateurs/:id
 * @access Private
 */
const obtenirUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur obtenirUtilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
    });
  }
};

/**
 * Mettre à jour un utilisateur
 * @route PUT /api/utilisateurs/:id
 * @access Private
 */
const mettreAJourUtilisateur = async (req, res) => {
  try {
    // Récupérer l'ancien état pour l'historique
    const ancienUtilisateur = await Utilisateur.findById(req.params.id);
    if (!ancienUtilisateur) {
      await creerHistorique({
        users_id: req.params.id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Tentative de modification d'un utilisateur inexistant (ID: ${req.params.id})`,
        statut: "erreur",
      });

      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Empêcher la modification du mot de passe
    if (req.body.password) {
      delete req.body.password;
    }

    const utilisateurMaj = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { ...req.body, date_modif: Date.now() },
      { new: true, runValidators: true }
    );

    // Créer l'historique des modifications
    await creerHistorique({
      users_id: utilisateurMaj._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Modification de l'utilisateur ${utilisateurMaj.nom} ${utilisateurMaj.prenom}`,
      statut: "succès",
      details: {
        ancien_etat: ancienUtilisateur.toObject(),
        nouvel_etat: utilisateurMaj.toObject(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: utilisateurMaj,
    });
  } catch (error) {
    console.error("Erreur mettreAJourUtilisateur:", error);

    if (error.name === "ValidationError") {
      await creerHistorique({
        users_id: req.params.id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Échec de modification - Erreur de validation: ${Object.values(
          error.errors
        )
          .map((e) => e.message)
          .join(", ")}`,
        statut: "erreur",
      });

      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((val) => val.message)
          .join(", "),
      });
    }

    if (error.code === 11000) {
      const champ = Object.keys(error.keyValue)[0];

      await creerHistorique({
        users_id: req.params.id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Échec de modification - Doublon: ${champ} déjà utilisé`,
        statut: "erreur",
      });

      return res.status(400).json({
        success: false,
        message: `Ce ${champ} est déjà utilisé`,
      });
    }

    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Erreur système lors de la modification: ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
};

/**
 * Supprimer un ou plusieurs utilisateurs (suppression définitive)
 * @route DELETE /api/utilisateurs
 * @access Private/Admin
 */
const supprimerUtilisateurs = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir les IDs des utilisateurs à supprimer",
      });
    }

    // Vérifier si c'est un tableau ou un ID unique
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (idsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun ID d'utilisateur fourni",
      });
    }

    // Créer un historique pour chaque utilisateur avant sa suppression
    for (const id of idsArray) {
      const utilisateur = await Utilisateur.findById(id);
      if (utilisateur) {
        await creerHistorique({
          users_id: utilisateur._id,
          type_entite: "utilisateur",
          type_operation: "suppression",
          description: `Suppression définitive de l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
          statut: "succès",
        });
      }
    }

    // Supprimer définitivement tous les utilisateurs indiqués
    const result = await Utilisateur.deleteMany({ _id: { $in: idsArray } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun utilisateur trouvé avec les IDs fournis",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} utilisateur(s) supprimé(s) définitivement`,
      count: result.deletedCount,
    });
  } catch (error) {
    console.error("Erreur supprimerUtilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression définitive des utilisateurs",
    });
  }
};

/**
 * Activer/Désactiver un utilisateur
 * @route PATCH /api/utilisateurs/:id/toggle-statut
 * @access Private/Admin
 */
const toggleStatutUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Inverser le statut actif
    utilisateur.actif = !utilisateur.actif;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    const statut = utilisateur.actif ? "activé" : "désactivé";

    // Créer l'historique pour le changement de statut
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "change_etat",
      description: `Utilisateur ${utilisateur.nom} ${utilisateur.prenom} a été ${statut}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: `Utilisateur ${statut} avec succès`,
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur toggleStatutUtilisateur:", error);

    // Créer l'historique pour l'échec du changement de statut
    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "change_etat",
      description: `Échec du changement de statut pour l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut de l'utilisateur",
    });
  }
};

/**
 * Assigner une carte RFID à un utilisateur
 * @route PATCH /api/utilisateurs/:id/assigner-carte
 * @access Private/Admin
 */
const assignerCarteRFID = async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un identifiant de carte RFID",
      });
    }

    // Vérifier si la carte est déjà assignée à un autre utilisateur
    const utilisateurExistant = await Utilisateur.findOne({ cardId });
    if (
      utilisateurExistant &&
      utilisateurExistant._id.toString() !== req.params.id
    ) {
      return res.status(400).json({
        success: false,
        message: "Cette carte RFID est déjà assignée à un autre utilisateur",
      });
    }

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      {
        cardId,
        cardActive: true, // Initialiser la carte comme active
        date_modif: Date.now(),
      },
      { new: true }
    );

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Créer l'historique pour l'assignation de la carte RFID
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Carte RFID ${cardId} assignée à l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Carte RFID assignée avec succès",
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur assignerCarteRFID:", error);

    // Créer l'historique pour l'échec de l'assignation de la carte RFID
    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de l'assignation de la carte RFID à l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'assignation de la carte RFID",
    });
  }
};
/**
 * Démarrer le mode d'assignation RFID en temps réel
 * @route POST /api/utilisateurs/:id/demarrer-assignation-rfid
 * @access Private/Admin
 */
const demarrerAssignationRFID = async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier si l'utilisateur a déjà une carte RFID
    if (utilisateur.cardId) {
      return res.status(400).json({
        success: false,
        message:
          "Cet utilisateur a déjà une carte RFID assignée. Désassignez-la d'abord.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Mode d'assignation RFID démarré. En attente de présentation d'une carte.",
    });
  } catch (error) {
    console.error("Erreur demarrerAssignationRFID:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors du démarrage du mode d'assignation RFID",
    });
  }
};

/**
 * Désassigner une carte RFID d'un utilisateur
 * @route DELETE /api/utilisateurs/:id/desassigner-carte
 * @access Private/Admin
 */
const desassignerCarteRFID = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (!utilisateur.cardId) {
      return res.status(400).json({
        success: false,
        message: "Cet utilisateur n'a pas de carte RFID assignée",
      });
    }

    // Utiliser $unset au lieu d'assigner null
    await Utilisateur.updateOne(
      { _id: req.params.id },
      {
        $unset: { cardId: "" },
        $set: { cardActive: false, date_modif: Date.now() },
      }
    );

    // Récupérer l'utilisateur mis à jour
    const utilisateurMisAJour = await Utilisateur.findById(req.params.id);

    // Créer l'historique pour la désassignation de la carte RFID
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Carte RFID désassignée de l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Carte RFID désassignée avec succès",
      data: utilisateurMisAJour,
    });
  } catch (error) {
    console.error("Erreur desassignerCarteRFID:", error);

    // Créer l'historique pour l'échec de la désassignation de la carte RFID
    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la désassignation de la carte RFID pour l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la désassignation de la carte RFID",
    });
  }
};

/**
 * Assigner une empreinte digitale à un utilisateur
 * @route PATCH /api/utilisateurs/:id/assigner-empreinte
 * @access Private/Admin
 */
const assignerEmpreinte = async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Veuillez fournir un identifiant d'empreinte digitale",
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier si le périphérique d'empreinte est connecté
    if (!fingerprintService.isDeviceConnected()) {
      return res.status(503).json({
        success: false,
        message: "Le dispositif d'empreinte digitale n'est pas connecté",
      });
    }

    // Vérifier si l'utilisateur a déjà une empreinte
    if (utilisateur.empreinteID) {
      return res.status(400).json({
        success: false,
        message:
          "Cet utilisateur a déjà une empreinte digitale assignée. Désassignez-la d'abord.",
      });
    }

    // Déclencher l'enregistrement de l'empreinte
    const result = await fingerprintService.declencherEnregistrement(
      utilisateurId
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Empreinte digitale assignée avec succès",
      data: utilisateur,
      message:
        "Processus d'enregistrement d'empreinte initié. Veuillez suivre les instructions sur le dispositif.",
      data: {
        empreinteID: result.fingerprintID,
        utilisateur: {
          id: utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
        },
      },
    });
  } catch (error) {
    console.error("Erreur assignerEmpreinte:", error);

    // Créer l'historique pour l'échec de l'assignation de l'empreinte digitale
    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de l'assignation de l'empreinte digitale à l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    console.error("Erreur assignerEmpreinte:", error);

    // Créer l'historique pour l'échec
    try {
      await creerHistorique({
        users_id: req.params.id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Échec de l'assignation de l'empreinte digitale: ${error.message}`,
        statut: "erreur",
      });
    } catch (histoError) {
      console.error("Erreur lors de la création de l'historique:", histoError);
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'assignation de l'empreinte digitale",
      message:
        "Erreur lors de l'assignation de l'empreinte digitale: " +
        error.message,
    });
  }
};

/**
 * Désassigner une empreinte digitale d'un utilisateur
 * @route DELETE /api/utilisateurs/:id/desassigner-empreinte
 * @access Private/Admin
 */
const desassignerEmpreinte = async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier si l'utilisateur a une empreinte
    if (!utilisateur.empreinteID) {
      return res.status(400).json({
        success: false,
        message: "Cet utilisateur n'a pas d'empreinte digitale assignée",
      });
    }

    // Vérifier si le périphérique d'empreinte est connecté
    if (!fingerprintService.isDeviceConnected()) {
      // Si le périphérique n'est pas connecté, on supprime quand même l'empreinte de la BDD
      console.warn(
        "Le dispositif d'empreinte n'est pas connecté. Suppression de l'empreinte uniquement dans la base de données."
      );

      // Garder l'ancien ID pour l'historique
      const ancienID = utilisateur.empreinteID;

      // Mettre à jour l'utilisateur
      utilisateur.empreinteID = null;
      utilisateur.date_modif = Date.now();
      await utilisateur.save();

      // Créer l'historique pour la désassignation
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Empreinte digitale ${ancienID} désassignée de l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} (dispositif non connecté)`,
        statut: "succès",
      });

      return res.status(200).json({
        success: true,
        message:
          "Empreinte digitale désassignée avec succès dans la base de données. Dispositif non connecté.",
        data: utilisateur,
      });
    }

    // Utiliser le service pour supprimer l'empreinte
    const result = await fingerprintService.supprimerEmpreinte(utilisateurId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Empreinte digitale désassignée avec succès",
      data: result.utilisateur,
    });
  } catch (error) {
    console.error("Erreur desassignerEmpreinte:", error);

    // Créer l'historique pour l'échec
    try {
      await creerHistorique({
        users_id: req.params.id,
        type_entite: "utilisateur",
        type_operation: "modif",
        description: `Échec de la désassignation de l'empreinte digitale: ${error.message}`,
        statut: "erreur",
      });
    } catch (histoError) {
      console.error("Erreur lors de la création de l'historique:", histoError);
    }

    res.status(500).json({
      success: false,
      message:
        "Erreur lors de la désassignation de l'empreinte digitale: " +
        error.message,
    });
  }
};

/**
 * Vérifier le statut de l'enregistrement d'une empreinte
 * @route GET /api/utilisateurs/:id/empreinte/statut
 * @access Privé/Admin
 */
const verifierStatutEmpreinte = async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier le statut de l'enregistrement
    const statut = fingerprintService.getEnrollmentStatus(utilisateurId);

    if (!statut) {
      return res.status(200).json({
        success: true,
        statut: "aucun",
        message:
          "Aucun enregistrement d'empreinte en cours pour cet utilisateur",
        empreinte: utilisateur.empreinteID,
      });
    }

    res.status(200).json({
      success: true,
      statut: statut.status,
      tempsPasse: statut.timeElapsed,
      message: "Statut de l'enregistrement d'empreinte",
      empreinte: utilisateur.empreinteID,
    });
  } catch (error) {
    console.error("Erreur verifierStatutEmpreinte:", error);

    res.status(500).json({
      success: false,
      message:
        "Erreur lors de la vérification du statut de l'empreinte: " +
        error.message,
    });
  }
};

/**
 * Demander la réinitialisation du mot de passe
 * @route POST /api/utilisateurs/demander-reinitialisation
 * @param {string} email - Email de l'utilisateur
 * @returns {object} Message de confirmation
 */
const demanderReinitialisation = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation des données d'entrée
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email",
      });
    }

    console.log("Recherche de l'utilisateur avec l'email:", email);
    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      console.log("Utilisateur non trouvé pour l'email:", email);
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Générer un token de réinitialisation
    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    console.log("Token de réinitialisation généré:", token);

    // Envoyer l'email avec le lien de réinitialisation
    await emailService.envoyerLienReinitialisation(utilisateur, token);
    console.log("Email de réinitialisation envoyé à:", utilisateur.email);

    // Créer l'historique pour la demande de réinitialisation
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Demande de réinitialisation de mot de passe pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Email de réinitialisation envoyé",
      token,
      message: "Email de réinitialisation envoyé",
    });
  } catch (error) {
    console.error("Erreur demanderReinitialisation:", error);

    // Créer l'historique pour l'échec de la demande de réinitialisation
    await creerHistorique({
      users_id: req.body.email, // Utiliser l'email pour identifier l'utilisateur en cas d'échec
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la demande de réinitialisation de mot de passe pour l'email ${req.body.email}: ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la demande de réinitialisation du mot de passe",
    });
  }
};

/**
 * Réinitialiser le mot de passe
 * @route POST /api/utilisateurs/reinitialiser-mot-de-passe
 * @param {string} token - Token de réinitialisation
 * @param {string} nouveauPassword - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du nouveau mot de passe
 * @returns {object} Message de confirmation
 */
const reinitialiserMotDePasse = async (req, res) => {
  try {
    const { token, nouveauPassword, confirmPassword } = req.body;

    // Validation des données d'entrée
    if (!token || !nouveauPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir toutes les informations nécessaires",
      });
    }

    // Vérifier que les nouveaux mots de passe correspondent
    if (nouveauPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les nouveaux mots de passe ne correspondent pas",
      });
    }

    // Vérifier le token de réinitialisation
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé:", decoded);

    const utilisateur = await Utilisateur.findById(decoded.id).select(
      "+password"
    );
    console.log("Utilisateur trouvé:", utilisateur);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await utilisateur.comparePassword(actuelPassword);
    console.log("Mot de passe correspond:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe actuel incorrect",
      });
    }

    // Mettre à jour le mot de passe
    utilisateur.password = nouveauPassword;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    // Envoyer une confirmation de réinitialisation
    await emailService.envoyerConfirmationReinitialisation(utilisateur);

    // Créer l'historique pour la réinitialisation du mot de passe
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Mot de passe réinitialisé pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur reinitialiserMotDePasse:", error);

    // Créer l'historique pour l'échec de la réinitialisation du mot de passe
    await creerHistorique({
      users_id: req.body.token
        ? jwt.verify(req.body.token, process.env.JWT_SECRET).id
        : null,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la réinitialisation du mot de passe: ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
    });
  }
};

/**
 * Changer le mot de passe
 * @route POST /api/utilisateurs/changerpassword
 * @param {string} token - Token de réinitialisation
 * @param {string} actuelPassword - Mot de passe actuel
 * @param {string} nouveauPassword - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du nouveau mot de passe
 * @returns {object} Message de confirmation
 */

const changerpassword = async (req, res) => {
  try {
    const { actuelPassword, nouveauPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Supposant que l'ID de l'utilisateur est disponible via l'authentification

    // Validation des données d'entrée
    if (!actuelPassword || !nouveauPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir toutes les informations nécessaires",
      });
    }

    // Vérifier que les nouveaux mots de passe correspondent
    if (nouveauPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les nouveaux mots de passe ne correspondent pas",
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const utilisateur = await Utilisateur.findById(userId).select("+password");

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await utilisateur.comparePassword(actuelPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe actuel incorrect",
      });
    }

    // Mettre à jour le mot de passe
    utilisateur.password = nouveauPassword;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    // Créer l'historique pour le changement de mot de passe
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Mot de passe modifié pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur changerMotDePasse:", error);

    // Créer l'historique pour l'échec du changement de mot de passe
    await creerHistorique({
      users_id: req.user?.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la modification du mot de passe: ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du mot de passe",
    });
  }
};

/**
 * Désactiver une carte RFID par l'utilisateur lui-même
 * @route PATCH /api/utilisateurs/desactiver-ma-carte
 * @access Private (utilisateur connecté uniquement)
 */
const desactiverMaCarteRFID = async (req, res) => {
  try {
    // L'utilisateur est celui qui est connecté (via middleware auth)
    const utilisateur = await Utilisateur.findById(req.user.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (!utilisateur.cardId) {
      return res.status(400).json({
        success: false,
        message: "Vous n'avez pas de carte RFID assignée",
      });
    }

    // On conserve le cardId mais on ajoute un flag pour indiquer que la carte est désactivée
    utilisateur.cardActive = false;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    // Créer l'historique pour la désactivation de la carte RFID
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Carte RFID désactivée par l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Votre carte RFID a été désactivée avec succès",
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur desactiverMaCarteRFID:", error);

    // Créer l'historique pour l'échec de la désactivation de la carte RFID
    await creerHistorique({
      users_id: req.user.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la désactivation de la carte RFID pour l'utilisateur (ID: ${req.user.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la désactivation de votre carte RFID",
    });
  }
};

const desactiverCarteRFIDParAdmin = async (req, res) => {
  try {
    // Vérification implicite des droits d'admin via le middleware verifRole

    // Récupérer l'utilisateur dont la carte doit être désactivée
    const utilisateur = await Utilisateur.findById(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (!utilisateur.cardId) {
      return res.status(400).json({
        success: false,
        message: "Cet utilisateur n'a pas de carte RFID assignée",
      });
    }

    if (utilisateur.cardActive === false) {
      return res.status(400).json({
        success: false,
        message: "La carte RFID de cet utilisateur est déjà désactivée",
      });
    }

    // Désactiver la carte
    utilisateur.cardActive = false;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    // Récupérer les infos de l'admin pour l'historique
    const admin = await Utilisateur.findById(req.user.id);

    // Créer l'historique pour la désactivation de la carte par l'admin
    await creerHistorique({
      users_id: req.user.id, // ID de l'admin qui effectue l'action
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Carte RFID désactivée pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} par l'administrateur ${admin.nom} ${admin.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Carte RFID désactivée avec succès",
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur desactiverCarteRFIDParAdmin:", error);

    // Créer l'historique pour l'échec de la désactivation de la carte
    await creerHistorique({
      users_id: req.user.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la désactivation de la carte RFID pour l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la désactivation de la carte RFID",
    });
  }
};

/**
 * Réactiver la carte RFID d'un utilisateur (réservé à l'admin)
 * @route PATCH /api/utilisateurs/:id/reactiver-carte
 * @access Private/Admin
 */
const reactiverCarteRFID = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (!utilisateur.cardId) {
      return res.status(400).json({
        success: false,
        message: "Cet utilisateur n'a pas de carte RFID assignée",
      });
    }

    if (utilisateur.cardActive) {
      return res.status(400).json({
        success: false,
        message: "La carte RFID de cet utilisateur est déjà active",
      });
    }

    utilisateur.cardActive = true;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();

    // Créer l'historique pour la réactivation de la carte RFID
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Carte RFID réactivée pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: "succès",
    });

    res.status(200).json({
      success: true,
      message: "Carte RFID réactivée avec succès",
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur reactiverCarteRFID:", error);

    // Créer l'historique pour l'échec de la réactivation de la carte RFID
    await creerHistorique({
      users_id: req.params.id,
      type_entite: "utilisateur",
      type_operation: "modif",
      description: `Échec de la réactivation de la carte RFID pour l'utilisateur (ID: ${req.params.id}): ${error.message}`,
      statut: "erreur",
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la réactivation de la carte RFID",
    });
  }
};

/**
 * Fonction utilitaire pour générer un token JWT
 * @param {string} id - ID de l'utilisateur
 * @param {string} expiresIn - Durée de validité du token
 * @returns {string} Token JWT
 */
const genererToken = (id, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = {
  creerUtilisateur,
  obtenirTousUtilisateurs,
  obtenirUtilisateur,
  mettreAJourUtilisateur,
  supprimerUtilisateurs,
  toggleStatutUtilisateur,
  assignerCarteRFID,
  desassignerCarteRFID,
  assignerEmpreinte,
  desassignerEmpreinte,
  reinitialiserMotDePasse,
  desactiverMaCarteRFID,
  reactiverCarteRFID,
  demanderReinitialisation,
  changerpassword,
  verifierStatutEmpreinte,
  demarrerAssignationRFID,
  desactiverCarteRFIDParAdmin,
};
