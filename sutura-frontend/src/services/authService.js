import axios from "axios";

const API_URL = "http://localhost:2500/api/auth"; // URL du backend
const API_URL2 = "http://localhost:2500/api/utilisateurs"; // URL du backend

// Création d'une instance Axios avec baseURL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour gérer l'expiration du token (erreur 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expiré ou invalide. Déconnexion en cours...");
      authService.logout();
      window.location.href = "/"; // Redirige vers la page de connexion
    }
    return Promise.reject(error);
  }
);

// Fonction pour se connecter avec email et mot de passe
const loginWithEmail = async (email, password) => {
  try {
    const response = await apiClient.post(`/connexion`, { email, password });

    const { token } = response.data;
    localStorage.setItem("token", token); // Stocker le token pour les requêtes futures

    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la connexion:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour se connecter avec un code
const loginWithCode = async (code) => {
  try {
    const response = await apiClient.post(`/logincode`, { code });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la connexion avec code:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour changer le mot de passe initial
const definirMotDePasseInitial = async (data, token) => {
  try {
    const response = await apiClient.post(`/definir-mot-de-passe/${token}`, {
      nouveauPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la définition du mot de passe:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour se déconnecter
const logout = async () => {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      await apiClient.post(
        `/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  } finally {
    localStorage.removeItem("token"); // Supprimer le token du localStorage
  }
};

// Fonction pour récupérer le profil de l'utilisateur
const getMyProfile = async () => {
  try {
    const response = await apiClient.get(`/mon-profil`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null;
  }
};

// Fonction pour demander une réinitialisation de mot de passe
const demanderReinitialisation = async (email) => {
  try {
    const response = await apiClient.post(
      `${API_URL2}/demander-reinitialisation`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la demande de réinitialisation:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour réinitialiser le mot de passe
const reinitialiserMotDePasse = async (token, data) => {
  try {
    const response = await apiClient.post(
      `${API_URL2}/reinitialiser-password`,
      {
        token,
        nouveauPassword: data.nouveauPassword,
        confirmPassword: data.confirmPassword,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Exporter toutes les fonctions du service
export const authService = {
  loginWithEmail,
  loginWithCode,
  definirMotDePasseInitial,
  logout,
  getMyProfile,
  demanderReinitialisation,
  reinitialiserMotDePasse,
};
