/**
 * Configuration du service d'email
 * Basé sur les variables d'environnement
 */
const emailConfig = {
    // Service email (Gmail, Outlook, etc.)
    service: process.env.EMAIL_SERVICE,
    
    // Configuration du serveur SMTP
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: parseInt(process.env.EMAIL_PORT) === 465, // true pour le port 465 (SSL), false pour les autres
    
    // Identifiants de connexion
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    
    // Expéditeur par défaut
    from: process.env.EMAIL_FROM || `Sutura Énergie <${process.env.EMAIL_USER}>`
  };
  
  module.exports = emailConfig;