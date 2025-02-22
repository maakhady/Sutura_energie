const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Utilisateur = require('../models/Utilisateur');
const TokenInvalide = require('../models/TokenInvalide');
const { creerHistorique } = require('./historiqueControleur');


/**
 * Connecter un utilisateur avec email et mot de passe
 * @route POST /api/auth/connexion
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {object} Objet contenant le token et les informations de l'utilisateur
 */
const connexionParEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation des données d'entrée
    if (!email || !password) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion échouée - Données manquantes (email: ${email || 'non fourni'})`,
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Rechercher l'utilisateur
    const utilisateur = await Utilisateur.findOne({ email }).select('+password');

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion échouée - Utilisateur non trouvé (email: ${email})`,
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!utilisateur.actif) {
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion sur un compte désactivé (${utilisateur.nom} ${utilisateur.prenom})`,
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await utilisateur.comparePassword(password);
    if (!isMatch) {
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion échouée - Mot de passe incorrect (${utilisateur.nom} ${utilisateur.prenom})`,
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si c'est le mot de passe par défaut
    if (password === 'Sutura123!') {
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Première connexion - Changement de mot de passe requis (${utilisateur.nom} ${utilisateur.prenom})`,
        statut: 'succès'
      });

      const tempToken = genererToken(utilisateur._id, '10m');
      
      return res.status(200).json({
        success: true,
        passwordChangeRequired: true,
        message: 'Pour des raisons de sécurité, vous devez changer votre mot de passe',
        token: tempToken
      });
    }

    // Connexion réussie
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Connexion réussie (${utilisateur.nom} ${utilisateur.prenom})`,
      statut: 'succès'
    });

    const token = genererToken(utilisateur._id);

    res.status(200).json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur connexionParEmail:', error);
    
    await creerHistorique({
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Erreur système lors de la tentative de connexion: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};
/**
 * Connecter un utilisateur avec son code à 4 chiffres uniquement
 * @route POST /api/auth/connexion-code
 * @param {string} code - Code à 4 chiffres de l'utilisateur
 * @returns {object} Objet contenant le token et les informations de l'utilisateur
 */
const connexionParCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    // Validation des données d'entrée
    if (!code) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: 'Tentative de connexion par code échouée - Code non fourni',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un code'
      });
    }

    // Rechercher l'utilisateur avec le code
    const utilisateur = await Utilisateur.findOne({ code });

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion par code échouée - Code invalide (${code})`,
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Code invalide'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!utilisateur.actif) {
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion par code sur un compte désactivé (${utilisateur.nom} ${utilisateur.prenom})`,
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Connexion réussie - Créer l'historique
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Connexion par code réussie (${utilisateur.nom} ${utilisateur.prenom})`,
      statut: 'succès'
    });

    // Générer le token JWT
    const token = genererToken(utilisateur._id);

    res.status(200).json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur connexionParCode:', error);

    await creerHistorique({
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Erreur système lors de la connexion par code: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion par code'
    });
  }
};

/**
 * Changer le mot de passe initial lors de la première connexion
 * @route POST /api/auth/changer-mot-de-passe-initial
 * @param {string} nouveauPassword - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du nouveau mot de passe
 * @returns {object} Objet contenant le nouveau token et les informations de l'utilisateur
 */
const changerMotDePasseInitial = async (req, res, next) => {
  try {
    const { nouveauPassword, confirmPassword } = req.body;

    // Validation des données d'entrée
    if (!nouveauPassword || !confirmPassword) {
      await creerHistorique({
        users_id: req.user.id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de changement de mot de passe initial échouée - Données manquantes',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nouveau mot de passe et sa confirmation'
      });
    }

    // Vérifier que les mots de passe correspondent
    if (nouveauPassword !== confirmPassword) {
      await creerHistorique({
        users_id: req.user.id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de changement de mot de passe initial échouée - Mots de passe non identiques',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nouveauPassword)) {
      await creerHistorique({
        users_id: req.user.id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de changement de mot de passe initial échouée - Critères de complexité non respectés',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    // Récupérer l'utilisateur
    const utilisateur = await Utilisateur.findById(req.user.id).select('+password');

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      await creerHistorique({
        users_id: req.user.id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de changement de mot de passe initial échouée - Utilisateur non trouvé',
        statut: 'erreur'
      });

      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que le nouveau mot de passe est différent du mot de passe par défaut
    if (nouveauPassword === 'Sutura123!') {
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de changement de mot de passe initial échouée - Utilisation du mot de passe par défaut',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas utiliser le mot de passe par défaut comme nouveau mot de passe'
      });
    }

    // Mettre à jour le mot de passe
    utilisateur.password = nouveauPassword;
    await utilisateur.save();

    // Invalider le token actuel
    await TokenInvalide.create({
      token: req.token,
      dateExpiration: jwt.decode(req.token).exp * 1000
    });

    // Créer l'historique pour le changement réussi
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Changement du mot de passe initial réussi (${utilisateur.nom} ${utilisateur.prenom})`,
      statut: 'succès'
    });

    // Générer un nouveau token JWT
    const token = genererToken(utilisateur._id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe changé avec succès',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur changerMotDePasseInitial:', error);

    await creerHistorique({
      users_id: req.user?.id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Erreur système lors du changement de mot de passe initial: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
};

/**
 * Déconnecter l'utilisateur (invalider le token)
 * @route POST /api/auth/deconnexion
 * @returns {object} Message de confirmation
 */
const deconnexion = async (req, res, next) => {
  try {
    // Stockage du token dans la liste des tokens invalides
    await TokenInvalide.create({
      token: req.token,
      dateExpiration: jwt.decode(req.token).exp * 1000
    });

    // Création de l'historique pour la déconnexion réussie
    await creerHistorique({
      users_id: req.user.id,
      type_entite: 'utilisateur',
      type_operation: 'deconnexion',
      description: `Déconnexion réussie (${req.user.nom} ${req.user.prenom})`,
      statut: 'succès'
    });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur deconnexion:', error);

    // Création de l'historique pour l'erreur de déconnexion
    await creerHistorique({
      users_id: req.user?.id,
      type_entite: 'utilisateur',
      type_operation: 'deconnexion',
      description: `Erreur lors de la déconnexion: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};
/**
 * Récupérer les informations de l'utilisateur connecté
 * @route GET /api/auth/mon-profil
 * @returns {object} Informations de l'utilisateur connecté
 */
const monProfil = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Erreur monProfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations utilisateur'
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
    return jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn }
    );
};

module.exports = {
  connexionParEmail,
  connexionParCode,
  changerMotDePasseInitial,
  deconnexion,
  monProfil
};