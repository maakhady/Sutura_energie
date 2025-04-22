// services/socketService.js
import io from 'socket.io-client';
import config from "../config"; // Ajustez le chemin selon votre structure

let socket = null;

const SOCKET_URL = config.apiBaseURL; // URL dynamique selon l'environnement

const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'] // Essayer websocket d'abord, puis polling en fallback
    });
    
    socket.on('connect', () => {
      console.log('Connecté au serveur socket:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur socket');
    });
    
    socket.on('error', (error) => {
      console.error('Erreur socket:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
    });
    
    // Logger tous les événements reçus pour le débogage
    socket.onAny((event, ...args) => {
      console.log(`[SOCKET] Événement reçu: ${event}`, args);
    });

    // Ajouter des handlers spécifiques pour les événements d'empreinte et RFID
    socket.on('assignation_empreinte_status', (data) => {
      console.log('[SOCKET] Statut empreinte:', data);
    });

    socket.on('assignation_rfid_status', (data) => {
      console.log('[SOCKET] Statut RFID:', data);
    });
  }
  
  return socket;
};

const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Fonction spécifique pour le debug des messages d'empreinte
const debugEmpreinte = (userId) => {
  const socket = getSocket();
  console.log(`[DEBUG] Demande de debug empreinte pour l'utilisateur ${userId}`);
  socket.emit('debug_empreinte', { userId });
};

export const socketService = {
  initSocket,
  closeSocket,
  getSocket,
  debugEmpreinte
};