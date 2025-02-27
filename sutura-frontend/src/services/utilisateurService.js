import axios from "axios";

const API_URL = "http://localhost:2500/api/utilisateurs";

// Configuration des en-têtes avec le token d'authentification
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Fonction pour créer un nouvel utilisateur (admin uniquement)
const creerUtilisateur = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'utilisateur:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour obtenir tous les utilisateurs (admin uniquement)
const obtenirTousUtilisateurs = async (page = 1, limit = 10, filters = {}) => {
  try {
    // Construction des paramètres de requête
    let queryParams = `?page=${page}&limit=${limit}`;

    // Ajout des filtres si présents
    if (filters.actif !== undefined) queryParams += `&actif=${filters.actif}`;
    if (filters.role) queryParams += `&role=${filters.role}`;
    if (filters.recherche) queryParams += `&recherche=${filters.recherche}`;

    const response = await axios.get(`${API_URL}${queryParams}`, getAuthConfig());

    // Assurer la compatibilité ID entre MongoDB et le front
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data.map(user => {
          if (user._id && !user.id) {
            return { ...user, id: user._id };
          }
          return user;
        });
      } else if (response.data.utilisateurs && Array.isArray(response.data.utilisateurs)) {
        response.data.utilisateurs = response.data.utilisateurs.map(user => {
          if (user._id && !user.id) {
            return { ...user, id: user._id };
          }
          return user;
        });
      }
    }

    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour obtenir un utilisateur par son ID
const obtenirUtilisateur = async (id) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    // Assurer la compatibilité ID
    if (response.data && response.data._id && !response.data.id) {
      response.data.id = response.data._id;
    }
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour mettre à jour un utilisateur
const mettreAJourUtilisateur = async (id, userData) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    const response = await axios.put(`${API_URL}/${id}`, userData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'utilisateur:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};


// Fonction pour supprimer un ou plusieurs utilisateurs definitivement
const supprimerUtilisateurs = async (ids) => {
  try {
    if (!ids || !ids.length) {
      throw new Error("Au moins un ID utilisateur est requis");
    }
    console.log("Suppression des utilisateurs IDs:", ids);
    const response = await axios.delete(API_URL, {
      ...getAuthConfig(),
      data: { ids }
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des utilisateurs:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};
  


// Fonction pour activer/désactiver un utilisateur
const toggleStatutUtilisateur = async (id) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    console.log("Toggle statut pour ID:", id);
    const response = await axios.patch(
      `${API_URL}/${id}/toggle-statut`,
      {},
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du changement de statut de l'utilisateur:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour assigner une carte RFID
const assignerCarteRFID = async (id, cardId) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    if (!cardId) {
      throw new Error("ID de carte requis");
    }
    const response = await axios.patch(
      `${API_URL}/${id}/assigner-carte`,
      { cardId },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'assignation de la carte RFID:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour désassigner une carte RFID
const desassignerCarteRFID = async (id) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    const response = await axios.delete(
      `${API_URL}/${id}/desassigner-carte`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la désassignation de la carte RFID:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour réactiver une carte RFID
const reactiverCarteRFID = async (id) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    const response = await axios.patch(
      `${API_URL}/${id}/reactiver-carte`,
      {},
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la réactivation de la carte RFID:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour désactiver sa propre carte RFID (utilisateur connecté)
const desactiverMaCarteRFID = async () => {
  try {
    const response = await axios.patch(
      `${API_URL}/desactiver-ma-carte`,
      {},
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la désactivation de votre carte RFID:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour assigner une empreinte digitale
const assignerEmpreinte = async (id, empreinteID) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    if (!empreinteID) {
      throw new Error("ID d'empreinte requis");
    }
    const response = await axios.patch(
      `${API_URL}/${id}/assigner-empreinte`,
      { empreinteID },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'assignation de l'empreinte digitale:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour désassigner une empreinte digitale
const desassignerEmpreinte = async (id) => {
  try {
    if (!id) {
      throw new Error("ID utilisateur requis");
    }
    const response = await axios.delete(
      `${API_URL}/${id}/desassigner-empreinte`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la désassignation de l'empreinte digitale:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour demander une réinitialisation de mot de passe
const demanderReinitialisation = async (email) => {
  try {
    if (!email) {
      throw new Error("Email requis");
    }
    const response = await axios.post(`${API_URL}/demander-reinitialisation`, {
      email
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

// Fonction pour réinitialiser le mot de passe
const reinitialiserMotDePasse = async (token, actuelPassword, nouveauPassword, confirmPassword) => {
  try {
    if (!token) {
      throw new Error("Token requis");
    }
    const response = await axios.post(`${API_URL}/reinitialiser-mot-de-passe`, {
      token,
      actuelPassword,
      nouveauPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe:",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

// Fonction pour changer son mot de passe (utilisateur connecté)
const changerMotDePasse = async (actuelPassword, nouveauPassword, confirmPassword) => {
  try {
    if (!actuelPassword || !nouveauPassword || !confirmPassword) {
      throw new Error("Tous les champs de mot de passe sont requis");
    }
    const response = await axios.post(
      `${API_URL}/changer-mot-de-passe`,
      {
        actuelPassword,
        nouveauPassword,
        confirmPassword
      },
      getAuthConfig()
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

// Exporter les fonctions du service
export const utilisateurService = {
  creerUtilisateur,
  obtenirTousUtilisateurs,
  obtenirUtilisateur,
  mettreAJourUtilisateur,
  supprimerUtilisateurs,
  toggleStatutUtilisateur,
  assignerCarteRFID,
  desassignerCarteRFID,
  reactiverCarteRFID,
  desactiverMaCarteRFID,
  assignerEmpreinte,
  desassignerEmpreinte,
  demanderReinitialisation,
  reinitialiserMotDePasse,
  changerMotDePasse,
};


