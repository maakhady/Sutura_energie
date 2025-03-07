const cron = require("node-cron");
const Appareil = require("../models/Appareil");
const { activerDesactiverRelay } = require("./relayService");

// Fonction qui vérifie les appareils toutes les minutes
const verifierAppareils = async () => {
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

      const maintenantDate = new Date();
      const debutPeriode = new Date(debut_periode);
      const finPeriode = new Date(fin_periode);

      // Vérifier si la date actuelle est dans la période
      if (maintenantDate >= debutPeriode && maintenantDate <= finPeriode) {
        let doitEtreActif = false;

        // Convertir les heures en minutes
        const [debutH, debutM] = heure_debut.split(":").map(Number);
        const [finH, finM] = heure_fin.split(":").map(Number);
        const [nowH, nowM] = heureActuelle.split(":").map(Number);

        const debutMinutes = debutH * 60 + debutM;
        const finMinutes = finH * 60 + finM;
        const heureActuelleMinutes = nowH * 60 + nowM;

        if (finMinutes < debutMinutes) {
          // Intervalle passant minuit (ex: 22h → 06h)
          doitEtreActif =
            heureActuelleMinutes >= debutMinutes ||
            heureActuelleMinutes < finMinutes;
        } else {
          // Intervalle normal (ex: 08h → 18h)
          doitEtreActif =
            heureActuelleMinutes >= debutMinutes &&
            heureActuelleMinutes < finMinutes;
        }

        // ✅ ACTIVER/DÉSACTIVER L'APPAREIL SI NÉCESSAIRE
        if (appareil.actif !== doitEtreActif) {
          console.log(
            `🔄 Changement d'état : ${appareil.nom_app} (${relay_ID}) -> ${
              doitEtreActif ? "ON" : "OFF"
            }`
          );
          appareil.actif = doitEtreActif;
          await appareil.save();
          await activerDesactiverRelay(appareil);
        }
      } else {
        // En dehors de la période -> désactiver l'appareil si nécessaire
        if (appareil.actif) {
          console.log(
            `🛑 Extinction de ${appareil.nom_app} (${relay_ID}) car hors période.`
          );
          appareil.actif = false;
          await appareil.save();
          await activerDesactiverRelay(appareil);
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
cron.schedule("* * * * *", verifierAppareils);

console.log("✅ Tâche de vérification des appareils planifiée.");

module.exports = verifierAppareils;
