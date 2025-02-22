const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const TokenInvalide = require('../models/TokenInvalide');

/**
 * Middleware d'authentification pour protéger les routes
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 * @param {object} req - Objet requête
 * @param {object} res - Objet réponse
 * @param {function} next - Fonction next
 * @returns {void}
 */
const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }
    
    try {
      // Vérifier si le token est dans la liste noire
      const tokenInvalide = await TokenInvalide.findOne({ token });
      
      if (tokenInvalide) {
        throw new Error('Token invalide');
      }
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier si l'utilisateur existe toujours
      const utilisateur = await Utilisateur.findById(decoded.id);
      
      if (!utilisateur) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Vérifier si l'utilisateur est actif
      if (!utilisateur.actif) {
        return res.status(401).json({
          success: false,
          message: 'Ce compte a été désactivé. Veuillez contacter un administrateur.'
        });
      }
      
      // Ajouter l'utilisateur et le token à la requête
      req.user = utilisateur;
      req.token = token;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expirée, veuillez vous reconnecter'
        });
      }
      
      res.status(401).json({
        success: false,
        message: 'Session invalide ou expirée'
      });
    }
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};




module.exports = { auth };