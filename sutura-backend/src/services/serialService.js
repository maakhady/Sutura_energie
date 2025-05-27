const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");

const PORT = process.env.ARDUINO_PORT || "/dev/ttyUSB1";
const BAUD_RATE = 9600;

let serialPort;
let parser;
let messageListeners = [];
let tryingToConnect = false;
let deviceCheckInterval = null;

// Vérifier si le port est disponible
const isPortAvailable = () => fs.existsSync(PORT);

// Initialiser la connexion série
const initSerialConnection = async () => {
  return new Promise((resolve, reject) => {
    if (!isPortAvailable()) {
      console.log(
        `Périphérique non trouvé sur ${PORT}. Attente de connexion...`
      );
      watchForDevice();
      return resolve(false); // Retourne false si le périphérique n'est pas branché
    }

    // Si déjà en train d'essayer de se connecter, éviter une double tentative
    if (tryingToConnect) {
      console.log("Déjà en train de tenter une connexion...");
      return resolve(false);
    }

    tryingToConnect = true;

    // Fermer le port existant si ouvert
    if (serialPort && serialPort.isOpen) {
      try {
        serialPort.close();
        console.log("Port existant fermé avant reconnexion");
      } catch (err) {
        console.log(
          "Erreur lors de la fermeture du port existant:",
          err.message
        );
      }

      // Attendre un moment pour que le port se libère
      setTimeout(connectToPort, 1000);
    } else {
      connectToPort();
    }

    function connectToPort() {
      try {
        serialPort = new SerialPort(
          { path: PORT, baudRate: BAUD_RATE },
          (err) => {
            if (err) {
              console.error("Erreur d'ouverture du port série:", err.message);
              tryingToConnect = false;
              watchForDevice();
              return resolve(false);
            }
          }
        );

        parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        parser.on("data", (data) => {
          console.log("Message reçu de l'Arduino:", data);
          messageListeners.forEach((listener) => listener(data));
        });

        serialPort.on("error", (err) => {
          console.error("Erreur port série:", err.message);
          tryingToConnect = false;
          if (serialPort.isOpen) {
            serialPort.close();
          }
          watchForDevice();
        });

        serialPort.on("open", () => {
          console.log("Connexion série établie avec Arduino");
          tryingToConnect = false;

          // Arrêter l'intervalle de vérification si existant
          if (deviceCheckInterval) {
            clearInterval(deviceCheckInterval);
            deviceCheckInterval = null;
          }

          resolve(true); // Indique que la connexion a réussi
        });

        serialPort.on("close", () => {
          console.log("Connexion série fermée");
          tryingToConnect = false;
          watchForDevice();
        });
      } catch (error) {
        console.error("Exception lors de la création du port série:", error);
        tryingToConnect = false;
        watchForDevice();
        resolve(false);
      }
    }
  });
};

// Surveiller la connexion du périphérique
const watchForDevice = () => {
  if (tryingToConnect) return;

  // Si un intervalle existe déjà, ne pas en créer un nouveau
  if (deviceCheckInterval) return;

  console.log("Démarrage de la surveillance du périphérique...");

  deviceCheckInterval = setInterval(async () => {
    console.log(
      `🔌 Vérification de la connexion Arduino à ${new Date().toLocaleTimeString()}...`
    );

    if (isPortAvailable()) {
      console.log(`Périphérique détecté sur ${PORT}. Connexion...`);

      try {
        const connected = await initSerialConnection();
        if (connected) {
          console.log("Connexion série rétablie !");
          // Arrêter l'intervalle est fait dans initSerialConnection
        }
      } catch (err) {
        console.error("Erreur de connexion:", err.message);
      }
    }
  }, 100000); // Vérification toutes les 10 secondes
};

// Envoyer une commande à l'Arduino
const sendToArduino = (command) => {
  if (!serialPort || !serialPort.isOpen) {
    console.error("Port série non disponible");
    return false;
  }

  try {
    serialPort.write(`${command}\n`);
    console.log("Commande envoyée à l'Arduino:", command);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande:", error);
    return false;
  }
};

// Ajouter un listener pour les messages
const addMessageListener = (listener) => {
  messageListeners.push(listener);
};

// Supprimer un listener
const removeMessageListener = (listener) => {
  const index = messageListeners.indexOf(listener);
  if (index !== -1) {
    messageListeners.splice(index, 1);
  }
};

// Vérifier si le périphérique est connecté
const isDeviceConnected = () => serialPort && serialPort.isOpen;

// Nettoyer les connexions existantes
const cleanupConnections = () => {
  if (deviceCheckInterval) {
    clearInterval(deviceCheckInterval);
    deviceCheckInterval = null;
  }

  if (serialPort && serialPort.isOpen) {
    try {
      serialPort.close();
      console.log("Port série fermé proprement");
    } catch (err) {
      console.error("Erreur lors de la fermeture du port:", err);
    }
  }

  tryingToConnect = false;
  messageListeners = [];
};

module.exports = {
  initSerialConnection,
  sendToArduino,
  addMessageListener,
  removeMessageListener,
  isDeviceConnected,
  cleanupConnections,
};

// Lancer la surveillance dès le démarrage
watchForDevice();
