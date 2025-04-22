import { io } from "socket.io-client";
import config from "../config"; // Ajustez le chemin selon votre structure de fichiers

// Création d'une instance de socket unique avec URL dynamique selon l'environnement
export const socket = io(config.apiBaseURL);

// Variable pour suivre l'état d'urgence actuel
let emergencyStatus = null;

// Fonction pour récupérer l'état d'urgence actuel
export const getEmergencyStatus = () => emergencyStatus;

// Fonction pour définir l'état d'urgence
export const setEmergencyStatus = (status) => {
  emergencyStatus = status;
};

// Configuration de l'écouteur d'événements d'urgence
// Quand le serveur émet 'emergency_shutdown', on met à jour l'état local
socket.on("emergency_shutdown", (data) => {
  setEmergencyStatus(data);
});