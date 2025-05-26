const Energie = require("../models/Energie");
const HistoriqueEnergie = require("../models/HistoriqueEnergie");
const Appareil = require("../models/Appareil");

// Tension fixe (V)
const TENSION = 220;
const SEUIL_ALERTE_PUISSANCE = 40;
// Instance WebSocket
let io;
const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

let longestActiveDevice = {
  appareil: null,
  duree: 0,
  startTime: null,
};
let maxPuissance = {
  valeur: 0,
  appareil: null,
  timestamp: null,
};
//  Traitement des données envoyées par le Raspberry
// Traitement des données envoyées par le Raspberry
const recevoirDonneesCapteurs = async (req, res) => {
  try {
    console.log("📥 Données reçues :", req.body);

    const sensors = req.body.sensors;

    if (!Array.isArray(sensors) || sensors.length !== 6) {
      console.error("❌ Format des données invalide :", sensors);
      return res.status(400).json({ message: "Format des données invalide." });
    }

    const appareils = await Appareil.find(); // Récupération de tous les appareils
    const now = new Date();

    for (let i = 0; i < sensors.length; i++) {
      const courant = sensors[i]; // Courant mesuré (A)
      const appareil = appareils.find((a) => a.relay_ID === i + 1);
      const puissance = courant * TENSION; // Calcul de la puissance (P = U * I)

      console.log(
        `⚡ Appareil ${i + 1} :`,
        appareil ? appareil.nom_app : "Non trouvé",
        "| Courant:",
        courant,
        "A"
      );
      if (puissance > maxPuissance.valeur) {
        maxPuissance = {
          valeur: puissance,
          appareil: appareil,
          timestamp: now,
        };
        // Emit the new max power value
        if (io) {
          io.emit("maxPuissanceUpdate", {
            puissance: puissance,
            appareil: {
              nom: appareil.nom_app,
              piece: appareil.pieces_id,
            },
            timestamp: now,
          });
        }
      }
      if (!appareil) continue;

      const energie_kWh = puissance * (1 / 3600); // Conso en kWh sur 1 sec

      //  Alerte si puissance supérieure au seuil et appareil actif
      if (puissance > SEUIL_ALERTE_PUISSANCE && appareil.actif) {
        if (io) {
          io.emit("alerteSurconsommation", {
            app_id: appareil._id,
            nom_app: appareil.nom_app,
            puissance: puissance,
            seuil: SEUIL_ALERTE_PUISSANCE,
            timestamp: now,
          });
          console.log(
            `⚠️ Alerte surconsommation pour ${appareil.nom_app}: ${puissance}W`
          );
        }
      }

      console.log(
        `🔋 Calcul : Puissance = ${puissance} W | Énergie = ${energie_kWh} kWh`
      );

      let energie = await Energie.findOne({ app_id: appareil._id });

      if (!energie) {
        energie = new Energie({
          app_id: appareil._id,
          consom_energie: 0,
          total_consom: 0,
          last_activation: null,
        });
      }

      // Track active duration
      if (appareil.actif) {
        if (!appareil.lastActivationTime) {
          appareil.lastActivationTime = now;
          await appareil.save();
        }

        const activeDuration = (now - appareil.lastActivationTime) / 1000; // in seconds
        if (activeDuration > longestActiveDevice.duree) {
          longestActiveDevice = {
            appareil: appareil,
            duree: activeDuration,
            startTime: appareil.lastActivationTime,
          };
          // Emit the new longest active device
          if (io) {
            io.emit("longestActiveDeviceUpdate", {
              appareil: {
                nom: appareil.nom_app,
                piece: appareil.pieces_id,
              },
              duree: activeDuration,
              startTime: appareil.lastActivationTime,
            });
          }
        }
      }

      // 🚀 Nouvelle logique d'arrêt :
      if (courant === 0 || appareil.actif === false) {
        energie.consom_energie = 0;
        energie.last_activation = null;
      } else {
        if (!energie.last_activation) {
          energie.last_activation = now;
        }
        energie.consom_energie += energie_kWh;
        energie.total_consom += energie_kWh;
      }

      await energie.save();
      console.log("✅ Énergie mise à jour :", energie);

      // 📌 Enregistrement de l'historique toutes les heures
      const dateHeureArrondie = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        0,
        0
      );

      await HistoriqueEnergie.findOneAndUpdate(
        { app_id: appareil._id, date_heure: dateHeureArrondie },
        { $inc: { consommation: energie_kWh } },
        { upsert: true, new: true }
      );

      // 📡 Envoi des données en temps réel via WebSocket
      if (io) {
        io.emit("updateConso", {
          app_id: appareil._id,
          nom_app: appareil.nom_app,
          consom_energie: energie.consom_energie,
          total_consom: energie.total_consom,
        });
        console.log("📡 Données envoyées via WebSocket :", {
          app_id: appareil._id,
          nom_app: appareil.nom_app,
          consom_energie: energie.consom_energie,
          total_consom: energie.total_consom,
        });
      }
    }

    res.status(200).json({ message: "Données traitées avec succès" });
  } catch (error) {
    console.error("❌ Erreur traitement capteurs :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Récupérer l’historique de consommation
const getHistorique = async (req, res) => {
  try {
    const historique = await HistoriqueEnergie.find()
      .populate({
        path: "app_id",
        select: "nom_app pieces_id",
        populate: {
          path: "pieces_id",
          select: "nom_piece",
        },
      })
      .sort({ date_heure: -1 });

    // Format the data for frontend consumption
    const formattedHistorique = historique.map((entry) => ({
      id: entry._id,
      appareil: entry.app_id?.nom_app || "Unknown Device",
      piece: entry.app_id?.pieces_id?.nom_piece || "Unknown Room",
      consommation: parseFloat(entry.consommation).toFixed(2),
      date: new Date(entry.date_heure).toLocaleString(),
      timestamp: entry.date_heure,
    }));

    res.json({
      success: true,
      data: formattedHistorique,
    });
  } catch (error) {
    console.error("Error retrieving energy history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 📌 Récupérer la consommation totale de chaque appareil
const getConsommationTotale = async (req, res) => {
  try {
    const consommations = await Energie.find().populate("app_id");
    console.log(" Consommation totale :", consommations);
    res.json(consommations);
  } catch (error) {
    console.error(" Erreur récupération consommation totale :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer la consommation totale de tous les appareils
const getConsommationTotaleAll = async (req, res) => {
  try {
    const total = await Energie.aggregate([
      {
        $group: {
          _id: null,
          total_conso: { $sum: "$total_consom" },
        },
      },
    ]);

    const consommationTotale = total.length > 0 ? total[0].total_conso : 0;

    console.log(
      "📊 Consommation totale de tous les appareils :",
      consommationTotale
    );

    res.json({ consommation_totale: consommationTotale });

    // 📡 Envoi en temps réel via WebSocket
    if (io) {
      io.emit("updateConsommationTotaleAll", {
        consommation_totale: consommationTotale,
      });
      console.log("📡 Consommation totale envoyée en temps réel !");
    }
  } catch (error) {
    console.error("❌ Erreur récupération consommation totale :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer la consommation totale par pièce
const getConsommationParPiece = async (req, res) => {
  try {
    const consommations = await Energie.aggregate([
      {
        $lookup: {
          from: "appareils",
          localField: "app_id",
          foreignField: "_id",
          as: "appareil",
        },
      },
      { $unwind: "$appareil" },
      {
        $group: {
          _id: "$appareil.pieces_id",
          consommation_piece: { $sum: "$total_consom" },
        },
      },
    ]);

    console.log("🏠 Consommation par pièce :", consommations);
    res.json(consommations);

    // 📡 Envoi en temps réel via WebSocket
    if (io) {
      io.emit("updateConsommationParPiece", consommations);
      console.log("📡 Consommation par pièce envoyée en temps réel !");
    }
  } catch (error) {
    console.error("❌ Erreur récupération consommation par pièce :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getConsommationParJour = async (req, res) => {
  try {
    const consommationJour = await HistoriqueEnergie.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date_heure" },
            month: { $month: "$date_heure" },
            day: { $dayOfMonth: "$date_heure" },
          },
          total_consommation: { $sum: "$consommation" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } }, // Trier du plus récent au plus ancien
    ]);

    res.json(consommationJour);
  } catch (error) {
    console.error("❌ Erreur récupération consommation par jour :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// const getConsommationSemaine = async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Dimanche début de semaine
//     startOfWeek.setHours(0, 0, 0, 0);

//     const consommationSemaine = await HistoriqueEnergie.aggregate([
//       {
//         $match: {
//           date_heure: { $gte: startOfWeek }, // Filtre depuis le début de la semaine
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$date_heure" },
//             month: { $month: "$date_heure" },
//             day: { $dayOfMonth: "$date_heure" },
//           },
//           total_consommation: { $sum: "$consommation" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
//     ]);

//     res.json(consommationSemaine);
//   } catch (error) {
//     console.error("❌ Erreur récupération consommation de la semaine :", error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

const getConsommationSemaine = async (req, res) => {
  try {
    // Permet de spécifier le début de semaine (1 = lundi, 0 = dimanche)
    const debutSemaine = req.query.debutSemaine
      ? parseInt(req.query.debutSemaine)
      : 1;

    const now = new Date();
    let startOfWeek;

    if (debutSemaine === 1) {
      // Lundi comme début
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek = new Date(now.setDate(diff));
    } else {
      // Dimanche comme début
      startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    }

    startOfWeek.setHours(0, 0, 0, 0);

    // Fin de la semaine = début + 6 jours
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const consommationSemaine = await HistoriqueEnergie.aggregate([
      {
        $match: {
          date_heure: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date_heure" },
            month: { $month: "$date_heure" },
            day: { $dayOfMonth: "$date_heure" },
          },
          total_consommation: { $sum: "$consommation" },
          date: { $first: "$date_heure" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Générer tous les jours de la semaine pour avoir une structure complète
    const resultatComplet = [];
    const currentDate = new Date(startOfWeek);

    while (currentDate <= endOfWeek) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      // Chercher si on a des données pour ce jour
      const jourData = consommationSemaine.find(
        (item) =>
          item._id.year === year &&
          item._id.month === month &&
          item._id.day === day
      );

      resultatComplet.push({
        date: new Date(year, month - 1, day),
        // Format lisible pour le frontend
        jour: currentDate.toLocaleDateString("fr-FR", { weekday: "long" }),
        total_consommation: jourData ? jourData.total_consommation : 0,
      });

      // Avancer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json(resultatComplet);
  } catch (error) {
    console.error("❌ Erreur récupération consommation de la semaine :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// const getConsommationParMois = async (req, res) => {
//   try {
//     const consommationMois = await HistoriqueEnergie.aggregate([
//       {
//         $group: {
//           _id: {
//             year: { $year: "$date_heure" },
//             month: { $month: "$date_heure" },
//           },
//           total_consommation: { $sum: "$consommation" },
//         },
//       },
//       { $sort: { "_id.year": -1, "_id.month": -1 } }, // Trier du plus récent au plus ancien
//     ]);

//     res.json(consommationMois);
//   } catch (error) {
//     console.error("❌ Erreur récupération consommation par mois :", error);
//     res.status(500).json({ message: "Erreur serveur", error: error.message });
//   }
// };

// 🔹 Récupérer la consommation totale par mois

const getConsommationParMois = async (req, res) => {
  try {
    // Récupérer les paramètres de la requête pour filtrer la période
    const annee = req.query.annee
      ? parseInt(req.query.annee)
      : new Date().getFullYear();
    const nbMois = req.query.nbMois ? parseInt(req.query.nbMois) : 12; // Par défaut, montrer une année complète

    // Calculer la date de début (12 mois avant la date actuelle)
    const dateActuelle = new Date();
    const dateDebut = new Date(dateActuelle);
    dateDebut.setMonth(dateActuelle.getMonth() - nbMois + 1);
    dateDebut.setDate(1);
    dateDebut.setHours(0, 0, 0, 0);

    // Calculer la date de fin (dernier jour du mois actuel)
    const dateFin = new Date(
      dateActuelle.getFullYear(),
      dateActuelle.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const consommationMois = await HistoriqueEnergie.aggregate([
      {
        $match: {
          date_heure: { $gte: dateDebut, $lte: dateFin },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date_heure" },
            month: { $month: "$date_heure" },
          },
          total_consommation: { $sum: "$consommation" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Générer tous les mois de la période pour avoir une structure complète
    const resultatComplet = [];
    const currentDate = new Date(dateDebut);

    // Mapper les numéros de mois aux abréviations françaises
    const moisAbreviations = {
      1: "jan",
      2: "fév",
      3: "mar",
      4: "avr",
      5: "mai",
      6: "jui",
      7: "jul",
      8: "aoû",
      9: "sep",
      10: "oct",
      11: "nov",
      12: "déc",
    };

    while (currentDate <= dateFin) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Chercher si on a des données pour ce mois
      const moisData = consommationMois.find(
        (item) => item._id.year === year && item._id.month === month
      );

      resultatComplet.push({
        date: new Date(year, month - 1, 1),
        mois: currentDate.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        }),
        mois_court: moisAbreviations[month], // Abréviation standardisée
        total_consommation: moisData ? moisData.total_consommation : 0,
        annee: year,
        mois_numero: month,
        // Propriété pour faciliter le tri dans le frontend
        date_ordre: `${year}-${month.toString().padStart(2, "0")}`,
      });

      // Passer au mois suivant
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Tri explicite des résultats par date croissante
    resultatComplet.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Ajouter des statistiques supplémentaires
    const statistiques = {
      moyenne:
        resultatComplet.reduce(
          (acc, mois) => acc + mois.total_consommation,
          0
        ) / resultatComplet.length,
      total: resultatComplet.reduce(
        (acc, mois) => acc + mois.total_consommation,
        0
      ),
      max: Math.max(...resultatComplet.map((mois) => mois.total_consommation)),
      min: Math.min(
        ...(resultatComplet
          .filter((mois) => mois.total_consommation > 0)
          .map((mois) => mois.total_consommation) || [0])
      ),
    };

    res.json({
      mois: resultatComplet,
      statistiques,
    });
  } catch (error) {
    console.error("❌ Erreur récupération consommation par mois :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Export des fonctions
module.exports = {
  recevoirDonneesCapteurs,
  getHistorique,
  getConsommationTotale,
  setSocketInstance,
  getConsommationTotaleAll,
  getConsommationParPiece,
  getConsommationParJour,
  getConsommationSemaine,
  getConsommationParMois,
};
