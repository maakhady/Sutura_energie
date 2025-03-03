// services/fingerprintService.js
const Utilisateur = require('../models/Utilisateur');
const { creerHistorique } = require('../controllers/historiqueControleur');
const serialService = require('./serialService');

// Map pour stocker les utilisateurs en attente d'assignation d'empreinte
const pendingEnrollments = new Map();

// Initialiser le service
const init = () => {
  // Ajouter un listener pour les messages Arduino
  serialService.addMessageListener(handleArduinoMessage);
  
  // Démarrer les mises à jour d'état périodiques
  startStatusUpdates();
};

// Démarrer les mises à jour d'état périodiques pour l'interface utilisateur
const startStatusUpdates = () => {
  if (!global.io) return;
  
  setInterval(() => {
    // Envoyer des mises à jour pour chaque enregistrement en cours
    for (const [userId, data] of pendingEnrollments.entries()) {
      if (data.status === 'pending') {
        global.io.emit("assignation_empreinte_status", {
          userId,
          status: "en_cours",
          timeElapsed: Date.now() - data.timestamp,
          fingerprintID: data.fingerprintID
        });
      }
    }
  }, 1000); // Mettre à jour toutes les secondes
};

// Traiter les messages reçus de l'Arduino
const handleArduinoMessage = async (data) => {
  // Ne traiter que les messages pertinents pour ce service
  // Empreinte reconnue
  if (data.startsWith('MATCH:')) {
    const fingerprintID = data.split(':')[1].trim();
    await verifierEmpreinte(fingerprintID);
  }
  // Message d'enregistrement réussi
  else if (data.includes('Empreinte enregistrée avec succès')) {
    const userId = Array.from(pendingEnrollments.keys()).find(
      key => pendingEnrollments.get(key).status === 'pending'
    );
    
    if (userId) {
      const { fingerprintID } = pendingEnrollments.get(userId);
      const result = await confirmerEnregistrement(userId, fingerprintID);
      
      // Notifier le client via Socket.IO
      if (global.io) {
        global.io.emit("assignation_empreinte_status", {
          userId,
          status: "succes",
          message: "Empreinte digitale enregistrée avec succès",
          utilisateur: result.utilisateur
        });
      }
      
      pendingEnrollments.delete(userId);
    }
  }
  // Messages d'erreur
  else if (data.includes('Les empreintes ne correspondent pas') || 
           data.includes('Erreur lors de l\'enregistrement de l\'empreinte')) {
    const userId = Array.from(pendingEnrollments.keys()).find(
      key => pendingEnrollments.get(key).status === 'pending'
    );
    
    if (userId) {
      console.log(`Échec de l'enregistrement pour l'utilisateur ${userId}`);
      
      // Notifier le client via Socket.IO
      if (global.io) {
        global.io.emit("assignation_empreinte_status", {
          userId,
          status: "erreur",
          message: "Échec de l'enregistrement de l'empreinte digitale: " + data
        });
      }
      
      // Créer l'historique pour l'échec
      await creerHistorique({
        users_id: userId,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: `Échec de l'enregistrement de l'empreinte digitale: ${data}`,
        statut: 'erreur'
      });
      
      pendingEnrollments.delete(userId);
    }
  }
  // Messages d'étapes de l'enregistrement
  else if (data.includes('Placez votre doigt sur le capteur')) {
    const userId = Array.from(pendingEnrollments.keys()).find(
      key => pendingEnrollments.get(key).status === 'pending'
    );
    
    if (userId && global.io) {
      global.io.emit("assignation_empreinte_status", {
        userId,
        status: "etape",
        etape: "premiere_capture",
        message: "Placez votre doigt sur le capteur"
      });
    }
  }
  else if (data.includes('Placez le même doigt à nouveau')) {
    const userId = Array.from(pendingEnrollments.keys()).find(
      key => pendingEnrollments.get(key).status === 'pending'
    );
    
    if (userId && global.io) {
      global.io.emit("assignation_empreinte_status", {
        userId,
        status: "etape",
        etape: "seconde_capture",
        message: "Placez le même doigt à nouveau sur le capteur"
      });
    }
  }
};

