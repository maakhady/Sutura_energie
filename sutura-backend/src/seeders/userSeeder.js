const mongoose = require('mongoose');
const Utilisateur = require('../models/Utilisateur');
const connectDB = require('../config/database');
require('dotenv').config();

// Fonction pour créer un admin par défaut
const seedAdmin = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // Vérifier si un admin existe déjà
    const adminExistant = await Utilisateur.findOne({ role: 'admin' });
    
    if (adminExistant) {
      console.log('Un administrateur existe déjà dans la base de données');
      console.log('Email: ' + adminExistant.email);
      console.log('Code: ' + adminExistant.code);
      await mongoose.connection.close();
      return;
    }

    // Générer un code unique à 4 chiffres
    const code = await Utilisateur.generateUniqueCode();

    // Créer un admin
    const admin = await Utilisateur.create({
      nom: 'Diaw',
      prenom: 'MaKhady',
      email: 'haadeewida@gmail.com',
      code, 
      password: 'Sutura123!',
      role: 'admin',
      telephone: 771846364,
      actif: true,
      date_creation: Date.now(),
      date_modif: Date.now()
    });

    console.log('Administrateur créé avec succès:');
    console.log('Email: ' + admin.email);
    console.log('Code: ' + admin.code);
    console.log('Mot de passe: Sutura123!');

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');

  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    process.exit(1);
  }
};

// Exécuter la fonction de seed
seedAdmin();