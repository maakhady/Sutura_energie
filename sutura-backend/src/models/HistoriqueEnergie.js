const mongoose = require("mongoose");

const HistoriqueEnergieSchema = new mongoose.Schema({
  app_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appareil",
    required: true,
  },
  date_heure: {
    type: Date,
    required: true,
    index: true,
  },
  consommation: {
    type: Number,
    required: true,
    default: 0,
  },
});

HistoriqueEnergieSchema.index({ app_id: 1, date_heure: 1 }, { unique: true });

const HistoriqueEnergie = mongoose.model(
  "HistoriqueEnergie",
  HistoriqueEnergieSchema
);
module.exports = HistoriqueEnergie;
