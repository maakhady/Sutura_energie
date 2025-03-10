import axios from "axios";

const API_URL = "http://localhost:2500/api/pieces"; // URL de base

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

// Service pour gérer les pièces
const PieceService = {
  // Création d'une pièce
  async creerPiece(pieceData) {
    console.log("Données envoyées pour créer une pièce :", pieceData);
    const response = await apiClient.post(`/creer`, pieceData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Réponse du serveur :", response.data);
    return response.data;
  },

  // Récupérer toutes les pièces
  async obtenirToutesPieces() {
    const response = await apiClient.get(`/allpieces`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Récupérer une pièce par son ID
  async obtenirPieceParId(id) {
    const response = await apiClient.get(`/voir/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  // Mettre à jour une pièce
  async mettreAJourPiece(id, pieceData) {
    console.log("Données envoyées pour mise à jour :", pieceData);
    const response = await apiClient.put(`/modifier/${id}`, pieceData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Réponse du serveur :", response.data);
    return response.data;
  },

  // Supprimer une pièce
  async supprimerPiece(id) {
    const response = await apiClient.delete(`/sup/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export default PieceService;
