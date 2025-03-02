import axios from "axios";

const API_URL = "http://localhost:2500/api/auth"; // Remplacez par l'URL de votre backend
const API_URL2 = "http://localhost:2500/api/utilisateurs"; // Remplacez par l'URL de votre backend

// Fonction pour se connecter avec email et mot de passe
const loginWithEmail = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/connexion`, {
      email,
      password,
    });
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
    const response = await axios.post(`${API_URL}/logincode`, { code });
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
    const response = await axios.post(
      `${API_URL}/definir-mot-de-passe/${token}`,
      {
        nouveauPassword: data.newPassword, // Utiliser la clé attendue par le backend
        confirmPassword: data.confirmPassword,
      }
    );

    // Retourner la réponse du backend
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    // Capturer les erreurs spécifiques du backend
    const errorMessage =
      error.response?.data?.message ||
      "Erreur lors de la définition du mot de passe";

    console.error(
      "Erreur lors de la définition du mot de passe:",
      errorMessage
    );

    // Propager l'erreur pour une gestion côté frontend
    throw new Error(errorMessage);
  }
};

// Fonction pour se déconnecter
const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.removeItem("token"); // Supprimez le token du localStorage
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

// Fonction pour récupérer le profil de l'utilisateur vérification d'authentification dans authService

const getMyProfile = async () => {
  try {
    const token = localStorage.getItem("token"); // Récupérez le token du localStorage
    if (!token) {
      return null; // Pas de token, utilisateur non authentifié
    }

    const response = await axios.get(`${API_URL}/mon-profil`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Retourne les données du profil si l'utilisateur est authentifié
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null; // En cas d'erreur, utilisateur non authentifié
  }
};

const demanderReinitialisation = async (email) => {
  try {
    const response = await axios.post(`${API_URL2}/demander-reinitialisation`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la demande de réinitialisation:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

const reinitialiserMotDePasse = async (token, data) => {
  try {
    const response = await axios.post(`${API_URL2}/reinitialiser-password`, {
      token,
      actuelPassword: data.actuelPassword,
      nouveauPassword: data.nouveauPassword,
      confirmPassword: data.confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};
// Exporter les fonctions du service
export const authService = {
  loginWithEmail,
  loginWithCode,
  definirMotDePasseInitial,
  logout,
  getMyProfile,
  demanderReinitialisation,
  reinitialiserMotDePasse,
};
