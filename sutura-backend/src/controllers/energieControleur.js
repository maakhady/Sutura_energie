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

      console.log(
        `⚡ Appareil ${i + 1} :`,
        appareil ? appareil.nom_app : "Non trouvé",
        "| Courant:",
        courant,
        "A"
      );

      if (!appareil) continue;

      const puissance = TENSION * courant; // P = U × I
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
    const historique = await HistoriqueEnergie.find().populate("app_id");
    console.log(" Récupération de l'historique :", historique);
    res.json(historique);
  } catch (error) {
    console.error(" Erreur récupération historique :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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

// 🔹 Export des fonctions
module.exports = {
  recevoirDonneesCapteurs,
  getHistorique,
  getConsommationTotale,
  setSocketInstance,
  getConsommationTotaleAll,
  getConsommationParPiece,
};
