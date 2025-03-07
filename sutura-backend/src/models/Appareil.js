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
    intervalle: {
      debut_periode: {
        type: Date, // Date de début
      },
      fin_periode: {
        type: Date, // Date de fin
      },
      heure_debut: {
        type: String, // Heure de début (ex: "19:00")
      },
      heure_fin: {
        type: String, // Heure de fin (ex: "07:00")
      },
    },
    actif: {
      type: Boolean,
      default: false,
    },
    automatique: {
      type: Boolean,
      default: false,
    },
    relay_ID: { type: Number, required: true },

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

  // Vérifier que l'intervalle est bien défini
  if (
    this.intervalle &&
    (this.intervalle.debut_periode ||
      this.intervalle.fin_periode ||
      this.intervalle.heure_debut ||
      this.intervalle.heure_fin)
  ) {
    if (
      !this.intervalle.debut_periode ||
      !this.intervalle.fin_periode ||
      !this.intervalle.heure_debut ||
      !this.intervalle.heure_fin
    ) {
      return next(
        new Error(
          "Si un intervalle est défini, tous ses champs (debut_periode, fin_periode, heure_debut, heure_fin) doivent être renseignés"
        )
      );
    }

    const debutPeriode = new Date(this.intervalle.debut_periode);
    const finPeriode = new Date(this.intervalle.fin_periode);

    if (finPeriode < debutPeriode) {
      return next(
        new Error(
          "La fin de la période doit être postérieure au début de la période"
        )
      );
    }

    // Conversion des heures en minutes
    const [debutH, debutM] = this.intervalle.heure_debut.split(":").map(Number);
    const [finH, finM] = this.intervalle.heure_fin.split(":").map(Number);

    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;

    // Cas où la période est d'un seul jour
    if (debutPeriode.toDateString() === finPeriode.toDateString()) {
      if (finMinutes <= debutMinutes) {
        return next(
          new Error(
            "Si la période est d'un jour, l'heure de fin doit être après l'heure de début"
          )
        );
      }
    }
  }

  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
AppareilSchema.pre("findOneAndUpdate", function (next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Middleware pour gérer l'activation automatique
AppareilSchema.pre("save", function (next) {
  if (
    this.automatique &&
    this.intervalle &&
    this.intervalle.debut_periode &&
    this.intervalle.fin_periode &&
    this.intervalle.heure_debut &&
    this.intervalle.heure_fin
  ) {
    const maintenant = new Date();
    const debutPeriode = new Date(this.intervalle.debut_periode);
    const finPeriode = new Date(this.intervalle.fin_periode);

    // Vérifier si on est dans la période de validité
    if (maintenant >= debutPeriode && maintenant <= finPeriode) {
      const heureActuelle =
        maintenant.getHours() * 60 + maintenant.getMinutes();
      const [debutH, debutM] = this.intervalle.heure_debut
        .split(":")
        .map(Number);
      const [finH, finM] = this.intervalle.heure_fin.split(":").map(Number);

      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;

      if (debutMinutes < finMinutes) {
        // Cas normal : activation entre `heure_debut` et `heure_fin`
        this.actif =
          heureActuelle >= debutMinutes && heureActuelle <= finMinutes;
      } else {
        // Cas traversant minuit : activation si `heure_actuelle` est après `heure_debut` ou avant `heure_fin`
        this.actif =
          heureActuelle >= debutMinutes || heureActuelle <= finMinutes;
      }
    } else {
      this.actif = false;
    }
  }

  next();
});

// Index pour optimiser les requêtes fréquentes
AppareilSchema.index({ users_id: 1 });
AppareilSchema.index({ pieces_id: 1 });
AppareilSchema.index({ actif: 1 });
AppareilSchema.index({ supprime: 1 });

const Appareil = mongoose.model("Appareil", AppareilSchema);

module.exports = Appareil;
