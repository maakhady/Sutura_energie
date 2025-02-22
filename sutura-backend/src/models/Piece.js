const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
  users_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'L\'identifiant de l\'utilisateur est requis']
  },
  nom_piece: {
    type: String,
    required: [true, 'Le nom de la pièce est requis'],
    trim: true
  },
  actif: {
    type: Boolean,
    default: true
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
PieceSchema.pre('save', function(next) {
  this.date_modif = Date.now();
  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
PieceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Index composé pour optimiser les recherches fréquentes
PieceSchema.index({ users_id: 1, nom_piece: 1 });

const Piece = mongoose.model('Piece', PieceSchema);

module.exports = Piece;