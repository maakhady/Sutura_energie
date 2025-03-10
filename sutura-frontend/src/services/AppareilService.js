import axios from "axios";

const API_URL = "http://localhost:2500/api/appareils"; // URL de base

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

// Service pour gérer les appareils
const AppareilService = {
  // Ajouter un appareil
  async creerAppareil(appareilData) {
    const response = await apiClient.post(`/ajouter`, appareilData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Voir tous les appareils
  async voirTousAppareils() {
    const response = await apiClient.get(`/voir`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Voir un appareil par ID
  async voirAppareil(id) {
    const response = await apiClient.get(`/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Modifier un appareil
  async modifierAppareil(id, appareilData) {
    const response = await apiClient.put(`/modifier/${id}`, appareilData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Supprimer un appareil
  async supprimerAppareil(id) {
    const response = await apiClient.delete(`/supprimer/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Activer/Désactiver un appareil
  async activerDesactiverAppareil(id, newStatus) {
    const response = await apiClient.put(
      `/activer-desactiver/${id}`,
      { actif: newStatus },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Définir le mode de fonctionnement d'un appareil
  async definirMode(id, automatique) {
    const response = await apiClient.put(
      `/definir-mode/${id}`,
      { automatique },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Ajouter un intervalle de fonctionnement à un appareil
  async creerIntervalle(id, intervalleData) {
    const response = await apiClient.post(
      `/intervalle/${id}`,
      intervalleData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  // Voir l'intervalle d'un appareil
  async voirIntervalle(id) {
    const response = await apiClient.get(`/intervalle/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Supprimer un intervalle d'un appareil
  async supprimerIntervalle(id) {
    const response = await apiClient.delete(`/intervalle/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export default AppareilService;
