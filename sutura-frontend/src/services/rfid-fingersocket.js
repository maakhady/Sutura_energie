// services/socketService.js
import io from 'socket.io-client';

let socket = null;

const SOCKET_URL = "http://localhost:2500"; // Même URL que votre API

const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connecté au serveur socket');
    });
    
    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur socket');
    });
    
    socket.on('error', (error) => {
      console.error('Erreur socket:', error);
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

export const socketService = {
  initSocket,
  closeSocket,
  getSocket
};