import axios from "axios";
import { io } from "socket.io-client";
import config from "../config"; // Ajustez le chemin selon votre structure

const API_URL = `${config.apiBaseURL}/api/energie`; // URL de l'API
const SOCKET_URL = config.apiBaseURL; // URL du serveur WebSocket

// Création de l'instance WebSocket
const socket = io(SOCKET_URL);

// Création d'une instance Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expiré ou invalide. Déconnexion en cours...");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Ajouter le token dans les requêtes
const setAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// 📡 Service pour récupérer les données et écouter les mises à jour en temps réel
export const EnergieService = {
  getConsommationTotaleAll: async () => {
    setAuthHeader();
    return apiClient.get("/total/all");
  },

  getConsommationParPiece: async () => {
    setAuthHeader();
    return apiClient.get("/total/piece");
  },

  getConsommationSemaine: async () => {
    setAuthHeader();
    return apiClient.get("/consommation/semaine");
  },
  
  getConsommationMois: async () => {
    setAuthHeader();
    return apiClient.get("/consommation/mois");
  },


  onUpdateConsommationAppareil: (callback) => {
    socket.on("updateConso", callback);
  },

  onUpdateConsommationTotaleAll: (callback) => {
    socket.on("updateConsommationTotaleAll", callback);
  },

  onUpdateConsommationParPiece: (callback) => {
    socket.on("updateConsommationParPiece", callback);
  },

  onUpdateConsommationSemaine: (callback) => {
    socket.on("updateConsommationSemaine", callback);  
  } ,

  onUpdateConsommationMois: (callback) => {
    socket.on("updateConsommationMois", callback);
  },
  

  stopListening: () => {
    socket.off("updateConso");
    socket.off("updateConsommationTotaleAll");
    socket.off("updateConsommationParPiece");
    socket.off("updateConsommationSemaine");
    socket.off("updateConsommationMois");
  },
};