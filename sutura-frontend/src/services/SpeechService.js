// /**
//  * SpeechService.js
//  * Service centralisé pour la synthèse vocale dans l'application Sutura Energie
//  */

// class SpeechService {
//     constructor() {
//       this.isAvailable = 'speechSynthesis' in window;
//       this.voices = [];
//       this.isSpeaking = false;
//       this.defaultOptions = {
//         lang: 'fr-FR',
//         rate: 1.0,
//         pitch: 1.0, 
//         volume: 1.0
//       };
  
//       // Initialiser les voix si disponibles
//       if (this.isAvailable) {
//         this._loadVoices();
        
//         // Écouter les changements de voix disponibles (nécessaire pour Chrome)
//         window.speechSynthesis.onvoiceschanged = this._loadVoices.bind(this);
        
//         // Réinitialiser l'état si la synthèse est interrompue
//         setInterval(() => {
//           if (this.isSpeaking && !window.speechSynthesis.speaking) {
//             this.isSpeaking = false;
//           }
//         }, 100);
//       }
//     }
  
//     /**
//      * Charge les voix disponibles dans le navigateur
//      * @private
//      */
//     _loadVoices() {
//       this.voices = window.speechSynthesis.getVoices();
//     }
  
//     /**
//      * Récupère toutes les voix françaises disponibles
//      * @returns {Array} Liste des voix françaises
//      */
//     getFrenchVoices() {
//       return this.voices.filter(voice => voice.lang.includes('fr'));
//     }
  
//     /**
//      * Lit un texte à voix haute
//      * @param {string} text - Le texte à lire
//      * @param {Object} options - Options de configuration de la voix
//      * @returns {boolean} - true si la lecture a commencé, false sinon
//      */
//     speak(text, options = {}) {
//       if (!this.isAvailable) {
//         console.warn("La synthèse vocale n'est pas disponible sur ce navigateur.");
//         return false;
//       }
  
//       // Fusionner les options par défaut avec celles fournies
//       const finalOptions = { ...this.defaultOptions, ...options };
  
//       // Annuler toute synthèse vocale en cours
//       this.cancel();
  
//       // Créer un nouvel objet SpeechSynthesisUtterance
//       const utterance = new SpeechSynthesisUtterance(text);
      
//       // Appliquer les options
//       utterance.lang = finalOptions.lang;
//       utterance.rate = finalOptions.rate;
//       utterance.pitch = finalOptions.pitch;
//       utterance.volume = finalOptions.volume;
      
//       // Sélectionner une voix française si disponible et si aucune voix spécifique n'est demandée
//       if (!finalOptions.voice) {
//         const frenchVoices = this.getFrenchVoices();
//         if (frenchVoices.length > 0) {
//           utterance.voice = frenchVoices[0];
//         }
//       } else {
//         utterance.voice = finalOptions.voice;
//       }
  
//       // Gérer les événements
//       utterance.onstart = () => {
//         this.isSpeaking = true;
//         if (finalOptions.onStart) {
//           finalOptions.onStart();
//         }
//       };
  
//       utterance.onend = () => {
//         this.isSpeaking = false;
//         if (finalOptions.onEnd) {
//           finalOptions.onEnd();
//         }
//       };
  
//       utterance.onerror = (event) => {
//         this.isSpeaking = false;
//         console.error(`Erreur de synthèse vocale: ${event.error}`);
//         if (finalOptions.onError) {
//           finalOptions.onError(event);
//         }
//       };
  
//       // Lancer la synthèse vocale
//       window.speechSynthesis.speak(utterance);
//       return true;
//     }
  
//     /**
//      * Annule toute synthèse vocale en cours
//      */
//     cancel() {
//       if (this.isAvailable) {
//         window.speechSynthesis.cancel();
//         this.isSpeaking = false;
//       }
//     }
  
//     /**
//      * Pause la synthèse vocale en cours
//      */
//     pause() {
//       if (this.isAvailable && this.isSpeaking) {
//         window.speechSynthesis.pause();
//       }
//     }
  
//     /**
//      * Reprend la synthèse vocale en pause
//      */
//     resume() {
//       if (this.isAvailable) {
//         window.speechSynthesis.resume();
//       }
//     }
  
//     /**
//      * Vérifie si la synthèse vocale est en cours
//      * @returns {boolean} true si la synthèse est en cours, false sinon
//      */
//     isSpeakingNow() {
//       return this.isSpeaking;
//     }
  
