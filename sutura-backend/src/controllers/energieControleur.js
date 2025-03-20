const Energie = require("../models/Energie");
const HistoriqueEnergie = require("../models/HistoriqueEnergie");
const Appareil = require("../models/Appareil");

// Tension fixe (V)
const TENSION = 220;

// Instance WebSocket
let io;
const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

// 📌 Traitement des données envoyées par le Raspberry
const recevoirDonneesCapteurs = async (req, res) => {
  try {
    console.log("📥 Données reçues :", req.body);

    const sensors = req.body.sensors;

    if (!Array.isArray(sensors) || sensors.length !== 6) {
      console.error("❌ Format des données invalide :", sensors);
      return res.status(400).json({ message: "Format des données invalide." });
    }

    const appareils = await Appareil.find();
    console.log("📌 Liste des appareils récupérée :", appareils);

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
      const energie_kWh = puissance * (5 / 3600); // Conso en kWh sur 5 sec

      console.log(
        `🔋 Calcul : Puissance = ${puissance} W | Énergie = ${energie_kWh} kWh`
      );

      let energie = await Energie.findOne({ app_id: appareil._id });

      console.log("📊 État avant mise à jour :", energie);

      if (!energie) {
        energie = new Energie({
          app_id: appareil._id,
          consom_energie: 0,
          total_consom: 0,
          last_activation: null,
        });
      }

      if (courant > 0) {
        if (!energie.last_activation) {
          energie.last_activation = now;
        }
        energie.consom_energie += energie_kWh;
        energie.total_consom += energie_kWh;
      } else {
        energie.consom_energie = 0;
        energie.last_activation = null;
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

      const historique = await HistoriqueEnergie.findOneAndUpdate(
        { app_id: appareil._id, date_heure: dateHeureArrondie },
        { $inc: { consommation: energie_kWh } },
        { upsert: true, new: true }
      );

      console.log("📜 Historique mis à jour :", historique);

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
    console.log("📜 Récupération de l'historique :", historique);
    res.json(historique);
  } catch (error) {
    console.error("❌ Erreur récupération historique :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Récupérer la consommation totale de chaque appareil
const getConsommationTotale = async (req, res) => {
  try {
    const consommations = await Energie.find().populate("app_id");
    console.log("📊 Consommation totale :", consommations);
    res.json(consommations);
  } catch (error) {
    console.error("❌ Erreur récupération consommation totale :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  recevoirDonneesCapteurs,
  getHistorique,
  getConsommationTotale,
  setSocketInstance,
};
