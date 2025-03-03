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
        type: Date, // Date de début de la période (ex: 15 février 2023)
      },
      fin_periode: {
        type: Date, // Date de fin de la période (ex: 22 février 2023)
      },
      heure_debut: {
        type: String, // Heure de début chaque jour (ex: "19:00")
      },
      heure_fin: {
        type: String, // Heure de fin chaque jour (ex: "07:00")
      },
    },
    actif: {
      type: Boolean,
      default: false, // Par défaut, l'appareil est éteint
    },
    automatique: {
      type: Boolean,
      default: false, // Par défaut, l'appareil ne suit pas l'intervalle
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

  // Vérifier que l'intervalle est complet si défini
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

    // Vérifier que la fin de la période est postérieure au début de la période
    if (this.intervalle.fin_periode <= this.intervalle.debut_periode) {
      return next(
        new Error(
          "La fin de la période doit être postérieure au début de la période"
        )
      );
    }

    // Convertir les heures en minutes pour faciliter la comparaison
    const [debutHeures, debutMinutes] = this.intervalle.heure_debut
      .split(":")
      .map(Number);
    const [finHeures, finMinutes] = this.intervalle.heure_fin
      .split(":")
      .map(Number);

    const debutEnMinutes = debutHeures * 60 + debutMinutes;
    const finEnMinutes = finHeures * 60 + finMinutes;

    // Vérifier si l'intervalle s'étend sur deux jours
    const debutPeriode = new Date(this.intervalle.debut_periode);
    const finPeriode = new Date(this.intervalle.fin_periode);

    // Si les dates de début et de fin sont les mêmes, l'intervalle doit être dans la même journée
    if (debutPeriode.toDateString() === finPeriode.toDateString()) {
      // Intervalle dans la même journée
      if (finEnMinutes <= debutEnMinutes) {
        return next(
          new Error(
            "Pour les intervalles dans la même journée, l'heure de fin doit être postérieure à l'heure de début"
          )
        );
      }
    } else {
      // Intervalle sur plusieurs jours
      // Pas besoin de vérifier les heures, car l'intervalle s'étend sur plusieurs jours
    }
  }

  next();
});

// Middleware pour mettre à jour la date de modification avant findOneAndUpdate
AppareilSchema.pre("findOneAndUpdate", function (next) {
  this.set({ date_modif: Date.now() });
  next();
});

// Middleware pour vérifier l'intervalle de temps et mettre à jour l'état actif
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

    // Vérifier si la date actuelle est dans la période définie
    if (maintenant >= debutPeriode && maintenant <= finPeriode) {
      const heureActuelle =
        maintenant.getHours() + ":" + maintenant.getMinutes();
      const heureDebut = this.intervalle.heure_debut;
      const heureFin = this.intervalle.heure_fin;

      // Vérifier si l'heure actuelle est dans l'intervalle quotidien
      if (heureFin < heureDebut) {
        // Intervalle sur deux jours (ex: 19h00 à 07h00)
        this.actif = heureActuelle >= heureDebut || heureActuelle <= heureFin;
      } else {
        // Intervalle dans la même journée
        this.actif = heureActuelle >= heureDebut && heureActuelle <= heureFin;
      }
    } else {
      // En dehors de la période définie, l'appareil est éteint
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