//     /**
//      * Change les options par défaut du service
//      * @param {Object} newOptions - Nouvelles options par défaut
//      */
//     setDefaultOptions(newOptions) {
//       this.defaultOptions = { ...this.defaultOptions, ...newOptions };
//     }
  
//     /**
//      * Des phrases préenregistrées pour Sutura Energie
//      * Permet d'avoir une cohérence dans les messages vocaux
//      */
//     phrases = {
//       // Activation/désactivation des appareils
//       TOUS_APPAREILS_ACTIVES: "Tous les appareils ont été activés avec succès",
//       TOUS_APPAREILS_DESACTIVES: "Tous les appareils ont été désactivés avec succès",
//       ERREUR_CHANGEMENT_ETAT: "Une erreur est survenue lors du changement d'état des appareils",
      
//       // Alertes et notifications
//       ALERTE_CONSOMMATION: "Alerte: Pic de consommation détecté",
//       ALERTE_APPAREIL_ACTIF: "Alerte: Un appareil est actif depuis longtemps",
      
//       // Profil utilisateur
//       PROFIL_MIS_A_JOUR: "Votre profil a été mis à jour avec succès",
//       MOT_DE_PASSE_CHANGE: "Votre mot de passe a été modifié avec succès",
//       CARTE_DESACTIVEE: "Votre carte RFID a été désactivée avec succès",
      
//       // Messages génériques
//       BIENVENUE: "Bienvenue sur Sutura Energie",
//       CONNEXION_REUSSIE: "Connexion réussie. Bienvenue sur votre tableau de bord",
//       DECONNEXION: "Vous avez été déconnecté avec succès"
//     }
//   }
  
//   // Créer une instance unique du service
//   const speechService = new SpeechService();
  
//   // Exporter l'instance unique (pattern Singleton)
//   export default speechService;



/**
 * SpeechService.js
 * Service centralisé pour la synthèse vocale avec compatibilité Firefox améliorée
 */