// Vérifier une empreinte dans la base de données
const verifierEmpreinte = async (fingerprintID) => {
  try {
    // Rechercher un utilisateur avec cette empreinte
    const utilisateur = await Utilisateur.findOne({
      empreinteID: fingerprintID,
      actif: true // Vérifier que l'utilisateur est actif
    });
    
    if (!utilisateur) {
      console.log('Empreinte non autorisée:', fingerprintID);
      serialService.sendToArduino('ACCESS:DENIED');
      return;
    }
    
    // Créer un historique d'accès
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'acces',
      type_operation: 'porte',
      description: `Accès par empreinte digitale de ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: 'succès'
    });
    
    console.log('Accès autorisé pour:', utilisateur.nom, utilisateur.prenom);
    serialService.sendToArduino('ACCESS:GRANTED');
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'empreinte:', error);
    serialService.sendToArduino('ACCESS:DENIED');
  }
};

// Générer un nouvel ID d'empreinte
const genererNouvelIDEmpreinte = async () => {
  try {
    // Trouver le dernier ID utilisé
    const dernierUtilisateur = await Utilisateur.findOne({
      empreinteID: { $ne: null }
    }).sort({ empreinteID: -1 });
    
    // Commencer à partir de 1 ou incrémenter le dernier ID
    let dernierID = 0;
    
    if (dernierUtilisateur && dernierUtilisateur.empreinteID) {
      dernierID = parseInt(dernierUtilisateur.empreinteID);
      // Vérifier si la conversion a fonctionné
      if (isNaN(dernierID)) {
        dernierID = 0;
      }
    }
      
    // Vérifier que l'ID est dans la plage acceptable pour votre capteur
    const nouvelID = Math.min(dernierID + 1, 127); // 127 est généralement la limite
    
    return nouvelID.toString();
  } catch (error) {
    console.error('Erreur genererNouvelIDEmpreinte:', error);
    // Valeur par défaut en cas d'erreur
    return "1";
  }
};

// Déclencher l'enregistrement d'une empreinte
const declencherEnregistrement = async (userId) => {
  try {
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findById(userId);
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Vérifier si l'utilisateur a déjà une empreinte enregistrée
    if (utilisateur.empreinteID) {
      throw new Error('Cet utilisateur a déjà une empreinte digitale enregistrée');
    }
    
    // Vérifier si le périphérique est connecté
    if (!isDeviceConnected()) {
      throw new Error('Le dispositif d\'empreinte digitale n\'est pas connecté');
    }
    
    // Générer automatiquement un ID d'empreinte
    const fingerprintID = await genererNouvelIDEmpreinte();
    
    // Vérifier si cet ID est déjà utilisé par un autre utilisateur
    const utilisateurExistant = await Utilisateur.findOne({ empreinteID: fingerprintID });
    if (utilisateurExistant) {
      throw new Error('L\'ID d\'empreinte généré est déjà utilisé par un autre utilisateur');
    }
    
    // Ajouter l'utilisateur à la liste des enregistrements en attente
    pendingEnrollments.set(userId, { 
      fingerprintID, 
      status: 'pending',
      timestamp: Date.now()
    });
    
    // Notifier immédiatement le démarrage de l'enregistrement
    if (global.io) {
      global.io.emit("assignation_empreinte_status", {
        userId,
        status: "demarrage",
        message: "Initialisation de l'enregistrement d'empreinte..."
      });
    }
    
    // Envoyer la commande d'enregistrement à l'Arduino
    const result = serialService.sendToArduino(`ENROLL ${fingerprintID}`);
    
    if (result) {
      // Créer l'historique pour la tentative d'assignation
      await creerHistorique({
        users_id: utilisateur._id,
        type_entite: 'utilisateur',
        type_operation: 'modif',
        description: `Tentative d'assignation de l'empreinte digitale ${fingerprintID} à l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
        statut: 'en cours'
      });
    } else {
      // Supprimer de la liste des enrollments en cas d'échec
      pendingEnrollments.delete(userId);
      throw new Error('Erreur de communication avec l\'Arduino');
    }
    
    return {
      success: result,
      message: result ? 'Enregistrement d\'empreinte déclenché' : 'Erreur de communication avec l\'Arduino',
      fingerprintID
    };
  } catch (error) {
    console.error('Erreur declencherEnregistrement:', error);
    
    // Notifier l'erreur
    if (global.io) {
      global.io.emit("assignation_empreinte_status", {
        userId,
        status: "erreur",
        message: error.message
      });
    }
    
    return {
      success: false,
      message: error.message
    };
  }
};

