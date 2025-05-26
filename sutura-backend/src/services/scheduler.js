const cron = require("node-cron");
const Appareil = require("../models/Appareil");
const { activerDesactiverRelay } = require("./relayService");

let ioInstance = null; // Stocker l'instance de io

const verifierAppareils = (io) => {
  ioInstance = io; // Stocker io pour l'utiliser plus tard

  const verifier = async () => {
    try {
      const maintenant = new Date();
      const heureActuelle =
        maintenant.getHours().toString().padStart(2, "0") +
        ":" +
        maintenant.getMinutes().toString().padStart(2, "0");

      console.log(`⏳ Vérification des appareils à ${heureActuelle}...`);

      const appareils = await Appareil.find({ automatique: true });

      for (const appareil of appareils) {
        if (!appareil.intervalle) continue;

        const { debut_periode, fin_periode, heure_debut, heure_fin, relay_ID } =
          appareil.intervalle;

        if (!debut_periode || !fin_periode || !heure_debut || !heure_fin)
          continue; // Sécurité

        const [debutH, debutM] = heure_debut.split(":").map(Number);
        const [finH, finM] = heure_fin.split(":").map(Number);
        const [nowH, nowM] = heureActuelle.split(":").map(Number);

        const debutMinutes = debutH * 60 + debutM;
        const finMinutes = finH * 60 + finM;
        const heureActuelleMinutes = nowH * 60 + nowM;

        let doitEtreActif = false;

        if (finMinutes < debutMinutes) {
          // Cas où la période chevauche minuit (ex: 23:00 - 05:00)
          doitEtreActif =
            heureActuelleMinutes >= debutMinutes ||
            heureActuelleMinutes < finMinutes;
        } else {
          // Cas normal (ex: 08:00 - 18:00)
          doitEtreActif =
            heureActuelleMinutes >= debutMinutes &&
            heureActuelleMinutes < finMinutes;
        }

        if (appareil.actif !== doitEtreActif) {
          console.log(
            ` Changement d'état : ${appareil.nom_app} (${relay_ID}) -> ${
              doitEtreActif ? "ON" : "OFF"
            }`
          );

          // Créer une copie de l'appareil avec le nouvel état
          const appareilUpdate = {
            ...appareil.toObject(),
            actif: doitEtreActif,
          };

          // Activer/désactiver le relais avant de sauvegarder l'état
          await activerDesactiverRelay(appareilUpdate);

          // Sauvegarder le nouvel état dans la base de données
          appareil.actif = doitEtreActif;
          await appareil.save();

          //  Notifier les clients WebSocket SEULEMENT si l'état a changé
          if (ioInstance) {
            ioInstance.emit("deviceStatusUpdated", {
              _id: appareil._id,
              actif: appareil.actif,
            });
            console.log(" Notification WebSocket envoyée !");
          } else {
            console.error(" Erreur : ioInstance est undefined !");
          }
        }
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la vérification des appareils :",
        error.message
      );
    }
  };

  // Planifier la tâche cron (toutes les minutes)
  cron.schedule("* * * * *", verifier);
  console.log("✅ Tâche de vérification des appareils planifiée.");
};

module.exports = verifierAppareils;
