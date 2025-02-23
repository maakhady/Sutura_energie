const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./src/config/database");

// Charger les variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

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

// Routes API - à décommenter au fur et à mesure de leur création
app.use("/api/utilisateurs", require("./src/routes/utilisateurRoutes"));
app.use("/api/pieces", require("./src/routes/pieceRoutes"));
//app.use("/api/appareils", require("./src/routes/appareilRoutes"));
// app.use('/api/energie', require('./src/routes/energieRoutes'));
app.use("/api/auth", require("./src/routes/authRoutes"));

// Route de base
app.get("/", (req, res) => {
  res.json({
    message: "API Sutura Énergie opérationnelle",
    version: "1.0.0",
    status: "online",
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
    app.listen(PORT, () => {
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