// Confirmer l'enregistrement d'une empreinte
const confirmerEnregistrement = async (userId, fingerprintID) => {
  try {
    // Mettre à jour l'utilisateur avec l'ID d'empreinte
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      userId,
      { 
        empreinteID: fingerprintID,
        date_modif: Date.now()
      },
      { new: true }
    );
    
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Créer l'historique pour l'assignation
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Empreinte digitale ${fingerprintID} assignée à l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: 'succès'
    });
    
    return {
      success: true,
      message: 'Empreinte enregistrée avec succès',
      utilisateur
    };
  } catch (error) {
    console.error('Erreur confirmerEnregistrement:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Supprimer une empreinte
// Supprimer une empreinte
const supprimerEmpreinte = async (userId) => {
  try {
    const utilisateur = await Utilisateur.findById(userId);
    
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }
    
    if (!utilisateur.empreinteID) {
      throw new Error('Cet utilisateur n\'a pas d\'empreinte digitale assignée');
    }
    
    // Envoyer la commande de suppression à l'Arduino
    const fingerprintID = utilisateur.empreinteID;
    
    // Si le périphérique n'est pas connecté, on supprime quand même l'empreinte de la BDD
    if (!isDeviceConnected()) {
      console.warn('Le dispositif d\'empreinte n\'est pas connecté. Suppression de l\'empreinte uniquement dans la base de données.');
    } else {
      serialService.sendToArduino(`DELETE ${fingerprintID}`);
    }
    
    // Problème d'index unique sur empreinteID null - utiliser $unset au lieu d'assigner null
    // Cette méthode supprime le champ au lieu de lui assigner la valeur null
    await Utilisateur.updateOne(
      { _id: userId },
      { 
        $unset: { empreinteID: "" },
        $set: { date_modif: Date.now() }
      }
    );
    
    // Récupérer l'utilisateur mis à jour pour le retourner
    const utilisateurMisAJour = await Utilisateur.findById(userId);
    
    // Créer l'historique pour la désassignation
    await creerHistorique({
      users_id: utilisateur._id,
      type_entite: 'utilisateur',
      type_operation: 'modif',
      description: `Empreinte digitale désassignée de l'utilisateur ${utilisateur.nom} ${utilisateur.prenom}`,
      statut: 'succès'
    });
    
    // Notifier le client via Socket.IO
    if (global.io) {
      global.io.emit("desassignation_empreinte_status", {
        userId,
        status: "succes",
        message: "Empreinte digitale désassignée avec succès",
        utilisateur: utilisateurMisAJour
      });
    }
    
    return {
      success: true,
      message: 'Empreinte supprimée avec succès',
      utilisateur: utilisateurMisAJour
    };
  } catch (error) {
    console.error('Erreur supprimerEmpreinte:', error);
    
    // Notifier le client de l'erreur
    if (global.io) {
      global.io.emit("desassignation_empreinte_status", {
        userId,
        status: "erreur",
        message: error.message
      });
    }
    
    return {
      success: false,
      message: error.message
    };
  }
};

// Obtenir le statut d'un enregistrement d'empreinte
const getEnrollmentStatus = (userId) => {
  if (pendingEnrollments.has(userId)) {
    const { status, timestamp, fingerprintID } = pendingEnrollments.get(userId);
    return {
      status,
      timestamp,
      fingerprintID,
      timeElapsed: Date.now() - timestamp
    };
  }
  
  return null;
};

// Vérifier si le périphérique est connecté
const isDeviceConnected = () => {
  return serialService.isDeviceConnected();
};

// Nettoyer les enregistrements expirés
setInterval(() => {
  const now = Date.now();
  const expirationTime = 5 * 60 * 1000; // 5 minutes
  
  for (const [userId, data] of pendingEnrollments.entries()) {
    if (now - data.timestamp > expirationTime) {
      console.log(`Enregistrement expiré pour l'utilisateur ${userId}`);
      
      // Notifier le client via Socket.IO
      if (global.io) {
        global.io.emit("assignation_empreinte_status", {
          userId,
          status: "expire",
          message: "L'enregistrement d'empreinte a expiré"
        });
      }
      
      pendingEnrollments.delete(userId);
    }
  }
}, 60000); // Vérifier toutes les minutes

module.exports = {
  init,
  declencherEnregistrement,
  supprimerEmpreinte,
  getEnrollmentStatus,
  isDeviceConnected
};