class SpeechService {
    constructor() {
      this.isAvailable = 'speechSynthesis' in window;
      this.voices = [];
      this.isSpeaking = false;
      this.isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
      this.queue = [];
      this.isProcessingQueue = false;
      this.defaultOptions = {
        lang: 'fr-FR',
        rate: this.isFirefox ? 0.9 : 1.0, // Ralentir légèrement sur Firefox
        pitch: 1.0, 
        volume: 1.0
      };
  
      // Pour Firefox : éviter les coupures dues au garbage collector
      this.utteranceKeepAliveList = [];
  
      // Initialiser les voix si disponibles
      if (this.isAvailable) {
        this._loadVoices();
        
        // Écouter les changements de voix disponibles (nécessaire pour Chrome)
        window.speechSynthesis.onvoiceschanged = this._loadVoices.bind(this);
        
        // Correction du bug Firefox/Chrome où speechSynthesis se met en pause après 15 secondes
        setInterval(() => {
          if (window.speechSynthesis.speaking && !this.isFirefox) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
        
        // Réinitialiser l'état si la synthèse est interrompue
        setInterval(() => {
          if (this.isSpeaking && !window.speechSynthesis.speaking) {
            this.isSpeaking = false;
            this._processQueue();
          }
        }, 100);
      }
    }
  
    /**
     * Charge les voix disponibles dans le navigateur
     * @private
     */
    _loadVoices() {
      this.voices = window.speechSynthesis.getVoices();
    }
  
    /**
     * Traite la file d'attente des messages vocaux
     * @private
     */
    async _processQueue() {
      if (!this.isAvailable || this.isProcessingQueue || this.queue.length === 0) {
        return;
      }
  
      this.isProcessingQueue = true;
      
      // Si la synthèse vocale est actuellement en cours, attendons
      if (window.speechSynthesis.speaking) {
        this.isProcessingQueue = false;
        return;
      }
  
      const next = this.queue.shift();
      
      try {
        await this._speakImmediately(next.text, next.options);
        
        // Petite pause entre les messages pour Firefox
        if (this.isFirefox && this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Erreur de synthèse vocale:', error);
      } finally {
        this.isProcessingQueue = false;
        
        // S'il y a encore des éléments dans la file d'attente, continuons
        if (this.queue.length > 0) {
          setTimeout(() => this._processQueue(), 100);
        }
      }
    }
  
    /**
     * Récupère toutes les voix françaises disponibles
     * @returns {Array} Liste des voix françaises
     */
    getFrenchVoices() {
      return this.voices.filter(voice => voice.lang.includes('fr'));
    }
  
    /**
     * Ajoute un message à la file d'attente
     * @param {string} text - Le texte à lire
     * @param {Object} options - Options de configuration de la voix
     * @returns {boolean} - true si le message a été ajouté à la file d'attente
     */
    speak(text, options = {}) {
      if (!this.isAvailable) {
        console.warn("La synthèse vocale n'est pas disponible sur ce navigateur.");
        return false;
      }
  
      // Fusionner les options par défaut avec celles fournies
      const finalOptions = { ...this.defaultOptions, ...options };
  
      // Ajouter à la file d'attente
      this.queue.push({ text, options: finalOptions });
      
      // Démarrer le traitement de la file d'attente si ce n'est pas déjà en cours
      if (!this.isProcessingQueue) {
        this._processQueue();
      }
  
      return true;
    }
  
    /**
     * Fonction interne pour la lecture immédiate d'un message
     * @private
     * @param {string} text - Le texte à lire
     * @param {Object} options - Options de configuration de la voix
     * @returns {Promise} - Promise résolue quand la lecture est terminée
     */
    _speakImmediately(text, options) {
      return new Promise((resolve, reject) => {
        try {
          // Annuler toute synthèse vocale en cours
          window.speechSynthesis.cancel();
  
          // Créer un nouvel objet SpeechSynthesisUtterance
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Pour Firefox : conserver une référence pour éviter le garbage collection
          if (this.isFirefox) {
            this.utteranceKeepAliveList.push(utterance);
            if (this.utteranceKeepAliveList.length > 10) {
              this.utteranceKeepAliveList.shift();
            }
          }
          
          // Appliquer les options
          utterance.lang = options.lang;
          utterance.rate = options.rate;
          utterance.pitch = options.pitch;
          utterance.volume = options.volume;
          
          // Sélectionner une voix française si disponible et si aucune voix spécifique n'est demandée
          if (!options.voice) {
            const frenchVoices = this.getFrenchVoices();
            if (frenchVoices.length > 0) {
              // Pour Firefox, essayer d'utiliser une voix native si disponible
              if (this.isFirefox) {
                const nativeVoice = frenchVoices.find(v => !v.localService === false);
                utterance.voice = nativeVoice || frenchVoices[0];
              } else {
                utterance.voice = frenchVoices[0];
              }
            }
          } else {
            utterance.voice = options.voice;
          }
  
          // Gérer les événements
          utterance.onstart = () => {
            this.isSpeaking = true;
            if (options.onStart) {
              options.onStart();
            }
          };
  
          utterance.onend = () => {
            this.isSpeaking = false;
            if (options.onEnd) {
              options.onEnd();
            }
            resolve();
          };
  
          utterance.onerror = (event) => {
            this.isSpeaking = false;
            console.error(`Erreur de synthèse vocale: ${event.error}`);
            if (options.onError) {
              options.onError(event);
            }
            reject(event);
          };
  
          // Fragmenter le texte pour Firefox si nécessaire
          if (this.isFirefox && text.length > 100) {
            const chunks = this._splitTextIntoChunks(text);
            for (const chunk of chunks) {
              const chunkUtterance = new SpeechSynthesisUtterance(chunk);
              // Copier les propriétés
              chunkUtterance.lang = utterance.lang;
              chunkUtterance.rate = utterance.rate;
              chunkUtterance.pitch = utterance.pitch;
              chunkUtterance.volume = utterance.volume;
              chunkUtterance.voice = utterance.voice;
              
              // Seulement le dernier fragment doit résoudre la promesse
              if (chunk === chunks[chunks.length - 1]) {
                chunkUtterance.onend = utterance.onend;
                chunkUtterance.onerror = utterance.onerror;
              }
              
              this.utteranceKeepAliveList.push(chunkUtterance);
              window.speechSynthesis.speak(chunkUtterance);
            }
          } else {
            // Lancer la synthèse vocale normalement
            window.speechSynthesis.speak(utterance);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  
    /**
     * Divise un texte long en fragments plus petits pour Firefox
     * @private
     * @param {string} text - Texte à diviser
     * @returns {Array} - Tableau de fragments de texte
     */
    _splitTextIntoChunks(text) {
      // Diviser aux points, virgules, etc.
      const sentenceDelimiters = ['.', '!', '?', ';', ':', ','];
      let chunks = [];
      let currentChunk = '';
      
      // Division par phrases
      const sentences = text.split(/([.!?;:,])/);
      
      for (let i = 0; i < sentences.length; i++) {
        const part = sentences[i];
        
        // Si on ajoute cette partie, est-ce que ça dépasse la limite?
        if (currentChunk.length + part.length < 100) {
          currentChunk += part;
        } else {
          // Si le chunk actuel n'est pas vide, l'ajouter à la liste
          if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = part;
        }
        
        // Si c'est la dernière partie, ajouter le chunk en cours
        if (i === sentences.length - 1 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
        }
      }
      
      // S'il n'y a pas eu de division, revenir au texte original
      if (chunks.length === 0) {
        chunks = [text];
      }
      
      return chunks;
    }
  
    /**
     * Annule toute synthèse vocale en cours et vide la file d'attente
     */
    cancel() {
      if (this.isAvailable) {
        this.queue = [];
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
      }
    }
  
    /**
     * Pause la synthèse vocale en cours
     */
    pause() {
      if (this.isAvailable && this.isSpeaking) {
        window.speechSynthesis.pause();
      }
    }
  
    /**
     * Reprend la synthèse vocale en pause
     */
    resume() {
      if (this.isAvailable) {
        window.speechSynthesis.resume();
      }
    }
  
    /**
     * Vérifie si la synthèse vocale est en cours
     * @returns {boolean} true si la synthèse est en cours, false sinon
     */
    isSpeakingNow() {
      return this.isSpeaking;
    }
  
    /**
     * Change les options par défaut du service
     * @param {Object} newOptions - Nouvelles options par défaut
     */
    setDefaultOptions(newOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...newOptions };
    }
  
    /**
     * Des phrases préenregistrées pour Sutura Energie
     */
    phrases = {
      // Activation/désactivation des appareils
      TOUS_APPAREILS_ACTIVES: "Tous les appareils ont été activés avec succès",
      TOUS_APPAREILS_DESACTIVES: "Tous les appareils ont été désactivés avec succès",
      ERREUR_CHANGEMENT_ETAT: "Une erreur est survenue lors du changement d'état des appareils",
      
      // Alertes et notifications
      ALERTE_CONSOMMATION: "Alerte: Pic de consommation détecté",
      ALERTE_APPAREIL_ACTIF: "Alerte: Un appareil est actif depuis longtemps",
      
      // Profil utilisateur
      PROFIL_MIS_A_JOUR: "Votre profil a été mis à jour avec succès",
      MOT_DE_PASSE_CHANGE: "Votre mot de passe a été modifié avec succès",
      CARTE_DESACTIVEE: "Votre carte RFID a été désactivée avec succès",
      
      // Messages génériques
      BIENVENUE: "Bienvenue sur Sutura Energie",
      CONNEXION_REUSSIE: "Connexion réussie. Bienvenue sur votre tableau de bord",
      DECONNEXION: "Vous avez été déconnecté avec succès",

        // Dashboard Historique
    CONSOMMATION_SEMAINE_AFFICHAGE: "Affichage de la consommation hebdomadaire",
    CONSOMMATION_MOIS_AFFICHAGE: "Affichage de la consommation mensuelle",
    // CONSOMMATION_SEMAINE_CHARGEE: "Données de consommation hebdomadaire chargées",
    // CONSOMMATION_MOIS_CHARGEE: "Données de consommation mensuelle chargées",
    LOGS_AFFICHAGE: "Affichage des logs d'activité",
    LOGS_PAGE: "Page {0} des logs", // {0} sera remplacé par le numéro de page
    AUCUNE_DONNEE_SEMAINE: "Aucune donnée disponible pour cette semaine",
    AUCUNE_DONNEE_MOIS: "Aucune donnée disponible pour ce mois",
    ERREUR_CHARGEMENT: "Erreur lors du chargement des données de consommation"



    }
  }
  
  // Créer une instance unique du service
  const speechService = new SpeechService();
  
  // Exporter l'instance unique (pattern Singleton)
  export default speechService;