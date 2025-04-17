// const axios = require("axios");

// const RASPBERRY_PI_URL = "http://192.168.1.28:2500"; // Mets l'IP réelle

// // Fonction pour activer/désactiver un relais unique
// exports.activerDesactiverRelay = async (appareil) => {
//   try {
//     if (!appareil.relay_ID || typeof appareil.relay_ID !== "number") {
//       throw new Error("relay_ID doit être un nombre valide");
//     }

//     console.log(
//       `➡️ Envoi de la requête à : ${RASPBERRY_PI_URL}/control-relay/${appareil.relay_ID}`
//     );
//     console.log(`📡 Données envoyées :`, { actif: appareil.actif });

//     const response = await axios.post(
//       `${RASPBERRY_PI_URL}/control-relay/${appareil.relay_ID}`,
//       { actif: appareil.actif }
//     );

//     console.log(
//       `✅ Relais ${appareil.relay_ID} ${
//         appareil.actif ? "activé" : "désactivé"
//       }`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors du contrôle du relais :",
//       error.response?.data || error.message
//     );
//     throw new Error(
//       "Impossible d’activer/désactiver l’appareil sur le Raspberry Pi"
//     );
//   }
// };

// // Fonction pour activer/désactiver plusieurs relais d’un coup
// exports.activerDesactiverPlusieursRelais = async (relais_ids, actif) => {
//   try {
//     console.log(
//       `➡️ Envoi de la requête à : ${RASPBERRY_PI_URL}/control-multiple-relays`
//     );
//     console.log(`📡 Données envoyées :`, { relais_ids, actif });

//     const response = await axios.post(
//       `${RASPBERRY_PI_URL}/control-multiple-relays`,
//       { relais_ids, actif }
//     );

//     console.log(
//       `✅ Relais ${relais_ids} ${actif ? "activés" : "désactivés"} avec succès.`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Erreur lors du contrôle des relais :",
//       error.response?.data || error.message
//     );
//     throw new Error(
//       "Impossible d’activer/désactiver plusieurs relais sur le Raspberry Pi"
//     );
//   }
// };

const axios = require("axios");

// Externaliser l'URL dans une variable d'environnement ou un fichier de configuration
const RASPBERRY_PI_URL = process.env.RASPBERRY_PI_URL || "http://192.168.1.28:2500";

// Configuration d'axios avec timeout
const axiosInstance = axios.create({
  baseURL: RASPBERRY_PI_URL,
  timeout: 5000, // Timeout de 5 secondes pour éviter de bloquer l'application
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Active ou désactive un relais unique
 * @param {Object} appareil - L'appareil contenant relay_ID et actif
 * @returns {Promise} - Promesse contenant la réponse du serveur
 */
exports.activerDesactiverRelay = async (appareil) => {
  try {
    // Validation de l'entrée
    if (!appareil || !appareil.relay_ID || typeof appareil.relay_ID !== "number") {
      throw new Error("relay_ID doit être un nombre valide");
    }
    
    if (typeof appareil.actif !== "boolean") {
      throw new Error("actif doit être un booléen");
    }
    
    console.log(
      `➡️ Envoi de la requête à : ${RASPBERRY_PI_URL}/control-relay/${appareil.relay_ID}`
    );
    console.log(`📡 Données envoyées :`, { actif: appareil.actif });
    
    // Utilisation d'un AbortController pour pouvoir annuler la requête si nécessaire
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await axiosInstance.post(
        `/control-relay/${appareil.relay_ID}`,
        { actif: appareil.actif },
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      console.log(
        `✅ Relais ${appareil.relay_ID} ${
          appareil.actif ? "activé" : "désactivé"
        }`
      );
      return response.data;
    } catch (axiosError) {
      clearTimeout(timeoutId);
      throw axiosError;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout dépassé pour le relais ${appareil.relay_ID}`);
      throw new Error("La requête a pris trop de temps, opération annulée");
    }
    
    console.error(
      "❌ Erreur lors du contrôle du relais :",
      error.response?.data || error.message
    );
    throw new Error(
      `Impossible d'activer/désactiver l'appareil sur le Raspberry Pi: ${error.message}`
    );
  }
};

/**
 * Active ou désactive plusieurs relais d'un coup
 * @param {Array} relais_ids - Liste des IDs de relais à contrôler
 * @param {Boolean} actif - État à appliquer (true = activer, false = désactiver)
 * @returns {Promise} - Promesse contenant la réponse du serveur
 */
exports.activerDesactiverPlusieursRelais = async (relais_ids, actif) => {
  try {
    // Validation de l'entrée
    if (!Array.isArray(relais_ids) || relais_ids.length === 0) {
      throw new Error("relais_ids doit être un tableau non vide");
    }
    
    if (typeof actif !== "boolean") {
      throw new Error("actif doit être un booléen");
    }
    
    console.log(
      `➡️ Envoi de la requête à : ${RASPBERRY_PI_URL}/control-multiple-relays`
    );
    console.log(`📡 Données envoyées :`, { relais_ids, actif });
    
    // Utilisation d'un AbortController pour pouvoir annuler la requête si nécessaire
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await axiosInstance.post(
        `/control-multiple-relays`,
        { relais_ids, actif },
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      console.log(
        `✅ Relais ${relais_ids.join(', ')} ${actif ? "activés" : "désactivés"} avec succès.`
      );
      return response.data;
    } catch (axiosError) {
      clearTimeout(timeoutId);
      throw axiosError;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout dépassé pour le contrôle de plusieurs relais`);
      throw new Error("La requête a pris trop de temps, opération annulée");
    }
    
    console.error(
      "❌ Erreur lors du contrôle des relais :",
      error.response?.data || error.message
    );
    throw new Error(
      `Impossible d'activer/désactiver plusieurs relais sur le Raspberry Pi: ${error.message}`
    );
  }
};

/**
 * Récupère l'état actuel de tous les relais
 * @returns {Promise} - Promesse contenant l'état des relais
 */
exports.getEtatRelais = async () => {
  try {
    console.log(`➡️ Récupération de l'état des relais depuis : ${RASPBERRY_PI_URL}/relays-state`);
    
    const response = await axiosInstance.get('/relays-state');
    
    console.log(`✅ État des relais récupéré avec succès`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'état des relais :",
      error.response?.data || error.message
    );
    throw new Error("Impossible de récupérer l'état des relais sur le Raspberry Pi");
  }
};

/**
 * Vérifie si le Raspberry Pi est accessible
 * @returns {Promise<boolean>} - true si accessible, false sinon
 */
exports.ping = async () => {
  try {
    await axiosInstance.get('/health', { timeout: 2000 });
    return true;
  } catch (error) {
    console.warn("⚠️ Le Raspberry Pi semble inaccessible:", error.message);
    return false;
  }
};
