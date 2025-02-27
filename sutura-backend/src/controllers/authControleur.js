const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Utilisateur = require('../models/Utilisateur');
const TokenInvalide = require('../models/TokenInvalide');
const { creerHistorique } = require('./historiqueControleur');
const emailService = require('../services/emailService');

/**
 * Connecter un utilisateur avec email et mot de passe
 * @route POST /api/auth/connexion
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {object} Objet contenant le token et les informations de l'utilisateur
 */
const connexionParEmail = async (req, res, next) => {
  try {
    console.log("1. Début de connexionParEmail");
    const { email, password } = req.body;
    console.log(`2. Tentative de connexion pour: ${email}`);
    
    // Validation des données d'entrée
    if (!email || !password) {
      console.log("3. Données manquantes");
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
    console.log("4. Recherche de l'utilisateur dans la base de données");
    const utilisateur = await Utilisateur.findOne({ email }).select('+password');
    console.log("5. Utilisateur trouvé:", !!utilisateur);
    
    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      console.log("6. Utilisateur non trouvé");
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
    console.log("7. Vérification si l'utilisateur est actif:", utilisateur.actif);
    if (!utilisateur.actif) {
      console.log("8. Utilisateur inactif");
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
    
    // Vérifier si l'utilisateur a un mot de passe défini
    console.log("8.5. Vérification si l'utilisateur a un mot de passe défini");
    if (!utilisateur.password) {
      console.log("8.6. Utilisateur sans mot de passe défini");
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'connexion',
        description: `Tentative de connexion échouée - Mot de passe non défini (${utilisateur.nom} ${utilisateur.prenom})`,
        statut: 'erreur'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Veuillez d\'abord définir votre mot de passe en utilisant le lien reçu par email.'
      });
    }
    
    // Vérifier le mot de passe
    console.log("9. Vérification du mot de passe");
    console.log("10. Password fourni présent:", !!password);
    console.log("11. Password hash dans la BDD présent:", !!utilisateur.password);
    
    try {
      const isMatch = await utilisateur.comparePassword(password);
      console.log("12. Résultat de la comparaison:", isMatch);
      
      if (!isMatch) {
        console.log("13. Mot de passe incorrect");
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
    } catch (pwError) {
      console.error("Erreur spécifique lors de la comparaison des mots de passe:", pwError);
      throw pwError;
    }
    
    // Connexion réussie
    console.log("14. Connexion réussie");
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Connexion réussie (${utilisateur.nom} ${utilisateur.prenom})`,
      statut: 'succès'
    });
    
    console.log("15. Génération du token");
    const token = genererToken(utilisateur._id);
    console.log("16. Token généré avec succès");
    
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
    console.error('Erreur connexionParEmail détaillée:', error);
    console.error('Stack trace:', error.stack);
    
    await creerHistorique({
      type_entite: 'utilisateur',
      type_operation: 'connexion',
      description: `Erreur système lors de la tentative de connexion: ${error.message}`,
      statut: 'erreur'
    });
    
    res.status(500).json({
      success: false,
      message: `Erreur lors de la connexion: ${error.message}`
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
const definirMotDePasseInitial = async (req, res, next) => {
  try {
    const { nouveauPassword, confirmPassword } = req.body;
    const { token } = req.params; // Récupérer le token de l'URL

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Vérifier le token et récupérer l'ID de l'utilisateur
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de définition de mot de passe échouée - Token invalide ou expiré',
        statut: 'erreur'
      });

      return res.status(401).json({
        success: false,
        message: 'Lien invalide ou expiré. Veuillez contacter un administrateur.'
      });
    }

    // Validation des données d'entrée
    if (!nouveauPassword || !confirmPassword) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de définition de mot de passe échouée - Données manquantes',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un mot de passe et sa confirmation'
      });
    }

    // Vérifier que les mots de passe correspondent
    if (nouveauPassword !== confirmPassword) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de définition de mot de passe échouée - Mots de passe non identiques',
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
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de définition de mot de passe échouée - Critères de complexité non respectés',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    // Récupérer l'utilisateur
    console.log("Recherche de l'utilisateur avec ID:", decoded.id);
    const utilisateur = await Utilisateur.findById(decoded.id).select('+password');
    console.log("Utilisateur trouvé:", !!utilisateur);

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      await creerHistorique({
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: 'Tentative de définition de mot de passe échouée - Utilisateur non trouvé',
        statut: 'erreur'
      });

      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log("Utilisateur avant mise à jour:", {
      id: utilisateur._id,
      passwordExists: !!utilisateur.password,
      isNew: utilisateur.isNew
    });

    // Mettre à jour le mot de passe
    utilisateur.password = nouveauPassword;
    console.log("Password défini sur l'objet utilisateur:", !!utilisateur.password);

    try {
      console.log("Tentative de sauvegarde...");
      await utilisateur.save();
      console.log("Sauvegarde réussie");

      // Vérifier que le mot de passe a bien été enregistré
      const utilisateurVerif = await Utilisateur.findById(utilisateur._id).select('+password');
      console.log("Vérification après sauvegarde:", {
        id: utilisateurVerif._id,
        passwordExists: !!utilisateurVerif.password
      });
    } catch (saveError) {
      console.error("Erreur lors de la sauvegarde:", saveError);
      throw saveError;
    }

    // Invalider le token utilisé pour définir le mot de passe
    await TokenInvalide.create({
      token: token,
      dateExpiration: decoded.exp * 1000
    });

    // Créer l'historique pour la définition réussie
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Définition du mot de passe initial réussie (${utilisateur.nom} ${utilisateur.prenom})`,
      statut: 'succès'
    });

    // Envoyer l'email de confirmation avec le code
    try {
      await emailService.envoyerConfirmationMotDePasse(utilisateur);

      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: `Email de confirmation envoyé avec succès à ${utilisateur.email}`,
        statut: 'succès'
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);

      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: `Échec de l'envoi d'email de confirmation à ${utilisateur.email}: ${emailError.message}`,
        statut: 'erreur'
      });
      // Ne pas bloquer la suite du processus si l'email échoue
    }

    // Retourner simplement un message de succès sans token
    res.status(200).json({
      success: true,
      message: 'Mot de passe défini avec succès. Vous avez reçu un email avec vos identifiants de connexion.'
    });
  } catch (error) {
    console.error('Erreur definirMotDePasseInitial:', error);

    await creerHistorique({
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Erreur système lors de la définition du mot de passe: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition du mot de passe'
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
  definirMotDePasseInitial,
  deconnexion,
  monProfil
};