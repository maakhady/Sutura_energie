const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./src/config/database");
const serialService = require("./src/services/serialService");
const fingerprintService = require("./src/services/fingerprintService");
const rfidService = require("./src/services/rfidService");
const http = require("http");
const socketIO = require("socket.io");

// Charger les variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration globale pour Socket.IO
global.io = io;
global.assignationRFIDEnCours = null;

// Routes API
app.use("/api/utilisateurs", require("./src/routes/utilisateurRoutes"));
app.use("/api/pieces", require("./src/routes/pieceRoutes"));
app.use("/api/appareils", require("./src/routes/appareilRoutes"));
// app.use('/api/energie', require('./src/routes/energieRoutes'));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/historiques", require("./src/routes/historiqueRoutes"));

// Route de base
app.get("/", (req, res) => {
  res.json({
    message: "API Sutura Énergie opérationnelle",
    version: "1.0.0",
    status: "online",
  });
});

// Gestion des connexions socket
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  // Envoi des événements aux clients connectés
  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
    
    // Si le client avait une assignation RFID en cours, l'annuler
    if (global.assignationRFIDEnCours && global.assignationRFIDEnCours.socketId === socket.id) {
      global.assignationRFIDEnCours = null;
      console.log("Assignation RFID annulée suite à la déconnexion du client");
    }
  });
  
  // Pour démarrer une session d'assignation de carte RFID
  socket.on("demarrer_assignation_rfid", (userId) => {
    console.log(`Démarrage de l'assignation RFID pour l'utilisateur ${userId}`);
    // Stocker l'ID socket et l'ID utilisateur pour l'assignation
    global.assignationRFIDEnCours = { socketId: socket.id, userId };
    
    // Confirmer au client que l'assignation est en cours
    socket.emit("assignation_rfid_status", {
      status: "en_attente",
      message: "En attente de présentation d'une carte RFID..."
    });
  });
  
  // Pour annuler une session d'assignation RFID
  socket.on("annuler_assignation_rfid", () => {
    if (global.assignationRFIDEnCours && global.assignationRFIDEnCours.socketId === socket.id) {
      console.log("Annulation de l'assignation RFID");
      global.assignationRFIDEnCours = null;
      
      // Confirmer au client que l'assignation est annulée
      socket.emit("assignation_rfid_status", {
        status: "annulee",
        message: "Assignation annulée"
      });
    }
  });
  
  // Pour démarrer l'enregistrement d'une empreinte
  socket.on("demarrer_assignation_empreinte", (userId) => {
    console.log(`Démarrage de l'assignation d'empreinte pour l'utilisateur ${userId}`);
    
    // Utiliser le service existant pour déclencher l'enregistrement
    fingerprintService.declencherEnregistrement(userId)
      .then(result => {
        if (result.success) {
          socket.emit("assignation_empreinte_status", {
            status: "en_cours",
            message: "Processus d'enregistrement d'empreinte initié. Veuillez suivre les instructions sur le dispositif."
          });
        } else {
          socket.emit("assignation_empreinte_status", {
            status: "erreur",
            message: result.message
          });
        }
      })
      .catch(error => {
        socket.emit("assignation_empreinte_status", {
          status: "erreur",
          message: "Erreur lors de l'initialisation de l'enregistrement d'empreinte: " + error.message
        });
      });
  });
});

// Middleware pour les routes non trouvées
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route non trouvée: ${req.originalUrl}`,
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(`Erreur: ${err.message}`);
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erreur interne du serveur",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Connexion à la base de données puis démarrage du serveur
const PORT = process.env.PORT || 2500;

connectDB()
  .then(() => {
    // Initialiser la connexion série
    try {
      // Initialiser le service de communication série
      const connected = serialService.initSerialConnection();
      if (connected) {
        console.log("Connexion série avec Arduino initialisée");
        
        // Initialiser les services qui utilisent la connexion série
        fingerprintService.init();
        rfidService.init();
        
        console.log("Services d'empreinte et RFID initialisés");
      } else {
        console.warn("Échec de la connexion série avec Arduino");
      }
    } catch (error) {
      console.warn("Impossible de se connecter à l'Arduino:", error.message);
      console.log("L'application démarre sans connexion à l'Arduino");
    }

    // Utiliser server.listen au lieu de app.listen pour supporter Socket.IO
    server.listen(PORT, () => {
      console.log(
        `Serveur démarré en mode ${
          process.env.NODE_ENV || "development"
        } sur le port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("Impossible de démarrer le serveur:", err.message);
    process.exit(1);
  });