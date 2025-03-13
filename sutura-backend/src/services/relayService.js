const axios = require("axios");

const RASPBERRY_PI_URL = "http://192.168.1.28:3000"; // Remplace par l'IP réelle

exports.activerDesactiverRelay = async (appareil) => {
  try {
    if (!appareil.relay_ID || typeof appareil.relay_ID !== "number") {
      console.error("❌ Erreur : relay_ID invalide", appareil);
      throw new Error("relay_ID doit être un nombre valide");
    }

    console.log(
      `➡️ Envoi de la requête à : ${RASPBERRY_PI_URL}/control-relay/${appareil.relay_ID}`
    );
    console.log(`📡 Données envoyées :`, { actif: appareil.actif });

    const response = await axios.post(
      `${RASPBERRY_PI_URL}/control-relay/${appareil.relay_ID}`,
      { actif: appareil.actif }
    );

    console.log(
      `✅ Relais ${appareil.relay_ID} ${
        appareil.actif ? "activé" : "désactivé"
      }`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors du contrôle du relais :",
      error.response?.data || error.message
    );
    throw new Error(
      "Impossible d’activer/désactiver l’appareil sur le Raspberry Pi"
    );
  }
};
