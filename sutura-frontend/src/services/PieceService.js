import axios from "axios";

const API_URL = "http://localhost:2500/api/pieces"; // Remplacez par votre URL de base

const PieceService = {
  async creerPiece(pieceData) {
    console.log("Données envoyées pour créer une pièce :", pieceData);
    const response = await axios.post(`${API_URL}/creer`, pieceData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Réponse du serveur :", response.data);
    return response.data;
  },

  async obtenirToutesPieces() {
    const response = await axios.get(`${API_URL}/allpieces`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async obtenirPieceParId(id) {
    const response = await axios.get(`${API_URL}/voir/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  async mettreAJourPiece(id, pieceData) {
    const response = await axios.put(`${API_URL}/modifier/${id}`, pieceData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("Réponse du serveur :", response.data);
    return response.data;
  },

  async supprimerPiece(id) {
    const response = await axios.delete(`${API_URL}/sup/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export default PieceService;
