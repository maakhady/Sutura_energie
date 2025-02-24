const Energie = require('../models/Energie');
const { creerHistorique } = require('./historiqueControleur');

/**
 * Enregistrer une nouvelle mesure d'énergie
 * @route POST /api/energies/enregistrer-mesure
 * @param {string} app_id - ID de l'appareil
 * @param {number} consom_energie - Consommation d'énergie
 * @param {number} tension - Tension mesurée
 * @returns {object} Mesure d'énergie créée
 */
const enregistrerMesure = async (req, res) => {
  try {
    const { app_id, consom_energie, tension } = req.body;

    // Validation des données d'entrée
    if (!app_id || !consom_energie || !tension) {
      await creerHistorique({
        users_id: req.user.id,
        type_entite: 'energie',
        type_operation: 'creation',
        description: 'Tentative d\'enregistrement de mesure échouée - Données manquantes',
        statut: 'erreur'
      });

      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir toutes les informations requises'
      });
    }

    // Créer la mesure d'énergie
    const energie = await Energie.create({
      app_id,
      consom_energie,
      tension,
      date_mesure: new Date()
    });

    // Créer l'historique
    await creerHistorique({
      users_id: req.user.id,
      type_entite: 'energie',
      type_operation: 'creation',
      description: `Nouvelle mesure d'énergie enregistrée pour l'appareil ${app_id}`,
      statut: 'succès'
    });

    res.status(201).json({
      success: true,
      data: energie
    });
  } catch (error) {
    console.error('Erreur enregistrerMesure:', error);
    
    await creerHistorique({
      users_id: req.user.id,
      type_entite: 'energie',
      type_operation: 'creation',
      description: `Erreur lors de l'enregistrement de la mesure: ${error.message}`,
      statut: 'erreur'
    });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la mesure'
    });
  }
};

/**
 * Calculer la consommation d'énergie sur une période donnée
 * @route GET /api/energies/calculer-consommation
 * @param {string} app_id - ID de l'appareil
 * @param {date} date_debut - Date de début de la période
 * @param {date} date_fin - Date de fin de la période
 * @returns {object} Statistiques de consommation
 */
const calculerConsommationPeriode = async (req, res) => {
  try {
    const { app_id, date_debut, date_fin } = req.query;

    // Validation des dates
    const dateDebut = new Date(date_debut);
    const dateFin = new Date(date_fin);

    if (!dateDebut || !dateFin || dateDebut > dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir des dates valides'
      });
    }

    // Rechercher les mesures pour la période
    const mesures = await Energie.find({
      app_id,
      date_mesure: {
        $gte: dateDebut,
        $lte: dateFin
      }
    });

    // Calculer les statistiques
    const consommationTotale = mesures.reduce((total, mesure) => total + mesure.consom_energie, 0);
    const nombreMesures = mesures.length;
    const consommationMoyenne = nombreMesures > 0 ? consommationTotale / nombreMesures : 0;

    res.status(200).json({
      success: true,
      data: {
        consommationTotale,
        consommationMoyenne,
        nombreMesures,
        periode: {
          debut: dateDebut,
          fin: dateFin
        }
      }
    });
  } catch (error) {
    console.error('Erreur calculerConsommationPeriode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la consommation'
    });
  }
};

/**
 * Obtenir les statistiques d'énergie
 * @route GET /api/energies/statistiques
 * @returns {object} Statistiques générales d'énergie
 */
const getStatistiques = async (req, res) => {
  try {
    const stats = await Energie.aggregate([
      {
        $group: {
          _id: '$app_id',
          consommationTotale: { $sum: '$consom_energie' },
          tensionMoyenne: { $avg: '$tension' },
          nombreMesures: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur getStatistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  enregistrerMesure,
  calculerConsommationPeriode,
  getStatistiques
};