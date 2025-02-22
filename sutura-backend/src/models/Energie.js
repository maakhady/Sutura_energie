const mongoose = require('mongoose');

const EnergieSchema = new mongoose.Schema({
  app_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appareil',
    required: [true, 'L\'identifiant de l\'appareil est requis']
  },
  consom_energie: {
    type: Number,
    required: [true, 'La consommation d\'énergie est requise']
  },
  tension: {
    type: Number,
    required: [true, 'La tension est requise']
  },
  date_mesure: {
    type: Date,
    required: [true, 'La date de mesure est requise'],
    default: Date.now
  },
  date_creation: {
    type: Date,
    default: Date.now
  },
  date_modif: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Désactive les champs createdAt et updatedAt automatiques
});

// Middleware pour mettre à jour la date de modification avant la sauvegarde
EnergieSchema.pre('save', function(next) {
  this.date_modif = Date.now();
  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
EnergieSchema.pre('findOneAndUpdate', function(next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Index pour optimiser les requêtes fréquentes
EnergieSchema.index({ app_id: 1 });
EnergieSchema.index({ date_mesure: -1 }); // Index décroissant pour les requêtes récentes en premier
EnergieSchema.index({ app_id: 1, date_mesure: -1 }); // Index composé pour les requêtes filtrées

const Energie = mongoose.model('Energie', EnergieSchema);

module.exports = Energie;