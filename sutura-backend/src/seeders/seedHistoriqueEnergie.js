// Charger dotenv avant tout autre import
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Vérifier que les variables critiques sont chargées
console.log("Vérification des variables d'environnement:");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Défini" : "✗ Non défini");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ Défini" : "✗ Non défini");
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✓ Défini" : "✗ Non défini");

// Si les variables ne sont pas définies, les définir manuellement pour le script
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'jwt_secret_temporaire_pour_seeding';
if (!process.env.EMAIL_USER) process.env.EMAIL_USER = 'email_user_temporaire_pour_seeding';
if (!process.env.EMAIL_PASSWORD) process.env.EMAIL_PASSWORD = 'email_password_temporaire_pour_seeding';

const mongoose = require('mongoose');
const HistoriqueEnergie = require('../models/HistoriqueEnergie');
const Appareil = require('../models/Appareil');
const connectDB = require('../config/database');

// Fonction pour générer des données historiques d'énergie
const seedHistoriqueEnergie = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('📊 Connexion à la base de données établie');
    
    // Récupérer tous les appareils existants
    const appareils = await Appareil.find();
    
    if (appareils.length === 0) {
      console.error('❌ Aucun appareil trouvé dans la base de données. Veuillez d\'abord créer des appareils.');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`🔌 ${appareils.length} appareils trouvés dans la base de données`);
    
    // Vérifier s'il existe déjà des données d'historique
    const historiqueExistant = await HistoriqueEnergie.countDocuments();
    
    if (historiqueExistant > 0) {
      console.log(`⚠️ ${historiqueExistant} entrées d'historique existent déjà dans la base de données`);
      const reponse = await promptUser('Voulez-vous supprimer ces données et en générer de nouvelles? (O/N): ');
      
      if (reponse.toLowerCase() !== 'o') {
        console.log('🛑 Opération annulée');
        await mongoose.connection.close();
        return;
      }
      
      // Supprimer les données historiques existantes
      await HistoriqueEnergie.deleteMany({});
      console.log('🗑️ Historique existant supprimé');
    }
    
    // Créer des données pour les 12 derniers mois
    const maintenant = new Date();
    const dateDebut = new Date(maintenant);
    dateDebut.setMonth(dateDebut.getMonth() - 12);
    dateDebut.setDate(1);
    dateDebut.setHours(0, 0, 0, 0);
    
    console.log(`📅 Génération de données du ${dateDebut.toLocaleDateString()} au ${maintenant.toLocaleDateString()}`);
    
    const historiques = [];
    const currentDate = new Date(dateDebut);
    
    // Modèles de consommation pour chaque type d'appareil (en kWh par heure)
    const modeleConsommation = {
      // Saisons: [Printemps, Été, Automne, Hiver]
      chauffage: [0.8, 0.1, 0.7, 2.5],
      climatiseur: [0.2, 1.8, 0.3, 0.1],
      refrigerateur: [0.12, 0.15, 0.13, 0.11],
      cuisiniere: [0.5, 0.5, 0.5, 0.5],
      lavelinge: [0.8, 0.7, 0.8, 0.9],
      television: [0.2, 0.18, 0.22, 0.25],
      ordinateur: [0.3, 0.3, 0.3, 0.3],
      autre: [0.4, 0.4, 0.4, 0.4]
    };
    
    // Modèle d'utilisation par jour de la semaine (multiplicateur)
    const utilisationJourSemaine = [
      1.2,  // Dimanche
      1.0,  // Lundi
      1.0,  // Mardi
      1.1,  // Mercredi
      1.0,  // Jeudi
      1.1,  // Vendredi
      1.3   // Samedi
    ];
    
    // Réduire l'intervalle de temps pour accélérer la génération pendant le développement
    // Nous générons une entrée toutes les 3 heures au lieu de chaque heure
    const INTERVAL_HEURES = 3;
    
    // Génération par heures regroupées (pour réduire le nombre d'entrées)
    while (currentDate < maintenant) {
      // Déterminer la saison (0=Printemps, 1=Été, 2=Automne, 3=Hiver)
      const mois = currentDate.getMonth();
      let saison;
      if (mois >= 2 && mois <= 4) saison = 0; // Printemps (mars-mai)
      else if (mois >= 5 && mois <= 7) saison = 1; // Été (juin-août)
      else if (mois >= 8 && mois <= 10) saison = 2; // Automne (sept-nov)
      else saison = 3; // Hiver (déc-fév)
      
      // Jour de la semaine
      const jourSemaine = currentDate.getDay();
      
      // Pour chaque appareil, créer une entrée
      for (const appareil of appareils) {
        // Déterminer le type d'appareil (par défaut = autre)
        const typeAppareil = appareil.type_app || 'autre';
        
        // Obtenir le modèle de consommation pour ce type d'appareil
        const consommationBase = modeleConsommation[typeAppareil] 
          ? modeleConsommation[typeAppareil][saison] 
          : modeleConsommation.autre[saison];
        
        // Ajouter de la variabilité
        const variabilite = consommationBase * 0.3; // 30% de variabilité
        let consommation = consommationBase + (Math.random() * variabilite * 2 - variabilite);
        
        // Appliquer le multiplicateur du jour de la semaine
        consommation *= utilisationJourSemaine[jourSemaine];
        
        // Multiplier par l'intervalle d'heures pour compenser
        consommation *= INTERVAL_HEURES;
        
        // Arrondir à 5 décimales
        consommation = Math.round(consommation * 100000) / 100000;
        
        // Date arrondie à l'heure
        const dateArrondie = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          currentDate.getHours(),
          0,
          0
        );
        
        // Créer l'entrée dans l'historique
        historiques.push({
          app_id: appareil._id,
          date_heure: dateArrondie,
          consommation: consommation
        });
      }
      
      // Avancer de plusieurs heures pour réduire le volume de données
      currentDate.setHours(currentDate.getHours() + INTERVAL_HEURES);
    }
    
    // Afficher le nombre d'entrées à créer
    console.log(`🔢 Nombre total d'entrées à générer: ${historiques.length}`);
    console.log(`⏱️ Temps estimé: ${Math.round(historiques.length / 5000)} minutes`);
    
    // Insérer toutes les données par lots de 1000
    const BATCH_SIZE = 1000;
    let compteur = 0;
    
    for (let i = 0; i < historiques.length; i += BATCH_SIZE) {
      const batch = historiques.slice(i, i + BATCH_SIZE);
      await HistoriqueEnergie.insertMany(batch);
      compteur += batch.length;
      console.log(`⏳ Progression: ${compteur}/${historiques.length} entrées (${Math.round(compteur/historiques.length*100)}%)`);
    }
    
    console.log(`🎉 ${historiques.length} entrées d'historique créées avec succès!`);
    
    // Statistiques rapides
    const total = await HistoriqueEnergie.aggregate([
      { $group: { _id: null, total: { $sum: "$consommation" } } }
    ]);
    
    console.log(`📊 Consommation totale générée: ${total[0].total.toFixed(2)} kWh`);
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('📊 Connexion à la base de données fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
    
    // Afficher la stack trace complète pour un meilleur débogage
    console.error(error.stack);
    
    // Fermer la connexion en cas d'erreur
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Erreur lors de la fermeture de la connexion:', closeError);
    }
    
    process.exit(1);
  }
};

// Fonction pour simuler une interaction utilisateur (comme c'est un script, on va juste retourner 'o')
const promptUser = async (question) => {
  console.log(question);
  return 'o'; // On répond toujours oui pour faciliter l'exécution automatique
};

// Exécuter la fonction de seed
seedHistoriqueEnergie().then(() => {
  console.log('✅ Script terminé avec succès');
}).catch(err => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});