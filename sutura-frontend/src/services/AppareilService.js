import axios from "axios";

const API_URL = "http://localhost:2500/api/appareils"; // Remplacez par votre URL de base

const AppareilService = {
  async creerAppareil(appareilData) {
    const response = await axios.post(`${API_URL}/ajouter`, appareilData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async voirTousAppareils() {
    const response = await axios.get(`${API_URL}/voir`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async voirAppareil(id) {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async modifierAppareil(id, appareilData) {
    const response = await axios.put(
      `${API_URL}/modifier/${id}`,
      appareilData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  async supprimerAppareil(id) {
    const response = await axios.delete(`${API_URL}/supprimer/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async activerDesactiverAppareil(id) {
    const response = await axios.put(
      `${API_URL}/activer-desactiver/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  async definirMode(id, modeData) {
    const response = await axios.put(
      `${API_URL}/definir-mode/${id}`,
      modeData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  async creerIntervalle(id, intervalleData) {
    const response = await axios.post(
      `${API_URL}/intervalle/${id}`,
      intervalleData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  async voirIntervalle(id) {
    const response = await axios.get(`${API_URL}/intervalle/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async supprimerIntervalle(id) {
    const response = await axios.delete(`${API_URL}/intervalle/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export default AppareilService;
