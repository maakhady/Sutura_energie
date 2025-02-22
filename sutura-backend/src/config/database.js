const mongoose = require('mongoose');
const config = require('./config');

// Désactiver le mode strict des requêtes pour permettre plus de flexibilité
mongoose.set('strictQuery', false);

// Fonction pour connecter à la base de données MongoDB
const connectDB = async () => {
  try {
    // Établir la connexion sans les options dépréciées
    const conn = await mongoose.connect(config.database.uri);

    console.log(`MongoDB connecté: ${conn.connection.host}`);

    // Configurer les événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connecté');
    });

    mongoose.connection.on('error', err => {
      console.error(`Erreur de connexion MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB déconnecté, tentative de reconnexion...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnecté');
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('Échec de la reconnexion à MongoDB');
    });

    // Gérer les signaux de fermeture
    const fermerConnexion = async () => {
      try {
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
        process.exit(0);
      } catch (erreur) {
        console.error('Erreur lors de la fermeture de la connexion MongoDB:', erreur);
        process.exit(1);
      }
    };

    process.on('SIGINT', fermerConnexion);
    process.on('SIGTERM', fermerConnexion);

    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;