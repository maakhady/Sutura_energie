// services/rfidService.js
const Utilisateur = require('../models/Utilisateur');
const { creerHistorique } = require('../controllers/historiqueControleur');
const serialService = require('./serialService');

// Initialiser le service
const init = () => {
  // Ajouter un listener pour les messages Arduino
  serialService.addMessageListener(handleArduinoMessage);
};

// Traiter les messages reçus de l'Arduino
const handleArduinoMessage = async (data) => {
  // Ne traiter que les messages pertinents pour ce service
  if (data.startsWith('CARD:')) {
    const cardId = data.split(':')[1].trim();
    
    // Vérifier si une assignation est en cours
    if (global.assignationRFIDEnCours) {
      const { socketId, userId } = global.assignationRFIDEnCours;
      
      try {
        // Vérifier si la carte n'est pas déjà assignée à un autre utilisateur
        const utilisateurExistant = await Utilisateur.findOne({ 
          cardId, 
          _id: { $ne: userId } 
        });
        
        if (utilisateurExistant) {
          // Carte déjà assignée à un autre utilisateur
          global.io.to(socketId).emit("assignation_rfid_status", {
            status: "erreur",
            message: "Cette carte RFID est déjà assignée à un autre utilisateur"
          });
        } else {
          // Assigner la carte à l'utilisateur
          const utilisateur = await Utilisateur.findByIdAndUpdate(
            userId,
            {
              cardId,
              cardActive: true,
              date_modif: Date.now()
            },
            { new: true }
          );
          
          if (!utilisateur) {
            throw new Error("Utilisateur non trouvé");
          }
          
          // Créer l'historique pour l'assignation
          await creerHistorique({
            users_id: utilisateur._id,
            type_entite: 'utilisateur',
            type_operation: 'modif',
            description: `Carte RFID ${cardId} assignée à l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
            statut: 'succès'
          });
          
          // Notifier le client du succès
          global.io.to(socketId).emit("assignation_rfid_status", {
            status: "succes",
            message: "Carte RFID assignée avec succès",
            utilisateur: {
              id: utilisateur._id,
              nom: utilisateur.nom,
              prenom: utilisateur.prenom,
              cardId: utilisateur.cardId,
              cardActive: utilisateur.cardActive
            }
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'assignation de la carte RFID:", error);
        
        // Notifier le client de l'erreur
        global.io.to(socketId).emit("assignation_rfid_status", {
          status: "erreur",
          message: "Erreur lors de l'assignation de la carte RFID: " + error.message
        });
      } finally {
        // Réinitialiser l'état global dans tous les cas
        global.assignationRFIDEnCours = null;
      }
    } else {
      // Comportement normal (vérification d'accès)
      await verifierCarteRFID(cardId);
    }
  }
};

// Vérifier une carte RFID dans la base de données
const verifierCarteRFID = async (cardId) => {
  try {
    // Rechercher un utilisateur avec cette carte
    const utilisateur = await Utilisateur.findOne({
      cardId,
      cardActive: true, // Vérifier que la carte est active
      actif: true // Vérifier que l'utilisateur est actif
    });
    
    if (!utilisateur) {
      console.log('Carte RFID non autorisée:', cardId);
      serialService.sendToArduino('ACCESS:DENIED');
      return false;
    }
    
    // Créer un historique d'accès
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'acces',
      type_operation: 'porte',
      description: `Accès par carte RFID de ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: 'succès'
    });
    
    console.log('Accès autorisé pour:', utilisateur.nom, utilisateur.prenom);
    serialService.sendToArduino('ACCESS:GRANTED');
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la carte RFID:', error);
    serialService.sendToArduino('ACCESS:DENIED');
    return false;
  }
};

// Vérifier si une carte RFID est déjà attribuée
const verifierCarteExistante = async (cardId, userId) => {
  try {
    const utilisateur = await Utilisateur.findOne({ 
      cardId, 
      _id: { $ne: userId } 
    });
    
    return !!utilisateur;  // Renvoie true si la carte est déjà associée à un autre utilisateur
  } catch (error) {
    console.error('Erreur lors de la vérification de carte existante:', error);
    return false;
  }
};

// Activer une carte RFID
const activerCarteRFID = async (userId, cardActive) => {
  try {
    const utilisateur = await Utilisateur.findById(userId);
    
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }
    
    if (!utilisateur.cardId) {
      throw new Error('Cet utilisateur n\'a pas de carte RFID assignée');
    }
    
    utilisateur.cardActive = cardActive;
    utilisateur.date_modif = Date.now();
    await utilisateur.save();
    
    // Créer l'historique pour l'activation/désactivation de la carte RFID
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Carte RFID ${cardActive ? 'activée' : 'désactivée'} pour l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: 'succès'
    });
    
    return {
      success: true,
      message: `Carte RFID ${cardActive ? 'activée' : 'désactivée'} avec succès`,
      utilisateur
    };
  } catch (error) {
    console.error(`Erreur lors de l'${cardActive ? 'activation' : 'désactivation'} de la carte RFID:`, error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Vérifier si le périphérique est connecté
const isDeviceConnected = () => {
  return serialService.isDeviceConnected();
};

module.exports = {
  init,
  verifierCarteRFID,
  verifierCarteExistante,
  activerCarteRFID,
  isDeviceConnected
};