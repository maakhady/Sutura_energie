import axios from "axios";

const API_URL = "http://localhost:2500/api/historiques"; // 🔹 Remplace par l'URL de ton backend

// Création d'une instance Axios
const apiClient = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expiré ou invalide. Déconnexion en cours...");
      localStorage.removeItem("token"); // Supprimer le token expiré
      window.location.href = "/"; // Rediriger vers la page de connexion
    }
    return Promise.reject(error);
  }
);

// Service pour gérer les historiques
const HistoriqueService = {
  async voirLogsAppareil() {
    const response = await apiClient.get("/HisApp/", {
      params: {
        type_entite: "appareil",
        type_operation: ["Allumer", "Eteindre", "Programmation"], // 🔹 Ajout du filtre côté frontend
      },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // 🔹 Formater les données pour ton tableau
    return response.data.data.map((log) => ({
      _id: log._id,
      nom_appareil: log.app_id ? log.app_id.nom_app || "Inconnu" : "Inconue",
      type_operation: log.type_operation,
      createdAt: log.date_creation, // 🔹 Vérifie si `date_creation` est bien envoyé
      user: log.users_id
        ? { nom: log.users_id.nom, prenom: log.users_id.prenom }
        : null,
    }));
  },
};

export { HistoriqueService }; // Export nommé
