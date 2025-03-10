import axios from "axios";
import { authService } from "./authService";
import { socketService } from "./rfid-fingersocket";

const API_URL = "http://localhost:2500/api/utilisateurs";

// Création d'une instance Axios avec intercepteur
const apiClient = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expiré. Déconnexion...");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Récupérer la configuration des headers avec le token
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// 💡 CRUD Utilisateurs
const creerUtilisateur = async (userData) => {
  const response = await apiClient.post("/", userData, getAuthConfig());
  return response.data;
};

const obtenirTousUtilisateurs = async (page = 1, limit = 10, filters = {}) => {
  let queryParams = `?page=${page}&limit=${limit}`;
  if (filters.actif !== undefined) queryParams += `&actif=${filters.actif}`;
  if (filters.role) queryParams += `&role=${filters.role}`;
  if (filters.recherche) queryParams += `&recherche=${filters.recherche}`;

  const response = await apiClient.get(`${queryParams}`, getAuthConfig());
  return response.data;
};

const obtenirUtilisateur = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.get(`/${id}`, getAuthConfig());
  return response.data;
};

const mettreAJourUtilisateur = async (id, userData) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.put(`/${id}`, userData, getAuthConfig());
  return response.data;
};

const supprimerUtilisateurs = async (ids) => {
  if (!ids || !ids.length)
    throw new Error("Au moins un ID utilisateur est requis");
  const response = await apiClient.delete("/", {
    ...getAuthConfig(),
    data: { ids },
  });
  return response.data;
};

// 💡 Activation / Désactivation
const toggleStatutUtilisateur = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.patch(
    `/${id}/toggle-statut`,
    {},
    getAuthConfig()
  );
  return response.data;
};

// 💡 Gestion des cartes RFID
const assignerCarteRFID = async (id, cardId) => {
  if (!id || !cardId) throw new Error("ID utilisateur et carte requis");
  const response = await apiClient.patch(
    `/${id}/assigner-carte`,
    { cardId },
    getAuthConfig()
  );
  return response.data;
};

const desassignerCarteRFID = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.delete(
    `/${id}/desassigner-carte`,
    getAuthConfig()
  );
  return response.data;
};

const reactiverCarteRFID = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.patch(
    `/${id}/reactiver-carte`,
    {},
    getAuthConfig()
  );
  return response.data;
};

const desactiverMaCarteRFID = async () => {
  const response = await apiClient.patch(
    `/desactiver-ma-carte`,
    {},
    getAuthConfig()
  );
  return response.data;
};

const desactiverCarteRFIDParAdmin = async (userId) => {
  if (!userId) throw new Error("ID utilisateur requis");
  const response = await apiClient.patch(
    `/${userId}/desactiver-carte`,
    {},
    getAuthConfig()
  );
  return response.data;
};

// 💡 Gestion des empreintes digitales
const assignerEmpreinte = async (id, empreinteID) => {
  if (!id || !empreinteID)
    throw new Error("ID utilisateur et empreinte requis");
  const response = await apiClient.patch(
    `/${id}/assigner-empreinte`,
    { empreinteID },
    getAuthConfig()
  );
  return response.data;
};

const desassignerEmpreinte = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const response = await apiClient.delete(
    `/${id}/desassigner-empreinte`,
    getAuthConfig()
  );
  return response.data;
};

// 💡 Gestion du mot de passe
const demanderReinitialisation = async (email) => {
  if (!email) throw new Error("Email requis");
  const response = await apiClient.post(`/demander-reinitialisation`, {
    email,
  });
  return response.data;
};

const reinitialiserMotDePasse = async (
  token,
  actuelPassword,
  nouveauPassword,
  confirmPassword
) => {
  if (!token) throw new Error("Token requis");
  const response = await apiClient.post(`/reinitialiser-mot-de-passe`, {
    token,
    actuelPassword,
    nouveauPassword,
    confirmPassword,
  });
  return response.data;
};

const changerMotDePasse = async (
  actuelPassword,
  nouveauPassword,
  confirmPassword
) => {
  if (!actuelPassword || !nouveauPassword || !confirmPassword)
    throw new Error("Tous les champs de mot de passe sont requis");

  const response = await apiClient.post(
    `/changerpassword`,
    {
      actuelPassword,
      nouveauPassword,
      confirmPassword,
    },
    getAuthConfig()
  );

  if (response.data.success) {
    await authService.logout();
    window.location.href = "/";
  }

  return response.data;
};

// 💡 Gestion RFID et empreinte en temps réel via WebSockets
const demarrerAssignationRFIDEnTempsReel = (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  const socket = socketService.getSocket();
  socket.emit("demarrer_assignation_rfid", id);
  return { success: true, message: "Mode d'assignation RFID démarré" };
};

const annulerAssignationRFID = () => {
  socketService.getSocket().emit("annuler_assignation_rfid");
};

const abonnerStatutAssignationRFID = (callback) => {
  const socket = socketService.getSocket();
  socket.on("assignation_rfid_status", callback);
  return () => socket.off("assignation_rfid_status", callback);
};

const demarrerAssignationEmpreinteEnTempsReel = async (id) => {
  if (!id) throw new Error("ID utilisateur requis");
  socketService.getSocket().emit("demarrer_assignation_empreinte", id);

  const response = await apiClient.patch(
    `/${id}/assigner-empreinte`,
    {},
    getAuthConfig()
  );
  return response.data;
};

const annulerAssignationEmpreinte = () => {
  socketService.getSocket().emit("annuler_assignation_empreinte");
};

const abonnerStatutAssignationEmpreinte = (callback) => {
  const socket = socketService.getSocket();
  socket.on("assignation_empreinte_status", callback);
  return () => socket.off("assignation_empreinte_status", callback);
};

// 💡 Export du service
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
  abonnerStatutAssignationEmpreinte,
  annulerAssignationRFID,
  abonnerStatutAssignationRFID,
  demarrerAssignationRFIDEnTempsReel,
  demarrerAssignationEmpreinteEnTempsReel,
  annulerAssignationEmpreinte,
  desactiverCarteRFIDParAdmin,
};
