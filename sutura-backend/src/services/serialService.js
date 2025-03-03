// services/serialService.js
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const PORT = process.env.ARDUINO_PORT || '/dev/ttyUSB0';
const BAUD_RATE = 9600;

let serialPort;
let parser;
let messageListeners = [];

// Initialiser la connexion série
const initSerialConnection = () => {
  try {
    serialPort = new SerialPort({ path: PORT, baudRate: BAUD_RATE });
    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    
    // Gérer les messages entrants de l'Arduino
    parser.on('data', (data) => {
      console.log('Message reçu de l\'Arduino:', data);
      
      // Notifier tous les listeners
      messageListeners.forEach(listener => listener(data));
    });
    
    // Gérer les erreurs et les événements de connexion
    serialPort.on('error', (err) => {
      console.error('Erreur port série:', err.message);
      tryReconnect();
    });
    
    serialPort.on('open', () => {
      console.log('Connexion série établie avec Arduino');
    });
    
    serialPort.on('close', () => {
      console.log('Connexion série fermée');
      tryReconnect();
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du port série:', error);
    setTimeout(() => {
      tryReconnect();
    }, 5000);
    return false;
  }
};

// Tenter de reconnecter le port série
const tryReconnect = () => {
  console.log('Tentative de reconnexion au port série...');
  
  // Fermer le port s'il est déjà ouvert
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  
  // Attendre 5 secondes avant de reconnecter
  setTimeout(() => {
    initSerialConnection();
  }, 5000);
};

// Envoyer une commande à l'Arduino
const sendToArduino = (command) => {
  if (!serialPort || !serialPort.isOpen) {
    console.error('Port série non disponible');
    return false;
  }
  
  try {
    serialPort.write(`${command}\n`);
    console.log('Commande envoyée à l\'Arduino:', command);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la commande:', error);
    return false;
  }
};

// Ajouter un listener pour les messages
const addMessageListener = (listener) => {
  messageListeners.push(listener);
};

// Vérifier si le périphérique est connecté
const isDeviceConnected = () => {
  return serialPort && serialPort.isOpen;
};

module.exports = {
  initSerialConnection,
  sendToArduino,
  addMessageListener,
  isDeviceConnected
};