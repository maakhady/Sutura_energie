const mongoose = require("mongoose");

const HistoriqueSchema = new mongoose.Schema(
  {
    // Supprimez le champ id explicite puisque MongoDB crée automatiquement un _id
    app_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appareil",
      required: false, // Rendu optionnel car toutes les opérations n'impliquent pas un appareil
    },
    users_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: false, // Rendu optionnel car toutes les opérations n'impliquent pas un utilisateur
    },
    pieces_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Piece",
      required: false, // Rendu optionnel car toutes les opérations n'impliquent pas une pièce
    },
    type_entite: {
      type: String,
      enum: ["utilisateur", "pieces", "appareil", "energie", "acces"],
      required: [true, "Le type d'entité est requis"],
    },
    type_operation: {
      type: String,
      enum: [
        "creation",
        "modif",
        "suppression",
        "mesure",
        "connexion",
        "deconnexion",
        "change_etat",
        "erreur",
        "porte",
        "Activer",
        "Desactiver",
        "Ouverture",
        "Fermeture",
        "Allumer",
        "Eteindre",
        "Programmation",
      ],
      required: [true, "Le type d'opération est requis"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    statut: {
      type: String,
      enum: ["succès", "erreur", "en cours"],
      required: [true, "Le statut est requis"],
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
HistoriqueSchema.pre("save", function (next) {
  this.date_modif = Date.now();
  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
HistoriqueSchema.pre("findOneAndUpdate", function (next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Index pour optimiser les requêtes fréquentes
HistoriqueSchema.index({ type_entite: 1 });
HistoriqueSchema.index({ type_operation: 1 });
HistoriqueSchema.index({ statut: 1 });
HistoriqueSchema.index({ date_creation: -1 }); // Index décroissant pour les requêtes récentes en premier
HistoriqueSchema.index({ app_id: 1 });
HistoriqueSchema.index({ users_id: 1 });
HistoriqueSchema.index({ pieces_id: 1 });

const Historique = mongoose.model("Historique", HistoriqueSchema);

module.exports = Historique;
