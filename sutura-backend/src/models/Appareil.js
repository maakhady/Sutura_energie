const mongoose = require("mongoose");

const AppareilSchema = new mongoose.Schema(
  {
    users_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: [true, "L'identifiant de l'utilisateur est requis"],
    },
    pieces_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Piece",
      required: [true, "L'identifiant de la pièce est requis"],
    },
    nom_app: {
      type: String,
      required: [true, "Le nom de l'appareil est requis"],
      trim: true,
    },
    heure_debut: {
      type: Date, // Optionnel
    },
    heure_fin: {
      type: Date, // Optionnel
    },
    actif: {
      type: Boolean,
      default: true,
    },
    supprime: {
      type: Boolean,
      default: false, // Marquer comme supprimé
    },
    date_creation: {
      type: Date,
      default: Date.now,
    },
    date_modif: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Désactive les champs createdAt et updatedAt automatiques
  }
);

// Middleware pour mettre à jour la date de modification avant la sauvegarde
AppareilSchema.pre("save", function (next) {
  this.date_modif = Date.now();

  // Vérifier que l'heure de fin est postérieure à l'heure de début (uniquement si les deux sont définis)
  if (
    this.heure_fin &&
    this.heure_debut &&
    this.heure_fin <= this.heure_debut
  ) {
    return next(
      new Error("L'heure de fin doit être postérieure à l'heure de début")
    );
  }

  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
AppareilSchema.pre("findOneAndUpdate", function (next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Index pour optimiser les requêtes fréquentes
AppareilSchema.index({ users_id: 1 });
AppareilSchema.index({ pieces_id: 1 });
AppareilSchema.index({ actif: 1 });
AppareilSchema.index({ supprime: 1 });

const Appareil = mongoose.model("Appareil", AppareilSchema);

module.exports = Appareil;
