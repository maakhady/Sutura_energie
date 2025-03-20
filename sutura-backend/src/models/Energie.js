const mongoose = require("mongoose");

const EnergieSchema = new mongoose.Schema(
  {
    app_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appareil",
      required: [true, "L'identifiant de l'appareil est requis"],
    },
    consom_energie: {
      type: Number,
      required: [true, "La consommation d'énergie est requise"],
      default: 0, // La consommation depuis la dernière activation
    },
    total_consom: {
      type: Number,
      required: true,
      default: 0, // Consommation totale cumulée
    },
    last_activation: {
      type: Date, // Date de la dernière activation du relais
      default: null,
    },
    date_mesure: {
      type: Date,
      required: [true, "La date de mesure est requise"],
      default: Date.now,
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
    timestamps: false,
  }
);

// Middleware pour mettre à jour la date de modification avant la sauvegarde
EnergieSchema.pre("save", function (next) {
  this.date_modif = Date.now();
  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
EnergieSchema.pre("findOneAndUpdate", function (next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Index pour optimiser les requêtes fréquentes
EnergieSchema.index({ app_id: 1 });
EnergieSchema.index({ date_mesure: -1 });
EnergieSchema.index({ app_id: 1, date_mesure: -1 });

const Energie = mongoose.model("Energie", EnergieSchema);

module.exports = Energie;
