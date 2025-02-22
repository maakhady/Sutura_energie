const dotenv = require('dotenv');

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Configuration centralisée de l'application
const config = {
  // Serveur
  server: {
    port: parseInt(process.env.PORT) || 2500,
    env: process.env.NODE_ENV || 'development',
  },

  // Base de données
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sutura_energie'
  },

  // JWT (authentification)
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '1h',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || '1d'
  },

  // Email
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'Sutura-Energie <makhadypro@gmail.com>'
  },

  // CORS (sécurité cross-origin)
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },

  // Rate limiting (protection contre les abus)
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 100 requêtes max par fenêtre
  },

  // API
  api: {
    prefix: '/api' // Préfixe pour toutes les routes API
  }
};

// Vérifier la présence des variables d'environnement critiques
const requiredEnvVars = [
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
