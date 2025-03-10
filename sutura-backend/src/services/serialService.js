const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");

const PORT = process.env.ARDUINO_PORT || "/dev/ttyUSB0";
const BAUD_RATE = 9600;

let serialPort;
let parser;
let messageListeners = [];
let tryingToConnect = false;

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

    tryingToConnect = true;

    serialPort = new SerialPort({ path: PORT, baudRate: BAUD_RATE }, (err) => {
      if (err) {
        console.error("Erreur d'ouverture du port série:", err.message);
        tryingToConnect = false;
        watchForDevice();
        return resolve(false);
      }
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    parser.on("data", (data) => {
      console.log("Message reçu de l'Arduino:", data);
      messageListeners.forEach((listener) => listener(data));
    });

    serialPort.on("error", (err) => {
      console.error("Erreur port série:", err.message);
      tryingToConnect = false;
      serialPort.close();
      watchForDevice();
    });

    serialPort.on("open", () => {
      console.log("Connexion série établie avec Arduino");
      tryingToConnect = false;
      resolve(true); // Indique que la connexion a réussi
    });

    serialPort.on("close", () => {
      console.log("Connexion série fermée");
      tryingToConnect = false;
      watchForDevice();
    });
  });
};

// Surveiller la connexion du périphérique
const watchForDevice = () => {
  if (tryingToConnect) return;
  tryingToConnect = true;

  const checkInterval = setInterval(async () => {
    if (isPortAvailable()) {
      console.log(`Périphérique détecté sur ${PORT}. Connexion...`);
      clearInterval(checkInterval);
      const connected = await initSerialConnection();
      if (connected) console.log("Connexion série rétablie !");
    }
  }, 5000);
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

// Vérifier si le périphérique est connecté
const isDeviceConnected = () => serialPort && serialPort.isOpen;

module.exports = {
  initSerialConnection,
  sendToArduino,
  addMessageListener,
  isDeviceConnected,
};

// Lancer la surveillance dès le démarrage
watchForDevice();
