
// components/AccessModals.jsx
import { useState, useEffect } from 'react';
import { X, CreditCard, Fingerprint } from 'lucide-react';
import { utilisateurService } from '../services/utilisateurService';

// Modale principale de contrôle d'accès (reste inchangée)
export const AccessControlModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onOpenCardModal, 
  onOpenFingerprintModal,
  onDesassignerCarte,
  onSupprimerEmpreinte
}) => {
  if (!isOpen) return null;

  const hasCard = user && user.cardActive;
  const hasFingerprint = user && user.empreinteID;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Contrôle d'Accès</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-user-info">
            <div className="user-avatar12">
              {user.photo ? (
                <img src={user.photo} alt={`${user.prenom} ${user.nom}`} className="user-photo" />
              ) : (
                <div className="user-initials">
                  {user.nom && user.prenom ? `${user.prenom[0]}${user.nom[0]}` : 'NU'}
                </div>
              )}
            </div>
            <div className="user-details">
              <h3>{user.prenom} {user.nom}</h3>
              <p>{user.email}</p>
              <p className="user-role">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
          </div>
          
          <div className="access-methods">
            <div className="access-method-item">
              <div className="access-method-header">
                <CreditCard size={20} />
                <h4>Carte RFID</h4>
              </div>
              <div className="access-method-status">
                <span className={hasCard ? "status active" : "status inactive"}>
                  {hasCard ? 'Carte assignée' : 'Aucune carte'}
                </span>
              </div>
              <button 
                className={hasCard ? "danger-button" : "primary-button"}
                onClick={hasCard ? onDesassignerCarte : onOpenCardModal}
              >
                {hasCard ? 'Désassigner la carte' : 'Assigner une carte'}
              </button>
            </div>
            
            <div className="access-method-item">
              <div className="access-method-header">
                <Fingerprint size={20} />
                <h4>Empreinte Digitale</h4>
              </div>
              <div className="access-method-status">
                <span className={hasFingerprint ? "status active" : "status inactive"}>
                  {hasFingerprint ? 'Empreinte enregistrée' : 'Aucune empreinte'}
                </span>
              </div>
              <button 
                className={hasFingerprint ? "danger-button" : "primary-button"}
                onClick={hasFingerprint ? onSupprimerEmpreinte : onOpenFingerprintModal}
              >
                {hasFingerprint ? 'Supprimer l\'empreinte' : 'Enregistrer une empreinte'}
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

// Modale d'assignation de carte RFID (modifiée pour l'assignation en temps réel)
export const CardAssignmentModal = ({ isOpen, onClose, user, onAssignCard }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'pending', 'success', 'error'
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    let unsubscribe;
    
    if (isOpen) {
      // S'abonner aux mises à jour de statut RFID
      unsubscribe = utilisateurService.abonnerStatutAssignationRFID((data) => {
        console.log('Statut reçu:', data);
        
        if (data.status === 'en_attente') {
          setStatus('pending');
          setMessage('En attente de présentation d\'une carte RFID...');
        } 
        else if (data.status === 'succes') {
          setStatus('success');
          setMessage('Carte RFID assignée avec succès!');
          
          // Fermer la modale après un délai
          setTimeout(() => {
            onClose();
            window.location.reload(); // Recharger pour voir les changements
          }, 1500);
        } 
        else if (data.status === 'erreur') {
          setStatus('error');
          setMessage(data.message || 'Erreur lors de l\'assignation');
        }
      });
    }
    
    // Nettoyer l'abonnement à la démontage
    return () => {
      if (unsubscribe) unsubscribe();
      
      // Annuler l'assignation si en cours
      if (status === 'pending') {
        utilisateurService.annulerAssignationRFID();
      }
    };
  }, [isOpen, status, onClose]);
  
  const startAssignment = async () => {
    try {
      setStatus('pending');
      setMessage('Initialisation du lecteur RFID...');
      
      await utilisateurService.demarrerAssignationRFIDEnTempsReel(user.id || user._id);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Erreur lors du démarrage de l\'assignation');
    }
  };
  
  const cancelAssignment = () => {
    utilisateurService.annulerAssignationRFID();
    setStatus('idle');
    setMessage('');
  };
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Assignation de Carte RFID</h2>
          <button className="close-button" onClick={status === 'pending' ? cancelAssignment : onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <div className="card-assignment-content">
            <div className="card-icon">
              <CreditCard size={48} />
            </div>
            <div className="assignment-instructions">
              <h3>Assigner une nouvelle carte</h3>
              {status === 'idle' && (
                <p>Pour assigner une carte RFID à <strong>{user.prenom} {user.nom}</strong>, cliquez sur "Démarrer l'assignation" puis présentez la carte au lecteur.</p>
              )}
              
              {status === 'pending' && (
                <div className="pending-indicator">
                  <div className="spinner"></div>
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'success' && (
                <div className="success-message">
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="error-message">
                  <p>{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={status === 'pending' ? cancelAssignment : onClose}>
            {status === 'pending' ? 'Annuler' : 'Fermer'}
          </button>
          {status === 'idle' && (
            <button className="assign-button" onClick={startAssignment}>
              Démarrer l'assignation
            </button>
          )}
          {status === 'error' && (
            <button className="assign-button" onClick={startAssignment}>
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Modale d'enregistrement d'empreinte digitale (modifiée pour l'enregistrement en temps réel)
export const FingerprintModal = ({ isOpen, onClose, user, onSaveFingerprint }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'pending', 'success', 'error'
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(0); // 0: init, 1: premier scan, 2: second scan, 3: confirmé
  
  useEffect(() => {
    let unsubscribe;
    
    if (isOpen) {
      // S'abonner aux mises à jour de statut d'empreinte
      unsubscribe = utilisateurService.abonnerStatutAssignationEmpreinte((data) => {
        if (data.userId && data.userId !== (user.id || user._id)) {
          return; // Ignorer les mises à jour pour d'autres utilisateurs
        }
        
        console.log('Statut empreinte:', data);
        
        // Gérer les messages directement depuis l'Arduino
        if (data.message) {
          if (data.message.includes('PLACE_FINGER')) {
            setStatus('pending');
            setStep(1);
            setMessage('Placez votre doigt sur le capteur');
            return;
          } else if (data.message.includes('REMOVE_FINGER')) {
            setStatus('pending');
            setStep(2);
            setMessage('Retirez votre doigt du capteur');
            return;
          } else if (data.message.includes('SUCCESS')) {
            setStatus('success');
            setStep(3);
            setMessage('Empreinte enregistrée avec succès!');
            
            // Fermer la modale après un délai
            setTimeout(() => {
              onClose();
              window.location.reload(); // Recharger pour voir les changements
            }, 1500);
            return;
          }
        }
        
        // Gestion des statuts génériques
        if (data.status === 'demarrage' || data.status === 'en_cours') {
          setStatus('pending');
          setMessage(data.message || 'Initialisation du capteur d\'empreinte...');
        }
        else if (data.status === 'etape') {
          setStatus('pending');
          
          if (data.etape === 'premiere_capture') {
            setStep(1);
            setMessage(data.message || 'Placez votre doigt sur le capteur');
          } else if (data.etape === 'seconde_capture') {
            setStep(2);
            setMessage(data.message || 'Placez le même doigt à nouveau sur le capteur');
          }
        }
        else if (data.status === 'succes') {
          setStatus('success');
          setStep(3);
          setMessage(data.message || 'Empreinte enregistrée avec succès!');
          
          // Fermer la modale après un délai
          setTimeout(() => {
            onClose();
            window.location.reload(); // Recharger pour voir les changements
          }, 1500);
        }
        else if (data.status === 'erreur' || data.status === 'expire') {
          setStatus('error');
          setMessage(data.message || 'Erreur lors de l\'enregistrement');
        }
      });
    }
    
    // Nettoyer l'abonnement à la fermeture
    return () => {
      if (unsubscribe) unsubscribe();

      // Annuler l'enregistrement si en cours
      if (status === 'pending') {
        utilisateurService.annulerAssignationEmpreinte();
      }
    };
  }, [isOpen, user, onClose, status]);
  
  const startEnrollment = async () => {
    try {
      setStatus('pending');
      setStep(0);
      setMessage('Démarrage de l\'enregistrement...');
      
      await utilisateurService.demarrerAssignationEmpreinteEnTempsReel(user.id || user._id);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Erreur lors du démarrage de l\'enregistrement');
    }
  };
  
  
  if (!isOpen) return null;
  

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Enregistrement d'Empreinte Digitale</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <div className="fingerprint-content">
            <div className="fingerprint-icon">
              <Fingerprint size={48} />
            </div>
            <div className="fingerprint-instructions">
              <h3>Enregistrer une empreinte digitale</h3>
              
              {status === 'idle' && (
                <p>Pour enregistrer l'empreinte digitale de <strong>{user.prenom} {user.nom}</strong>, cliquez sur "Démarrer l'enregistrement" puis suivez les instructions.</p>
              )}
              
              {status === 'pending' && (
                <>
                  <div className="enrollment-steps">
                    <div className={`step ${step >= 0 ? 'active' : ''}`}>Préparation</div>
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>Premier scan</div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>Second scan</div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>Confirmation</div>
                  </div>
                  <div className="pending-indicator">
                    <div className="spinner"></div>
                    <p>{message}</p>
                  </div>
                </>
              )}
              
              {status === 'success' && (
                <div className="success-message">
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="error-message">
                  <p>{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Fermer
          </button>
          {status === 'idle' && (
            <button className="assign-button" onClick={startEnrollment}>
              Démarrer l'enregistrement
            </button>
          )}
          {status === 'error' && (
            <button className="assign-button" onClick={startEnrollment}>
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};