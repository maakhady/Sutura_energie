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
const changeInitialPassword = async (data, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/changer-password`,
      {
        nouveauPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du changement de mot de passe:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour se déconnecter
const logout = async (token) => {
  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la déconnexion:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour récupérer le profil de l'utilisateur
const getMyProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/mon-profil`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil:",
      error.response?.data?.message || error.message
    );
    throw error;
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
  changeInitialPassword,
  logout,
  getMyProfile,
  demanderReinitialisation,
  reinitialiserMotDePasse,
};
