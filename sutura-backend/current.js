const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Autorise les requêtes cross-origin
app.use(bodyParser.json()); // Permet de parser du JSON

// Route pour recevoir les données du Raspberry
app.post("/data", (req, res) => {
  try {
    const sensors = req.body.sensors; // Récupère le tableau des capteurs

    if (!Array.isArray(sensors) || sensors.length !== 6) {
      return res.status(400).json({ message: "Format des données invalide." });
    }

    // Vérifier si au moins une valeur est différente de 0
    const hasActiveSensor = sensors.some((value) => value > 0);

    if (hasActiveSensor) {
      console.log("Données reçues :", sensors);
      // 👉 Ici, tu peux envoyer ces valeurs à une base de données ou un dashboard
    } else {
      console.log("Aucun appareil actif, données ignorées.");
    }

    res.status(200).json({ message: "Données reçues avec succès" });
  } catch (error) {
    console.error("Erreur lors du traitement des données :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Node.js en écoute sur le port ${PORT}`);
});
